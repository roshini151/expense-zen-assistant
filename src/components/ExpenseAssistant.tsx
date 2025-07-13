
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExpenseList } from './ExpenseList';
import { ExpenseSummary } from './ExpenseSummary';
import { useExpenses } from '@/hooks/useExpenses';
import { parseExpenseInput } from '@/utils/expenseParser';

const ExpenseAssistant = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { expenses, addExpense, refetch } = useExpenses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const parsedExpense = parseExpenseInput(input);
      
      if (parsedExpense.action === 'add') {
        await addExpense(parsedExpense.data);
        toast({
          title: "Expense Added",
          description: `₹${parsedExpense.data.amount} for ${parsedExpense.data.category} added successfully!`,
        });
        setInput('');
        refetch();
      } else {
        // Handle query/filter actions
        toast({
          title: "Query processed",
          description: "Filtering expenses based on your request",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Expense Assistant</CardTitle>
          <p className="text-muted-foreground">
            Tell me about your expenses in natural language. Try: "Add ₹300 for food today" or "Show travel expenses this month"
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Add ₹500 for travel yesterday"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Process'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseSummary expenses={expenses} />
        <ExpenseList expenses={expenses} />
      </div>
    </div>
  );
};

export default ExpenseAssistant;
