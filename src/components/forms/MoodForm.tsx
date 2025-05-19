
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoodType } from "@/lib/types";
import { moodsService } from "@/lib/supabase";
import { toast } from "sonner";

const formSchema = z.object({
  mood: z.enum(["happy", "neutral", "sad", "stressed", "excited"]),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const moodEmojis: Record<MoodType, string> = {
  happy: "😄",
  neutral: "😐", 
  sad: "😔",
  stressed: "😩",
  excited: "🤩",
};

export function MoodForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "neutral",
      note: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await moodsService.create({
        mood: values.mood,
        note: values.note || "",
        date: new Date().toISOString(),
      });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting mood:", error);
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h2 className="text-xl font-semibold mb-4">Record Today's Mood</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How are you feeling today?</FormLabel>
                <div className="flex justify-center gap-4 mb-4">
                  {Object.entries(moodEmojis).map(([mood, emoji]) => (
                    <Button
                      key={mood}
                      type="button"
                      variant={field.value === mood ? "default" : "outline"}
                      className={cn(
                        "h-16 w-16 text-3xl",
                        field.value === mood && "ring-2 ring-primary"
                      )}
                      onClick={() => field.onChange(mood)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <SelectItem key={mood} value={mood} className="capitalize">
                        {emoji} {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Add any notes about your mood..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">Record Mood</Button>
        </form>
      </Form>
    </div>
  );
}

import { cn } from "@/lib/utils";
