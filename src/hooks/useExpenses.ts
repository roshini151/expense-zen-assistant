
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExpenseData {
  amount: number;
  category: string;
  date: string;
  title?: string;
  user_id?: string;
}

export const useExpenses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      console.log('Fetching expenses from Supabase...');
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }
      
      console.log('Fetched expenses:', data);
      return data || [];
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData: ExpenseData) => {
      console.log('Adding expense:', expenseData);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const expenseWithUser = {
        ...expenseData,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseWithUser])
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
      
      console.log('Added expense:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetMonthMutation = useMutation({
    mutationFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { error } = await supabase
        .from('expenses')
        .delete()
        .gte('date', `${currentMonth}-01`)
        .lt('date', `${currentMonth}-32`);

      if (error) {
        console.error('Error resetting month:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Success",
        description: "Current month expenses cleared successfully!",
      });
    },
    onError: (error) => {
      console.error('Reset month error:', error);
      toast({
        title: "Error",
        description: "Failed to reset month. Please try again.",
        variant: "destructive",
      });
    },
  });

  const viewHistoryQuery = useQuery({
    queryKey: ['expenses-history'],
    queryFn: async () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .lt('date', threeMonthsAgo.toISOString().slice(0, 10))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: false, // Don't fetch automatically
  });

  return {
    expenses,
    isLoading,
    addExpense: addExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    resetMonth: resetMonthMutation.mutateAsync,
    viewHistory: viewHistoryQuery.refetch,
    historyExpenses: viewHistoryQuery.data,
    isLoadingHistory: viewHistoryQuery.isLoading,
    refetch,
  };
};
