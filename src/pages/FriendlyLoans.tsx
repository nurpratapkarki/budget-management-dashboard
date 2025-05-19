import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  CalendarIcon, 
  Users, 
  ArrowUpDown, 
  ChevronsUpDown, 
  Eye,
  ReceiptText,
  UserPlus
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { friendlyLoansService, friendsService } from '@/lib/supabase';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/helpers';

const friendFormSchema = z.object({
  name: z.string().min(1, 'Friend name is required'),
  contact_number: z.string().min(1, 'Contact number is required'),
});

const loanFormSchema = z.object({
  friend_id: z.string().min(1, 'Friend is required'), // This will store friend's ID
  new_friend_name: z.string().optional(),
  new_friend_contact: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['taken', 'given']),
  loan_date: z.date(),
  due_date: z.date().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional().default('pending'),
}).refine(data => {
  if (data.friend_id === '__new__' && (!data.new_friend_name || !data.new_friend_contact)) {
    return false;
  }
  return true;
}, {
  message: 'New friend name and contact are required',
  path: ['new_friend_name'], // Or general path
});

const repaymentFormSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  repayment_date: z.date(),
  notes: z.string().optional(),
});

export default function FriendlyLoansPage() {
  const queryClient = useQueryClient();
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);
  const [isDeleteLoanDialogOpen, setIsDeleteLoanDialogOpen] = useState(false);
  const [isDeleteRepaymentDialogOpen, setIsDeleteRepaymentDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [currentLoanForRepayment, setCurrentLoanForRepayment] = useState<any>(null);
  const [loanToDelete, setLoanToDelete] = useState<any>(null);
  const [repaymentToDelete, setRepaymentToDelete] = useState<any>(null);
  const [viewingFriendLoans, setViewingFriendLoans] = useState<any>(null); // Stores friend object whose loans are being viewed

  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ['allFriends'],
    queryFn: friendsService.getAllFriends,
  });

  const { data: loans = [], isLoading: isLoadingLoans } = useQuery({
    queryKey: ['allFriendlyLoans'], // Simplified key, filtering/sorting done in useMemo
    queryFn: friendlyLoansService.getAllLoans,
  });

  const loanForm = useForm<z.infer<typeof loanFormSchema>>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      type: 'taken',
      loan_date: new Date(),
      status: 'pending',
      friend_id: ''
    },
  });

  const repaymentForm = useForm<z.infer<typeof repaymentFormSchema>>({
    resolver: zodResolver(repaymentFormSchema),
    defaultValues: {
      repayment_date: new Date(),
    },
  });

  const handleLoanDialogClose = () => {
    setIsLoanDialogOpen(false);
    setEditingLoan(null);
    loanForm.reset({ type: 'taken', loan_date: new Date(), status: 'pending', friend_id: '' });
  };
  
  const handleRepaymentDialogClose = () => {
    setIsRepaymentDialogOpen(false);
    setCurrentLoanForRepayment(null);
    repaymentForm.reset({ repayment_date: new Date() });
  };

  const onLoanSubmit = async (values: z.infer<typeof loanFormSchema>) => {
    let friendId = values.friend_id;
    try {
      if (values.friend_id === '__new__') {
        if (!values.new_friend_name || !values.new_friend_contact) {
          toast.error('New friend name and contact number are required.');
          return;
        }
        // Check if friend already exists by name (to avoid duplicates before creating)
        let existingFriend = await friendsService.getFriendByName(values.new_friend_name);
        if (existingFriend) {
          friendId = existingFriend.id;
          toast.info(`Using existing friend: ${values.new_friend_name}`);
        } else {
            const newFriend = await friendsService.createFriend({ 
                name: values.new_friend_name, 
                contact_number: values.new_friend_contact 
            });
            friendId = newFriend.id;
            queryClient.invalidateQueries({ queryKey: ['allFriends'] });
        }
      }

      const loanPayload = {
        amount: values.amount,
        type: values.type,
        loan_date: format(values.loan_date, 'yyyy-MM-dd'),
        due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
        reason: values.reason,
        notes: values.notes,
        status: values.status,
      };

      if (editingLoan) {
        await friendlyLoansService.updateLoan(editingLoan.id, loanPayload, friendId);
      } else {
        await friendlyLoansService.createLoan(loanPayload, friendId);
      }
      queryClient.invalidateQueries({ queryKey: ['allFriendlyLoans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats']});
      handleLoanDialogClose();
    } catch (error) {
      toast.error(editingLoan ? 'Failed to update loan' : 'Failed to create/update loan');
      console.error("Loan submission error:", error);
    }
  };

  const onRepaymentSubmit = async (values: z.infer<typeof repaymentFormSchema>) => {
    if (!currentLoanForRepayment) return;
    try {
      await friendlyLoansService.addRepayment({
        ...values,
        loan_id: currentLoanForRepayment.id,
        repayment_date: format(values.repayment_date, 'yyyy-MM-dd'),
      });
      queryClient.invalidateQueries({ queryKey: ['allFriendlyLoans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats']});
      handleRepaymentDialogClose();
    } catch (error) {
      toast.error('Failed to add repayment');
    }
  };
  
  const openEditLoanDialog = (loan: any) => {
    setEditingLoan(loan);
    loanForm.reset({
      ...loan,
      friend_id: loan.friends?.id || loan.friend_id, // Handle direct friend_id if friends object isn't expanded
      loan_date: loan.loan_date && isValid(parseISO(loan.loan_date)) ? parseISO(loan.loan_date) : new Date(),
      due_date: loan.due_date && isValid(parseISO(loan.due_date)) ? parseISO(loan.due_date) : undefined,
    });
    setIsLoanDialogOpen(true);
  };

  const confirmDeleteLoan = (loan: any) => {
    setLoanToDelete(loan);
    setIsDeleteLoanDialogOpen(true);
  };

  const handleDeleteLoan = async () => {
    if (!loanToDelete) return;
    try {
      await friendlyLoansService.deleteLoan(loanToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['allFriendlyLoans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats']});
      toast.success('Loan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete loan');
    } finally {
      setIsDeleteLoanDialogOpen(false);
      setLoanToDelete(null);
    }
  };
  
  const confirmDeleteRepayment = (repayment: any) => {
    setRepaymentToDelete(repayment);
    setIsDeleteRepaymentDialogOpen(true);
  }

  const handleDeleteRepayment = async () => {
    if (!repaymentToDelete) return;
    try {
      await friendlyLoansService.deleteRepayment(repaymentToDelete.id, repaymentToDelete.loan_id);
      queryClient.invalidateQueries({ queryKey: ['allFriendlyLoans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats']});
      toast.success('Repayment deleted');
    } catch (e) {
      toast.error('Failed to delete repayment');
    } finally {
      setIsDeleteRepaymentDialogOpen(false);
      setRepaymentToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">Paid</Badge>;
      case 'partially_paid': return <Badge variant="secondary">Partially Paid</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>; // Add logic for overdue if due_date is used
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const loansByFriend = useMemo(() => {
    if (isLoadingLoans || isLoadingFriends) return [];
    const grouped: Record<string, { friend: any; loansGiven: any[]; loansTaken: any[]; totalGiven: number; totalTaken: number; netBalance: number; activeLoans: number }> = {};

    loans.forEach((loan: any) => {
      const friendId = loan.friends?.id || loan.friend_id;
      if (!friendId) return; 

      const friend = friends.find((f: any) => f.id === friendId);
      if (!friend) return;

      if (!grouped[friendId]) {
        grouped[friendId] = {
          friend: friend,
          loansGiven: [],
          loansTaken: [],
          totalGiven: 0,
          totalTaken: 0,
          netBalance: 0,
          activeLoans: 0
        };
      }

      const repaid = (loan.repayments || []).reduce((sum: number, r: any) => sum + Number(r.amount), 0);
      const remainingOnLoan = Number(loan.amount) - repaid;

      if (loan.type === 'given') {
        grouped[friendId].loansGiven.push(loan);
        if (loan.status !== 'paid') grouped[friendId].totalGiven += remainingOnLoan;
      } else {
        grouped[friendId].loansTaken.push(loan);
        if (loan.status !== 'paid') grouped[friendId].totalTaken += remainingOnLoan;
      }
      if (loan.status === 'pending' || loan.status === 'partially_paid') {
        grouped[friendId].activeLoans++;
      }
    });
    
    Object.values(grouped).forEach(group => {
        group.netBalance = group.totalGiven - group.totalTaken;
    });

    return Object.values(grouped).sort((a,b) => a.friend.name.localeCompare(b.friend.name));
  }, [loans, friends, isLoadingLoans, isLoadingFriends]);
  
  const [friendComboboxOpen, setFriendComboboxOpen] = useState(false);
  const selectedFriendId = loanForm.watch('friend_id');

  if (isLoadingLoans || isLoadingFriends) {
    return (
      <div className="container mx-auto py-4 space-y-6 mb-20">
        <PageHeader heading="Friendly Loans" text="Manage loans taken or given to friends" />
        <Skeleton className="h-12 w-full" /> 
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // Form for adding/editing a single loan (inside dialog)
  const loanDialogFormContent = (
    <form onSubmit={loanForm.handleSubmit(onLoanSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
        <Controller
            name="friend_id"
            control={loanForm.control}
            render={({ field }) => (
            <Popover open={friendComboboxOpen} onOpenChange={setFriendComboboxOpen}>
                <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={friendComboboxOpen}
                    className="w-full justify-between"
                >
                    {field.value && field.value !== '__new__'
                    ? friends.find((f: any) => f.id === field.value)?.name
                    : field.value === '__new__' ? "Enter new friend details below" : "Select or Add Friend"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search friend or type new..." />
                    <CommandList>
                        <CommandEmpty>
                            No friend found. Type full name to add as new.
                        </CommandEmpty>
                        <CommandGroup>
                            {friends.map((f: any) => (
                            <CommandItem
                                key={f.id}
                                value={f.name} // Use name for searchability
                                onSelect={() => {
                                loanForm.setValue('friend_id', f.id);
                                loanForm.clearErrors('new_friend_name');
                                loanForm.clearErrors('new_friend_contact');
                                setFriendComboboxOpen(false);
                                }}
                            >
                                {f.name} ({f.contact_number || 'No contact'})
                            </CommandItem>
                            ))}
                             <CommandItem 
                                key="__new__"
                                value="__new_friend_sentinel__" // make it unlikely to be typed
                                onSelect={() => {
                                    loanForm.setValue('friend_id', '__new__');
                                    setFriendComboboxOpen(false);
                                    loanForm.setFocus('new_friend_name');
                                }}
                                className="text-primary hover:text-primary-foreground"
                            >
                                <UserPlus className="mr-2 h-4 w-4"/> Add New Friend
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
                </PopoverContent>
            </Popover>
            )}
        />
        {loanForm.formState.errors.friend_id && <p className="text-xs text-red-500">{loanForm.formState.errors.friend_id.message}</p>}

        {selectedFriendId === '__new__' && (
        <>
            <Controller
            name="new_friend_name"
            control={loanForm.control}
            render={({ field }) => <Input placeholder="New Friend's Name" {...field} />} />
            {loanForm.formState.errors.new_friend_name && <p className="text-xs text-red-500">{loanForm.formState.errors.new_friend_name.message}</p>}
            
            <Controller
            name="new_friend_contact"
            control={loanForm.control}
            render={({ field }) => <Input placeholder="New Friend's Contact Number" {...field} />} />
            {loanForm.formState.errors.new_friend_contact && <p className="text-xs text-red-500">{loanForm.formState.errors.new_friend_contact.message}</p>}
        </>
        )}

        <Controller name="amount" control={loanForm.control} render={({ field }) => <Input type="number" step="0.01" placeholder="Amount" {...field} />} />
        {loanForm.formState.errors.amount && <p className="text-xs text-red-500">{loanForm.formState.errors.amount.message}</p>}

        <Controller name="type" control={loanForm.control} render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Loan Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="taken">I Borrowed (Loan Taken)</SelectItem>
                    <SelectItem value="given">I Lent (Loan Given)</SelectItem>
                </SelectContent>
            </Select>
        )} />

        <Controller name="loan_date" control={loanForm.control} render={({ field }) => (
            <Popover><PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value && isValid(field.value) ? format(field.value, "PPP") : <span>Loan Date</span>}
                </Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>)} />
        
        <Controller name="due_date" control={loanForm.control} render={({ field }) => (
            <Popover><PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value && isValid(field.value) ? format(field.value, "PPP") : <span>Due Date (Optional)</span>}
                </Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>)} />
        
        <Controller name="reason" control={loanForm.control} render={({ field }) => <Input placeholder="Reason (Optional)" {...field} />} />
        <Controller name="notes" control={loanForm.control} render={({ field }) => <Textarea placeholder="Notes (Optional)" {...field} />} />
        
        <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleLoanDialogClose}>Cancel</Button>
            <Button type="submit">{editingLoan ? 'Save Changes' : 'Add Loan'}</Button>
        </DialogFooter>
    </form>
  );

  return (
    <div className="container mx-auto py-4 space-y-6 mb-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader heading="Friendly Loans" text="Manage loans with friends and track repayments." />
        <Button onClick={() => { 
            loanForm.reset({ type: 'taken', loan_date: new Date(), status: 'pending', friend_id: '' }); 
            setEditingLoan(null); 
            setIsLoanDialogOpen(true);
        }} className="self-start md:self-auto">
          <Plus className="mr-2 h-4 w-4" /> Add New Loan
        </Button>
      </div>

      {/* Main Table: Grouped by Friend */} 
      <Card>
        <CardHeader>
          <CardTitle>Friend Loan Summary</CardTitle>
          <CardDescription>Overview of total loans and balances with each friend.</CardDescription>
        </CardHeader>
        <CardContent>
          {loansByFriend.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4"/>
              <p>No loans recorded yet.</p>
              <p className="text-sm">Click "Add New Loan" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Friend</TableHead>
                  <TableHead className="text-right">You Owe Them</TableHead>
                  <TableHead className="text-right">They Owe You</TableHead>
                  <TableHead className="text-right">Net Balance</TableHead>
                  <TableHead className="text-center">Active Loans</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loansByFriend.map(({ friend, totalTaken, totalGiven, netBalance, activeLoans }) => (
                  <TableRow key={friend.id}>
                    <TableCell>
                        <div className="font-medium">{friend.name}</div>
                        <div className="text-xs text-muted-foreground">{friend.contact_number || 'No contact'}</div>
                    </TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(totalTaken)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(totalGiven)}</TableCell>
                    <TableCell className={cn("text-right font-semibold", netBalance < 0 ? 'text-red-600' : netBalance > 0 ? 'text-green-600' : 'text-muted-foreground')}>
                        {formatCurrency(Math.abs(netBalance))} {netBalance < 0 ? '(You Owe)' : netBalance > 0 ? '(They Owe)' : '(Settled)'}
                    </TableCell>
                    <TableCell className="text-center">{activeLoans}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setViewingFriendLoans(friend)}>
                        <Eye className="mr-1 h-4 w-4" /> View History
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Loan Dialog (Add/Edit Single Loan) */}
      <Dialog open={isLoanDialogOpen} onOpenChange={handleLoanDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLoan ? 'Edit Loan Details' : 'Add New Loan'}</DialogTitle>
          </DialogHeader>
          {loanDialogFormContent}
        </DialogContent>
      </Dialog>

      {/* View Friend's Loan History Dialog (Modal) */}
      <Dialog open={!!viewingFriendLoans} onOpenChange={() => setViewingFriendLoans(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Loan History for {viewingFriendLoans?.name}</DialogTitle>
            <DialogDescription>
              Contact: {viewingFriendLoans?.contact_number || 'Not specified'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            {(loans.filter((l: any) => (l.friends?.id || l.friend_id) === viewingFriendLoans?.id)
                .sort((a:any, b:any) => new Date(b.loan_date).getTime() - new Date(a.loan_date).getTime())
                ).map((loan: any) => {
                const totalRepaid = (loan.repayments || []).reduce((sum: number, r: any) => sum + Number(r.amount), 0);
                const remainingAmount = Number(loan.amount) - totalRepaid;
                return (
                <Card key={loan.id} className={cn(loan.type === 'given' ? 'border-green-500' : 'border-red-500', 'border-l-4')}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base">
                                    {loan.type === 'given' ? 'Loaned to' : 'Borrowed from'} {viewingFriendLoans?.name} - {formatCurrency(loan.amount)}
                                </CardTitle>
                                <CardDescription>
                                    Loan Date: {format(parseISO(loan.loan_date), 'PPP')} 
                                    {loan.due_date && ` | Due: ${format(parseISO(loan.due_date), 'PPP')}`}
                                </CardDescription>
                            </div>
                            {getStatusBadge(loan.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {loan.reason && <p><span className="font-semibold">Reason:</span> {loan.reason}</p>}
                        {loan.notes && <p><span className="font-semibold">Notes:</span> {loan.notes}</p>}
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-semibold text-xs uppercase text-muted-foreground">Repayments</h4>
                                {loan.status !== 'paid' && (
                                    <Button size="sm" variant="outline" onClick={() => { setCurrentLoanForRepayment(loan); setIsRepaymentDialogOpen(true); }}>
                                        <ReceiptText className="mr-1 h-3 w-3"/> Add Repayment
                                    </Button>
                                )}
                            </div>
                            {loan.repayments && loan.repayments.length > 0 ? (
                            <ul className="space-y-1 text-xs">
                                {loan.repayments.map((rp: any) => (
                                <li key={rp.id} className="flex justify-between items-center p-1 bg-muted/30 rounded">
                                    <span>{format(parseISO(rp.repayment_date), 'PPP')}: {formatCurrency(rp.amount)} {rp.notes && `(${rp.notes})`}</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => confirmDeleteRepayment({...rp, loan_id: loan.id})}>
                                        <Trash2 className="h-3 w-3 text-destructive"/>
                                    </Button>
                                </li>
                                ))}
                            </ul>
                            ) : <p className="text-xs italic text-muted-foreground">No repayments yet.</p>}
                            <p className="text-right font-semibold mt-1">
                                {remainingAmount > 0 ? `Remaining: ${formatCurrency(remainingAmount)}` : <span className="text-green-600">Fully Repaid</span>}
                            </p>
                        </div>
                    </CardContent>
                    <DialogFooter className="p-4 border-t !justify-end">
                        <Button size="sm" variant="outline" onClick={() => openEditLoanDialog(loan)}><Edit2 className="mr-1 h-4 w-4"/> Edit Loan</Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmDeleteLoan(loan)}><Trash2 className="mr-1 h-4 w-4"/> Delete Loan</Button>
                    </DialogFooter>
                </Card>
            )})}
            {loans.filter((l: any) => (l.friends?.id || l.friend_id) === viewingFriendLoans?.id).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No loan history with {viewingFriendLoans?.name}.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Repayment Dialog */}
      {currentLoanForRepayment && (
        <Dialog open={isRepaymentDialogOpen} onOpenChange={handleRepaymentDialogClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Repayment for {currentLoanForRepayment.friends?.name}</DialogTitle>
                    <DialogDescription>
                        Loan Amount: {formatCurrency(currentLoanForRepayment.amount)} on {format(parseISO(currentLoanForRepayment.loan_date), 'PPP')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={repaymentForm.handleSubmit(onRepaymentSubmit)} className="space-y-4 py-2">
                    <Controller name="amount" control={repaymentForm.control} render={({ field }) => <Input type="number" step="0.01" placeholder="Repayment Amount" {...field} />} />
                    {repaymentForm.formState.errors.amount && <p className="text-xs text-red-500">{repaymentForm.formState.errors.amount.message}</p>}
                    <Controller name="repayment_date" control={repaymentForm.control} render={({ field }) => (
                        <Popover><PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value && isValid(field.value) ? format(field.value, "PPP") : <span>Repayment Date</span>}
                            </Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>)} />
                    {repaymentForm.formState.errors.repayment_date && <p className="text-xs text-red-500">{repaymentForm.formState.errors.repayment_date.message}</p>}
                    <Controller name="notes" control={repaymentForm.control} render={({ field }) => <Textarea placeholder="Repayment Notes (Optional)" {...field} />} />
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={handleRepaymentDialogClose}>Cancel</Button>
                        <Button type="submit">Add Repayment</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      )}

      {/* Delete Loan Confirmation Dialog */}
      <AlertDialog open={isDeleteLoanDialogOpen} onOpenChange={setIsDeleteLoanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the loan (ID: {loanToDelete?.id?.substring(0,8)}) and all its associated repayments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLoan} className="bg-red-600 hover:bg-red-700">Delete Loan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Repayment Confirmation Dialog */}
      <AlertDialog open={isDeleteRepaymentDialogOpen} onOpenChange={setIsDeleteRepaymentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repayment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this repayment of {formatCurrency(repaymentToDelete?.amount)} made on {repaymentToDelete?.repayment_date ? format(parseISO(repaymentToDelete.repayment_date), 'PPP') : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRepayment} className="bg-red-600 hover:bg-red-700">Delete Repayment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 