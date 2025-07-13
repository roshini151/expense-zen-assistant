
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { AlertTriangle, DollarSign, Plus, Trash2 } from 'lucide-react';

interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  title: string;
  created_at: string;
}

interface Budget {
  category: string;
  amount: number;
}

interface BudgetManagerProps {
  expenses: Expense[];
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ expenses }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const { toast } = useToast();

  useEffect(() => {
    const savedBudgets = localStorage.getItem('expense-budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem('expense-budgets', JSON.stringify(newBudgets));
  };

  const addBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: "Error",
        description: "Please enter both category and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const existingBudgetIndex = budgets.findIndex(b => b.category === newBudget.category);
    let updatedBudgets;

    if (existingBudgetIndex >= 0) {
      updatedBudgets = [...budgets];
      updatedBudgets[existingBudgetIndex] = { category: newBudget.category, amount };
    } else {
      updatedBudgets = [...budgets, { category: newBudget.category, amount }];
    }

    saveBudgets(updatedBudgets);
    setNewBudget({ category: '', amount: '' });
    toast({
      title: "Budget Updated",
      description: `Budget for ${newBudget.category} set to ₹${amount.toLocaleString()}`,
    });
  };

  const removeBudget = (category: string) => {
    const updatedBudgets = budgets.filter(b => b.category !== category);
    saveBudgets(updatedBudgets);
    toast({
      title: "Budget Removed",
      description: `Budget for ${category} has been removed`,
    });
  };

  const getCurrentMonthSpending = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return expenses?.filter(expense => {
      const expenseDate = new Date(expense.date || expense.created_at);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    }).reduce((acc, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + (expense.amount || 0);
      return acc;
    }, {} as Record<string, number>) || {};
  };

  const currentSpending = getCurrentMonthSpending();
  const categories = [...new Set(expenses?.map(e => e.category).filter(Boolean) || [])];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Category"
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              list="categories"
            />
            <datalist id="categories">
              {categories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <Input
              type="number"
              placeholder="Budget amount"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
            />
            <Button onClick={addBudget}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {budgets.map((budget) => {
        const spent = currentSpending[budget.category] || 0;
        const percentage = (spent / budget.amount) * 100;
        const isOverBudget = spent > budget.amount;

        return (
          <Card key={budget.category}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{budget.category}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBudget(budget.category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Spent: ₹{spent.toLocaleString()}</span>
                <span>Budget: ₹{budget.amount.toLocaleString()}</span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className={isOverBudget ? "bg-red-100" : ""}
              />
              <div className="text-sm text-muted-foreground">
                {percentage.toFixed(1)}% of budget used
              </div>
              {isOverBudget && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You've exceeded your budget by ₹{(spent - budget.amount).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}

      {budgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No budgets set yet. Add your first budget above!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
