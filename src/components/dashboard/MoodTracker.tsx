import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@tremor/react";
import { format, subDays } from "date-fns";
import { Heart, Meh, Frown, ThumbsUp, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { moodsService } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Define mood types
type Mood = 'happy' | 'good' | 'neutral' | 'bad' | 'awful';

interface MoodData {
  id?: string;
  user_id?: string;
  mood: Mood;
  date: string;
  created_at?: string;
}

// Map mood values to emoji components
const moodEmojis = {
  happy: <Heart className="text-pink-500" />,
  good: <ThumbsUp className="text-green-500" />,
  neutral: <Meh className="text-yellow-500" />,
  bad: <Frown className="text-orange-500" />,
  awful: <Frown className="text-red-500" />,
};

// Map mood values to colors for chart
const moodColors = {
  happy: "#ec4899", // pink
  good: "#22c55e", // green
  neutral: "#eab308", // yellow
  bad: "#f97316", // orange
  awful: "#ef4444", // red
};

// Map mood values to numerical scores for analysis
const moodScores = {
  happy: 5,
  good: 4,
  neutral: 3,
  bad: 2,
  awful: 1,
};

export function MoodTracker() {
  const [moods, setMoods] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setIsLoading(true);
        const data = await moodsService.getAll();
        setMoods(data || []);
      } catch (error) {
        console.error("Failed to fetch moods:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoods();
  }, []);

  // Get today's date in format "YYYY-MM-DD"
  const today = new Date().toISOString().split("T")[0];
  // Get yesterday's date in format "YYYY-MM-DD"
  const yesterday = subDays(new Date(), 1).toISOString().split("T")[0];

  // Find today's and yesterday's moods
  const todayMood = moods.find((mood) => mood.date === today)?.mood;
  const yesterdayMood = moods.find((mood) => mood.date === yesterday)?.mood;

  // Get the last 7 days of moods for the chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), i).toISOString().split("T")[0];
    const mood = moods.find((m) => m.date === date);
    const moodScore = mood ? moodScores[mood.mood] : 0;
    
    return {
      date: format(new Date(date), "EEE"),
      value: moodScore,
      mood: mood?.mood || "no data",
    };
  }).reverse();

  // Calculate trend based on average mood change
  useEffect(() => {
    if (last7Days.length > 0) {
      const recentDays = last7Days.filter(day => day.value > 0).slice(-3);
      if (recentDays.length >= 2) {
        const firstAvg = recentDays.slice(0, Math.ceil(recentDays.length / 2))
          .reduce((sum, day) => sum + day.value, 0) / Math.ceil(recentDays.length / 2);
        const secondAvg = recentDays.slice(-Math.floor(recentDays.length / 2))
          .reduce((sum, day) => sum + day.value, 0) / Math.floor(recentDays.length / 2);
        
        if (secondAvg - firstAvg > 0.5) setTrend('up');
        else if (firstAvg - secondAvg > 0.5) setTrend('down');
        else setTrend('stable');
      }
    }
  }, [moods]);

  // Chart data for visualization
  const chartData = last7Days.map(day => {
    const dataPoint = { name: day.date };
    if (day.mood !== "no data") {
      dataPoint[day.mood] = day.value;
    }
    return dataPoint;
  });

  const getAverageMoodText = () => {
    const validMoods = last7Days.filter(day => day.value > 0);
    if (validMoods.length === 0) return "No data yet";
    
    const average = validMoods.reduce((sum, day) => sum + day.value, 0) / validMoods.length;
    if (average > 4.5) return "Excellent";
    if (average > 3.5) return "Good";
    if (average > 2.5) return "Average";
    if (average > 1.5) return "Below average";
    return "Poor";
  };

  const getTrendBadge = () => {
    if (trend === 'up') {
      return <Badge className="bg-green-500 hover:bg-green-600">Improving <TrendingUp className="ml-1 h-3 w-3" /></Badge>;
    } else if (trend === 'down') {
      return <Badge className="bg-red-500 hover:bg-red-600">Declining <TrendingUp className="ml-1 h-3 w-3 rotate-180" /></Badge>;
    }
    return <Badge className="bg-blue-500 hover:bg-blue-600">Stable</Badge>;
  };

  return (
    <Card className="col-span-3 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">Mood Tracker</CardTitle>
            <CardDescription>Track your daily emotional wellbeing</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium mr-1">7-day trend:</span>
            {isLoading ? <Skeleton className="w-24 h-6" /> : getTrendBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-4 transition-transform hover:scale-105">
                <p className="text-sm font-semibold mb-2">Today</p>
                <div className="flex items-center">
                  <div className="mr-3 rounded-full bg-background p-2 shadow-sm">
                    {todayMood ? moodEmojis[todayMood] : <Meh className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-lg font-bold capitalize">{todayMood || "Not recorded"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(), "PPPP")}</p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 transition-transform hover:scale-105">
                <p className="text-sm font-semibold mb-2">Yesterday</p>
                <div className="flex items-center">
                  <div className="mr-3 rounded-full bg-background p-2 shadow-sm">
                    {yesterdayMood ? moodEmojis[yesterdayMood] : <Meh className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-lg font-bold capitalize">{yesterdayMood || "Not recorded"}</p>
                    <p className="text-xs text-muted-foreground">{format(subDays(new Date(), 1), "PPPP")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 flex flex-col justify-center items-center">
            <p className="text-sm font-semibold mb-2">Weekly Average</p>
            {isLoading ? (
              <Skeleton className="h-12 w-24 rounded-md" />
            ) : (
              <>
                <p className="text-xl font-bold">{getAverageMoodText()}</p>
                <div className="flex mt-2">
                  {Object.entries(moodEmojis).map(([mood, emoji], index) => (
                    <div key={mood} className="opacity-40 first:opacity-100 last:opacity-10">
                      {emoji}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 h-[180px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          ) : (
            <BarChart
              data={chartData}
              index="name"
              categories={Object.keys(moodColors).filter(mood => 
                last7Days.some(day => day.mood === mood)
              )}
              colors={Object.values(moodColors)}
              showYAxis={false}
              showLegend={true}
              showGridLines={false}
              showAnimation={true}
              className="h-full"
            />
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {Object.entries(moodEmojis).map(([mood, emoji]) => (
            <div key={mood} className="flex items-center text-xs text-muted-foreground">
              <div className="mr-1 h-3 w-3">{emoji}</div>
              <span className="capitalize">{mood}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}