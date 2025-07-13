interface ParsedExpense {
  action: 'add' | 'query';
  data?: {
    amount: number;
    category: string;
    date: string;
    title?: string;
  };
  filter?: {
    category?: string;
    timeRange?: string;
  };
}

export const parseExpenseInput = (input: string): ParsedExpense => {
  const lowercaseInput = input.toLowerCase().trim();
  
  // Check if it's an add command
  if (lowercaseInput.includes('add') || lowercaseInput.includes('spent') || lowercaseInput.includes('₹')) {
    return parseAddExpense(input);
  }
  
  // Otherwise, treat as query
  return parseQueryExpense(input);
};

const parseAddExpense = (input: string): ParsedExpense => {
  // Extract amount (₹ symbol or numbers)
  const amountMatch = input.match(/₹(\d+(?:,\d+)*(?:\.\d+)?)|(\d+(?:,\d+)*(?:\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1] || amountMatch[2]) : 0;
  
  // Extract category keywords
  const categories = ['food', 'travel', 'transport', 'shopping', 'bills', 'entertainment', 'medical', 'fuel', 'grocery', 'rent'];
  let category = 'other';
  
  for (const cat of categories) {
    if (input.toLowerCase().includes(cat)) {
      category = cat;
      break;
    }
  }
  
  // Extract date
  let date = new Date().toISOString().split('T')[0]; // Default to today
  
  if (input.toLowerCase().includes('yesterday')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split('T')[0];
  } else if (input.toLowerCase().includes('today')) {
    date = new Date().toISOString().split('T')[0];
  }
  
  // Extract title/description
  let title = `${category} expense`;
  const titleMatch = input.match(/for (.+?)(?:\s+(?:today|yesterday|on)|\s*$)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  
  return {
    action: 'add',
    data: {
      amount,
      category,
      date,
      title
    }
  };
};

const parseQueryExpense = (input: string): ParsedExpense => {
  const lowercaseInput = input.toLowerCase();
  
  let category: string | undefined;
  let timeRange: string | undefined;
  
  // Extract category
  const categories = ['food', 'travel', 'transport', 'shopping', 'bills', 'entertainment', 'medical', 'fuel', 'grocery', 'rent'];
  for (const cat of categories) {
    if (lowercaseInput.includes(cat)) {
      category = cat;
      break;
    }
  }
  
  // Extract time range
  if (lowercaseInput.includes('this month') || lowercaseInput.includes('month')) {
    timeRange = 'this_month';
  } else if (lowercaseInput.includes('this week') || lowercaseInput.includes('week')) {
    timeRange = 'this_week';
  } else if (lowercaseInput.includes('today')) {
    timeRange = 'today';
  }
  
  return {
    action: 'query',
    filter: {
      category,
      timeRange
    }
  };
};
