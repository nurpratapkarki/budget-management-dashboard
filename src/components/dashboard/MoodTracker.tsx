
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockMoods, moodDistributionData } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";

const moodEmojis: Record<string, string> = {
  happy: "😄",
  neutral: "😐",
  sad: "😔",
  stressed: "😩",
  excited: "🤩",
};

export const MoodTracker: React.FC<{ className?: string }> = ({ className }) => {
  // Get mood for today and yesterday
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayMood = mockMoods.find(
    (m) => format(m.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );
  
  const yesterdayMood = mockMoods.find(
    (m) => format(m.date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
  );
  
  // Recent moods data for chart
  const recentMoods = mockMoods.slice(0, 7).map(mood => ({
    date: format(mood.date, 'MMM dd'),
    mood: mood.mood,
    value: mood.mood === 'happy' || mood.mood === 'excited' ? 5 : 
           mood.mood === 'neutral' ? 3 : 1
  })).reverse();
  
  return (
    <Card className={cn("card-hover h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Mood Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-6">
          <div className="text-center">
            <div className="text-4xl mb-1">
              {todayMood ? moodEmojis[todayMood.mood] : "❓"}
            </div>
            <div className="text-sm text-muted-foreground">Today</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-1">
              {yesterdayMood ? moodEmojis[yesterdayMood.mood] : "❓"}
            </div>
            <div className="text-sm text-muted-foreground">Yesterday</div>
          </div>
        </div>
        
        <div className="h-32 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentMoods}>
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickMargin={5}
              />
              <Tooltip 
                formatter={(value, name) => {
                  const mood = recentMoods.find(m => m.value === value)?.mood;
                  return [mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : '', 'Mood'];
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#4CAF50"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
