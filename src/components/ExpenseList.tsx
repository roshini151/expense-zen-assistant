
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Trash2, MoreVertical, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  title: string;
  created_at: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted?: () => void;
  onAddExpense?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onExpenseDeleted, onAddExpense }) => {
  const [filter, setFilter] = useState({
    category: 'all',
    month: 'all',
    search: ''
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const categories = [...new Set(expenses?.map(e => e.category).filter(Boolean))];
  
  const filteredExpenses = expenses?.filter(expense => {
    const matchesCategory = filter.category === 'all' || expense.category === filter.category;
    const matchesMonth = filter.month === 'all' || format(new Date(expense.date || expense.created_at), 'yyyy-MM') === filter.month;
    const matchesSearch = !filter.search || 
      expense.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
      expense.category?.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesCategory && matchesMonth && matchesSearch;
  }) || [];

  const months = [...new Set(expenses?.map(e => 
    format(new Date(e.date || e.created_at), 'yyyy-MM')
  ))].sort().reverse();

  const handleClearFilters = () => {
    setFilter({
      category: 'all',
      month: 'all',
      search: ''
    });
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      setDeletingId(expenseId);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: "Error",
          description: "Failed to delete expense. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });

      if (onExpenseDeleted) {
        onExpenseDeleted();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative">
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Expenses
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Search expenses by title or category..."
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
                className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filter.category} onValueChange={(value) => setFilter({...filter, category: value})}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filter.month} onValueChange={(value) => setFilter({...filter, month: value})}>
                <SelectTrigger className="w-full sm:w-32 h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), 'MMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="h-10 px-4 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100">Date</TableHead>
                    <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100">Title</TableHead>
                    <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100">Category</TableHead>
                    <TableHead className="text-right font-medium text-gray-900 dark:text-gray-100">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {expenses?.length === 0 ? 'No expenses found. Add your first expense!' : 'No expenses match your filters.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {format(new Date(expense.date || expense.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                          {expense.title || 'Untitled'}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {expense.category || 'Other'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100">
                          ₹{expense.amount?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={deletingId === expense.id}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                                disabled={deletingId === expense.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deletingId === expense.id ? 'Deleting...' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      <Button
        onClick={onAddExpense}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 z-50 flex items-center justify-center"
        size="icon"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
};
