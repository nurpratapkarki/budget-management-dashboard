import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, formatCategory } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { ExpenseBarChart } from "@/components/dashboard/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/dashboard/ExpenseLineChart";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { expensesService } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const Expenses: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll
  });
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['monthlyExpenses'] });
    queryClient.invalidateQueries({ queryKey: ['expensesByCategory'] });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="table">Recent Expenses</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No expenses found.</p>
                  <p className="text-sm mt-2">
                    Click the "Add Expense" button to start tracking your expenses.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.slice(0, 5).map((expense: any) => (
                      <TableRow key={expense.id} className="group hover:bg-muted/50">
                        <TableCell>{formatDate(new Date(expense.date), 'MMM dd')}</TableCell>
                        <TableCell>
                          <span className="capitalize">{formatCategory(expense.category)}</span>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="grid gap-6 md:grid-cols-2">
            <ExpenseBarChart className="h-full" />
            <ExpensePieChart className="h-full" />
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends</CardTitle>
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

export default Expenses;
