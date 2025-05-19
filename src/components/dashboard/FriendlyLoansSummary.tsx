import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowRightLeft, TrendingUp, TrendingDown, Banknote } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { friendlyLoansService } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/helpers';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface FriendlyLoansSummaryProps {
  className?: string;
}

export function FriendlyLoansSummary({ className }: FriendlyLoansSummaryProps) {
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['friendlyLoansSummary', 'dashboardStats'], // Listen to dashboardStats for refresh
    queryFn: friendlyLoansService.getAllLoans,
  });

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> Friendly Loans
          </CardTitle>
          <CardDescription>Summary of your informal loans.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const loansTaken = loans.filter((loan: any) => loan.type === 'taken');
  const loansGiven = loans.filter((loan: any) => loan.type === 'given');

  const totalDebt = loansTaken.reduce((sum: number, loan: any) => {
    const repaid = (loan.repayments || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    return sum + (Number(loan.amount) - repaid);
  }, 0);

  const totalLent = loansGiven.reduce((sum: number, loan: any) => {
    const repaid = (loan.repayments || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    return sum + (Number(loan.amount) - repaid);
  }, 0);
  
  const pendingLoans = loans.filter((loan:any) => loan.status === 'pending' || loan.status === 'partially_paid').length;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" /> Friendly Loans
        </CardTitle>
        <CardDescription>Overview of loans with friends.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-red-500/10 rounded-lg">
                <TrendingDown className="mx-auto h-6 w-6 text-red-500 mb-1"/>
                <p className="text-xs text-muted-foreground">You Owe</p>
                <p className="text-lg font-bold">{formatCurrency(totalDebt)}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="mx-auto h-6 w-6 text-green-500 mb-1"/>
                <p className="text-xs text-muted-foreground">Owed to You</p>
                <p className="text-lg font-bold">{formatCurrency(totalLent)}</p>
            </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-primary"/>
                <p className="text-sm font-medium">Pending Loans</p>
            </div>
            <p className="text-sm font-bold">{pendingLoans} transaction{pendingLoans !== 1 ? 's' : ''}</p>
        </div>
        
        {loans.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
                No friendly loans recorded yet.
            </p>
        )}
      </CardContent>
      <div className="p-4 border-t mt-auto">
        <Button asChild variant="outline" className="w-full">
            <Link to="/friendly-loans">
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Manage Loans
            </Link>
        </Button>
      </div>
    </Card>
  );
} 