
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ExpenseChatProps {
  expenses: any[];
}

const ExpenseChat = ({ expenses }: ExpenseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your expense assistant. You can ask me questions about your expenses, spending patterns, or budgeting tips. How can I help you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateResponse = (userQuestion: string): string => {
    const question = userQuestion.toLowerCase();
    
    if (!expenses || expenses.length === 0) {
      return "You don't have any expenses recorded yet. Start by adding some expenses using the form above, and I'll be able to help you analyze your spending patterns!";
    }

    // Calculate basic stats
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const categories = [...new Set(expenses.map(exp => exp.category))];
    const recentExpenses = expenses.slice(0, 5);

    if (question.includes('total') || question.includes('spent') || question.includes('spend')) {
      return `You've spent ₹${totalExpenses.toFixed(2)} in total across ${expenses.length} expenses. Your spending is distributed across ${categories.length} categories: ${categories.join(', ')}.`;
    }

    if (question.includes('category') || question.includes('categories')) {
      const categoryTotals = categories.map(cat => {
        const total = expenses
          .filter(exp => exp.category === cat)
          .reduce((sum, exp) => sum + (exp.amount || 0), 0);
        return `${cat}: ₹${total.toFixed(2)}`;
      });
      return `Your expenses by category:\n${categoryTotals.join('\n')}`;
    }

    if (question.includes('recent') || question.includes('latest')) {
      const recentList = recentExpenses
        .map(exp => `• ₹${exp.amount} for ${exp.category}${exp.title ? ` (${exp.title})` : ''}`)
        .join('\n');
      return `Your recent expenses:\n${recentList}`;
    }

    if (question.includes('budget') || question.includes('save')) {
      return `Based on your spending pattern, here are some tips:\n• Track your highest expense category: ${categories[0]}\n• Consider setting a monthly budget\n• Review your expenses weekly\n• Look for unnecessary recurring expenses`;
    }

    if (question.includes('highest') || question.includes('most') || question.includes('expensive')) {
      const highest = expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max, expenses[0]);
      return `Your highest expense is ₹${highest.amount} in the ${highest.category} category${highest.title ? ` for "${highest.title}"` : ''}.`;
    }

    if (question.includes('average') || question.includes('mean')) {
      const average = totalExpenses / expenses.length;
      return `Your average expense is ₹${average.toFixed(2)} per transaction.`;
    }

    // Default response
    return `I can help you with questions about your expenses! Try asking:\n• "What's my total spending?"\n• "Show me expenses by category"\n• "What are my recent expenses?"\n• "What's my highest expense?"\n• "Give me budgeting tips"`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate thinking time
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Expense Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your expenses..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseChat;
