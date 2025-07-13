
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { IndianRupee, TrendingUp, Calendar, Tag } from 'lucide-react';

interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  title: string;
  created_at: string;
}

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses }) => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);

  const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
  
  const thisMonthExpenses = expenses?.filter(expense => {
    const expenseDate = new Date(expense.date || expense.created_at);
    return expenseDate >= thisMonthStart && expenseDate <= thisMonthEnd;
  }).reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

  const thisWeekExpenses = expenses?.filter(expense => {
    const expenseDate = new Date(expense.date || expense.created_at);
    return expenseDate >= thisWeekStart && expenseDate <= thisWeekEnd;
  }).reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

  const categoryTotals = expenses?.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + (expense.amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹{thisMonthExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">₹{thisWeekExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Top Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-muted-foreground">No expenses yet</p>
            ) : (
              topCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">₹{amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
