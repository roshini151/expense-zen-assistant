
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
import UserProfile from './UserProfile';
import SettingsDropdown from './SettingsDropdown';
import ExpenseChat from './ExpenseChat';
import { useExpenses } from '@/hooks/useExpenses';
import { parseExpenseInput } from '@/utils/expenseParser';
import { BarChart3, Calculator, DollarSign, FileText, Settings, Sparkles, MessageCircle, RotateCcw, History } from 'lucide-react';

const ExpenseAssistant = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const { expenses, addExpense, refetch, resetMonth, viewHistory, historyExpenses, isLoadingHistory } = useExpenses();

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

  const handleExpenseDeleted = () => {
    refetch();
  };

  const handleAddExpenseClick = () => {
    // Focus on the input field when add button is clicked
    const inputElement = document.querySelector('input[placeholder*="Add"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleResetMonth = async () => {
    try {
      await resetMonth();
    } catch (error) {
      console.error('Reset month failed:', error);
    }
  };

  const handleViewHistory = async () => {
    try {
      await viewHistory();
      setShowHistory(true);
      toast({
        title: "History Loaded",
        description: "Past expenses have been loaded successfully!",
      });
    } catch (error) {
      console.error('View history failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Expense Assistant
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your expenses with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SettingsDropdown />
            <UserProfile />
          </div>
        </div>

        {/* Input Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Add Expense or Ask Questions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Try: "Add ₹300 for food today" or "Show travel expenses this month"
            </p>
            
            {/* Control Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                onClick={handleResetMonth}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset for New Month
              </Button>
              <Button
                onClick={handleViewHistory}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoadingHistory}
              >
                <History className="h-4 w-4" />
                {isLoadingHistory ? 'Loading...' : 'View History'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Add ₹500 for travel yesterday"
                className="flex-1 h-12 text-base"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                {isLoading ? 'Processing...' : 'Process'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Section */}
        {showHistory && historyExpenses && historyExpenses.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Expense History (Past 3+ Months)
              </CardTitle>
              <Button
                onClick={() => setShowHistory(false)}
                variant="outline"
                size="sm"
                className="w-fit"
              >
                Hide History
              </Button>
            </CardHeader>
            <CardContent>
              <ExpenseList
                expenses={historyExpenses}
                onExpenseDeleted={handleExpenseDeleted}
              />
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-6 w-full min-w-[600px] h-12">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Charts</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="budgets" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Budgets</span>
                <span className="sm:hidden">Budget</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">All Expenses</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <ExpenseSummary expenses={expenses} />
              <ExpenseList 
                expenses={expenses} 
                onExpenseDeleted={handleExpenseDeleted}
                onAddExpense={handleAddExpenseClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <ExpenseChat expenses={expenses} />
          </TabsContent>

          <TabsContent value="charts">
            <ExpenseCharts expenses={expenses} />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetManager expenses={expenses} />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseList 
              expenses={expenses} 
              onExpenseDeleted={handleExpenseDeleted}
              onAddExpense={handleAddExpenseClick}
            />
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
