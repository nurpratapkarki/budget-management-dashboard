
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpenseBarChart } from "@/components/dashboard/ExpenseBarChart";

const Budgets: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Budget
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseBarChart />
        <BudgetProgress />
      </div>
    </div>
  );
};

export default Budgets;
