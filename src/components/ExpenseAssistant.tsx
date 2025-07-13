
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ExpenseList } from './ExpenseList';
import { ExpenseSummary } from './ExpenseSummary';
import { ExpenseCharts } from './ExpenseCharts';
import { BudgetManager } from './BudgetManager';
import { ExpenseExporter } from './ExpenseExporter';
import { ThemeToggle } from './ThemeToggle';
import { useExpenses } from '@/hooks/useExpenses';
import { parseExpenseInput } from '@/utils/expenseParser';
import { BarChart3, Calculator, DollarSign, FileText, Settings } from 'lucide-react';

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
          description: "Use the tabs below to view your expense reports",
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Smart Expense Assistant</h1>
            <p className="text-muted-foreground">
              Manage your expenses with natural language commands
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Add Expense or Ask Questions</CardTitle>
            <p className="text-muted-foreground">
              Try: "Add ₹300 for food today" or "Show travel expenses this month"
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budgets
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Expenses
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseSummary expenses={expenses} />
              <ExpenseList expenses={expenses} />
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <ExpenseCharts expenses={expenses} />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetManager expenses={expenses} />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseList expenses={expenses} />
          </TabsContent>

          <TabsContent value="export">
            <ExpenseExporter expenses={expenses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExpenseAssistant;
