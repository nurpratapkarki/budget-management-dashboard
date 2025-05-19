
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpenseBarChart } from "@/components/dashboard/ExpenseBarChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BudgetForm } from "@/components/forms/BudgetForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseLineChart } from "@/components/dashboard/ExpenseLineChart";

const Budgets: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <BudgetForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="progress">Budget Progress</TabsTrigger>
          <TabsTrigger value="expenses">Expense Categories</TabsTrigger>
          <TabsTrigger value="trends">Spending Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <div className="grid gap-6 md:grid-cols-2">
            <BudgetProgress />
            <Card>
              <CardHeader>
                <CardTitle>Budget Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">50/30/20 Rule</h3>
                    <p>Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Zero-Based Budgeting</h3>
                    <p>Assign every dollar a purpose. Your income minus your expenses should equal zero.</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Emergency Fund</h3>
                    <p>Build an emergency fund to cover 3-6 months of expenses for unexpected situations.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses">
          <ExpenseBarChart />
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ExpenseLineChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Budgets;
