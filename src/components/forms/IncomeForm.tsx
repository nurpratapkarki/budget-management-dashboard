import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incomeService } from "@/lib/supabase";
import { toast } from "sonner";
import { DbIncome } from "@/lib/types";

const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  source: z.string().optional(),
  period: z.enum(["weekly", "monthly", "yearly"]),
});

type FormValues = z.infer<typeof formSchema>;

type IncomeFormProps = {
  income?: Partial<DbIncome>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function IncomeForm({ income, onSuccess, onCancel }: IncomeFormProps) {
  const isEditing = !!income?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: income?.amount ? Number(income.amount) : 0,
      source: income?.source || "",
      period: (income?.period as "weekly" | "monthly" | "yearly") || "monthly",
    },
  });

  useEffect(() => {
    if (income) {
      form.reset({
        amount: income.amount ? Number(income.amount) : 0,
        source: income.source || "",
        period: (income.period as "weekly" | "monthly" | "yearly") || "monthly",
      });
    }
  }, [income, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && income?.id) {
        await incomeService.update(income.id, {
          amount: values.amount,
          source: values.source,
          period: values.period,
        });
      } else {
        await incomeService.create({
          amount: values.amount,
          source: values.source,
          period: values.period,
        });
      }

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting income:", error);
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit" : "Add"} Income</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Salary, Freelance, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">{isEditing ? "Update" : "Add"} Income</Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 