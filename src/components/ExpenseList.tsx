
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

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
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  const [filter, setFilter] = useState({
    category: 'all',
    month: 'all',
    search: ''
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search expenses..."
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            className="max-w-xs"
          />
          <Select value={filter.category} onValueChange={(value) => setFilter({...filter, category: value})}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-32">
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
            onClick={() => setFilter({category: 'all', month: 'all', search: ''})}
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.date || expense.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{expense.title || 'Untitled'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {expense.category || 'Other'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{expense.amount?.toLocaleString() || '0'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
