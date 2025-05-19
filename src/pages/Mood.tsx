import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MoodTracker } from '@/components/dashboard/MoodTracker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Smile, Meh, Frown, Heart, ThumbsUp, Calendar } from 'lucide-react';
import { moodsService } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Mood = 'happy' | 'good' | 'neutral' | 'bad' | 'awful';

const moodIcons = {
  happy: { icon: Heart, color: 'text-pink-500' },
  good: { icon: ThumbsUp, color: 'text-green-500' },
  neutral: { icon: Meh, color: 'text-yellow-500' },
  bad: { icon: Frown, color: 'text-orange-500' },
  awful: { icon: Frown, color: 'text-red-500' },
};

export default function MoodPage() {
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: moods = [], isLoading } = useQuery({
    queryKey: ['moods'],
    queryFn: moodsService.getAll
  });

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    try {
      await moodsService.create({
        mood: selectedMood,
        date: new Date().toISOString().split('T')[0]
      });

      toast({
        title: 'Mood recorded',
        description: 'Your mood has been recorded successfully.',
      });
      
      setOpen(false);
      setSelectedMood(null);
      queryClient.invalidateQueries({ queryKey: ['moods'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record mood.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate mood statistics for the current month
  const getMoodStats = () => {
    if (!moods.length) return { totalEntries: 0, topMood: null, averageScore: 0 };

    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    const lastDayOfMonth = endOfMonth(today);
    
    const thisMonthMoods = moods.filter((mood: any) => {
      const moodDate = parseISO(mood.date);
      return moodDate >= firstDayOfMonth && moodDate <= lastDayOfMonth;
    });
    
    if (!thisMonthMoods.length) return { totalEntries: 0, topMood: null, averageScore: 0 };
    
    const moodCounts: Record<string, number> = {};
    let totalScore = 0;
    
    const moodScores = {
      happy: 5,
      good: 4,
      neutral: 3,
      bad: 2,
      awful: 1
    };
    
    thisMonthMoods.forEach((mood: any) => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
      totalScore += moodScores[mood.mood as keyof typeof moodScores] || 3;
    });
    
    const topMood = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)
      .shift()?.[0] as Mood || null;
      
    return {
      totalEntries: thisMonthMoods.length,
      topMood,
      averageScore: totalScore / thisMonthMoods.length
    };
  };
  
  const { totalEntries, topMood, averageScore } = getMoodStats();
  
  const getMoodDescription = (score: number): string => {
    if (score > 4.5) return 'Excellent';
    if (score > 3.5) return 'Good';
    if (score > 2.5) return 'Average';
    if (score > 1.5) return 'Below average';
    return 'Poor';
  };

  return (
    <div className="container mx-auto py-4 space-y-8 mb-20">
      <PageHeader 
        heading="Mood Tracker" 
        text="Track and visualize your daily emotional wellbeing" 
      />
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Mood Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodTracker />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-4">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <p className="text-lg font-bold">{totalEntries}</p>
                <p className="text-xs text-center text-muted-foreground">Entries this month</p>
              </div>
              
              <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-4">
                {topMood ? (
                  <>
                    {React.createElement(moodIcons[topMood].icon, {
                      className: `h-8 w-8 ${moodIcons[topMood].color} mb-2`
                    })}
                    <p className="text-lg font-bold capitalize">{topMood}</p>
                    <p className="text-xs text-center text-muted-foreground">Most common mood</p>
                  </>
                ) : (
                  <>
                    <Meh className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-lg font-bold">No data</p>
                    <p className="text-xs text-center text-muted-foreground">Not enough entries</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-1">Monthly Average</p>
              <p className="text-xl font-bold">
                {totalEntries > 0 ? getMoodDescription(averageScore) : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your recorded moods
              </p>
            </div>
            
            <Button onClick={() => setOpen(true)} className="w-full">
              Record Today's Mood
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How are you feeling today?</DialogTitle>
            <DialogDescription>
              Select the mood that best describes how you're feeling today.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 py-4">
            {(Object.keys(moodIcons) as Mood[]).map((mood) => {
              const { icon: Icon, color } = moodIcons[mood];
              return (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? "default" : "outline"}
                  className="flex flex-col items-center p-4 h-auto"
                  onClick={() => setSelectedMood(mood)}
                >
                  <Icon className={`h-8 w-8 mb-2 ${color}`} />
                  <span className="capitalize">{mood}</span>
                </Button>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Mood'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 