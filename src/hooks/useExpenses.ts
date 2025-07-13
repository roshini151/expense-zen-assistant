
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

  return {
    expenses,
    isLoading,
    addExpense: addExpenseMutation.mutateAsync,
    refetch,
  };
};
