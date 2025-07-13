
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Download, FileSpreadsheet } from 'lucide-react';

interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  title: string;
  created_at: string;
}

interface ExpenseExporterProps {
  expenses: Expense[];
}

export const ExpenseExporter: React.FC<ExpenseExporterProps> = ({ expenses }) => {
  const [exportFilter, setExportFilter] = useState('all');
  const { toast } = useToast();

  const getFilteredExpenses = () => {
    if (exportFilter === 'all') return expenses || [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (exportFilter) {
      case 'current_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'last_3_months':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      default:
        return expenses || [];
    }

    return expenses?.filter(expense => {
      const expenseDate = new Date(expense.date || expense.created_at);
      return expenseDate >= startDate && expenseDate <= endDate;
    }) || [];
  };

  const exportToCSV = () => {
    const filteredExpenses = getFilteredExpenses();
    
    if (!filteredExpenses.length) {
      toast({
        title: "No Data",
        description: "No expenses found for the selected period",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Date', 'Title', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        format(new Date(expense.date || expense.created_at), 'yyyy-MM-dd'),
        `"${expense.title || 'Untitled'}"`,
        `"${expense.category || 'Other'}"`,
        expense.amount || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredExpenses.length} expenses to CSV`,
    });
  };

  const filteredCount = getFilteredExpenses().length;
  const totalAmount = getFilteredExpenses().reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Export Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={exportFilter} onValueChange={setExportFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="current_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} disabled={filteredCount === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredCount} expenses • Total: ₹{totalAmount.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};
