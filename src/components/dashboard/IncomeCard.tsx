import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { incomeService } from "@/lib/supabase";
import { IncomeForm } from "@/components/forms/IncomeForm";

interface IncomeCardProps {
  className?: string;
}

export function IncomeCard({ className }: IncomeCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: incomeService.getAll
  });

  const { data: totalMonthlyIncome = 0 } = useQuery({
    queryKey: ['totalIncome'],
    queryFn: incomeService.getTotalIncome
  });

  const handleAddSuccess = () => {
    setIsOpen(false);
    setEditingIncome(null);
    queryClient.invalidateQueries({ queryKey: ['incomes'] });
    queryClient.invalidateQueries({ queryKey: ['totalIncome'] });
  };

  const handleEdit = (income: any) => {
    setEditingIncome(income);
    setIsOpen(true);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Income Sources</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setEditingIncome(null)}
            >
              <span className="sr-only">Add income source</span>
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <IncomeForm
              income={editingIncome}
              onSuccess={handleAddSuccess}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(totalMonthlyIncome)}/month</div>
        <p className="text-xs text-muted-foreground">Total monthly income</p>
        
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading income data...</div>
          ) : incomes.length > 0 ? (
            incomes.map((income: any) => {
              let displayAmount = Number(income.amount);
              let periodLabel = '';
              
              // Handle different period types for display
              if (income.period === 'weekly') {
                periodLabel = '/week';
              } else if (income.period === 'monthly') {
                periodLabel = '/month';
              } else if (income.period === 'yearly') {
                periodLabel = '/year';
              }
              
              return (
                <div key={income.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div>
                    <div className="font-medium">{income.source || 'Income'}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(displayAmount)}{periodLabel}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(income)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground">
              No income sources added. Click the + button to add your first income source.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 