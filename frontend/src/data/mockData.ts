export interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  pages: number;
  deadline: Date;
  budget: number;
  status: 'open' | 'assigned' | 'in_progress' | 'submitted' | 'completed' | 'cancelled';
  createdAt: Date;
  assignedTo?: string;
  bidsCount: number;
}

export interface Bid {
  id: string;
  taskId: string;
  taskTitle: string;
  writerId: string;
  writerName: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earning' | 'withdrawal' | 'bonus';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface WriterUser {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'active' | 'suspended';
  walletBalance: number;
  completedTasks: number;
  rating: number;
  createdAt: Date;
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Research Paper on Climate Change Impact',
    subject: 'Environmental Science',
    description: 'Write a comprehensive research paper analyzing the impact of climate change on coastal ecosystems. Include recent studies and data from the past 5 years.',
    pages: 12,
    deadline: new Date('2026-01-15'),
    budget: 240,
    status: 'open',
    createdAt: new Date('2025-12-28'),
    bidsCount: 5,
  },
  {
    id: '2',
    title: 'Business Case Study Analysis',
    subject: 'Business Administration',
    description: 'Analyze the Tesla Inc. business model and provide recommendations for sustainable growth in emerging markets.',
    pages: 8,
    deadline: new Date('2026-01-10'),
    budget: 160,
    status: 'open',
    createdAt: new Date('2025-12-30'),
    bidsCount: 3,
  },
  {
    id: '3',
    title: 'Literature Review: Modern Psychology',
    subject: 'Psychology',
    description: 'Comprehensive literature review on cognitive behavioral therapy effectiveness in treating anxiety disorders.',
    pages: 15,
    deadline: new Date('2026-01-20'),
    budget: 300,
    status: 'assigned',
    createdAt: new Date('2025-12-25'),
    assignedTo: '2',
    bidsCount: 8,
  },
  {
    id: '4',
    title: 'Technical Report: Machine Learning',
    subject: 'Computer Science',
    description: 'Write a technical report on implementing neural networks for image classification. Include code examples and performance analysis.',
    pages: 10,
    deadline: new Date('2026-01-12'),
    budget: 250,
    status: 'open',
    createdAt: new Date('2025-12-31'),
    bidsCount: 2,
  },
  {
    id: '5',
    title: 'Economic Analysis Paper',
    subject: 'Economics',
    description: 'Analyze the impact of inflation on middle-class households in the United States during 2024-2025.',
    pages: 6,
    deadline: new Date('2026-01-08'),
    budget: 120,
    status: 'in_progress',
    createdAt: new Date('2025-12-20'),
    assignedTo: '2',
    bidsCount: 6,
  },
];

export const mockBids: Bid[] = [
  {
    id: '1',
    taskId: '1',
    taskTitle: 'Research Paper on Climate Change Impact',
    writerId: '2',
    writerName: 'John Writer',
    amount: 220,
    message: 'I have extensive experience in environmental science research and can deliver high-quality work before the deadline.',
    status: 'pending',
    createdAt: new Date('2025-12-29'),
  },
  {
    id: '2',
    taskId: '2',
    taskTitle: 'Business Case Study Analysis',
    writerId: '2',
    writerName: 'John Writer',
    amount: 150,
    message: 'MBA graduate with focus on strategic management. I can provide excellent analysis.',
    status: 'pending',
    createdAt: new Date('2025-12-31'),
  },
  {
    id: '3',
    taskId: '3',
    taskTitle: 'Literature Review: Modern Psychology',
    writerId: '2',
    writerName: 'John Writer',
    amount: 280,
    message: 'Psychology major with published papers in peer-reviewed journals.',
    status: 'accepted',
    createdAt: new Date('2025-12-26'),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '2',
    type: 'earning',
    amount: 450,
    description: 'Payment for "Marketing Strategy Report"',
    status: 'completed',
    createdAt: new Date('2025-12-20'),
  },
  {
    id: '2',
    userId: '2',
    type: 'earning',
    amount: 300,
    description: 'Payment for "History Essay on World War II"',
    status: 'completed',
    createdAt: new Date('2025-12-15'),
  },
  {
    id: '3',
    userId: '2',
    type: 'withdrawal',
    amount: -500,
    description: 'Withdrawal to PayPal',
    status: 'completed',
    createdAt: new Date('2025-12-18'),
  },
  {
    id: '4',
    userId: '2',
    type: 'bonus',
    amount: 50,
    description: 'Referral bonus',
    status: 'completed',
    createdAt: new Date('2025-12-10'),
  },
];

export const mockWriters: WriterUser[] = [
  {
    id: '2',
    email: 'writer@example.com',
    name: 'John Writer',
    status: 'active',
    walletBalance: 1250.00,
    completedTasks: 24,
    rating: 4.8,
    createdAt: new Date('2024-06-15'),
  },
  {
    id: '3',
    email: 'pending@example.com',
    name: 'Pending Writer',
    status: 'pending',
    walletBalance: 0,
    completedTasks: 0,
    rating: 0,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '4',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    status: 'active',
    walletBalance: 3420.50,
    completedTasks: 56,
    rating: 4.9,
    createdAt: new Date('2024-03-20'),
  },
  {
    id: '5',
    email: 'mike@example.com',
    name: 'Mike Chen',
    status: 'suspended',
    walletBalance: 150.00,
    completedTasks: 8,
    rating: 3.2,
    createdAt: new Date('2024-08-10'),
  },
];

export const platformStats = {
  totalUsers: 156,
  activeWriters: 89,
  totalTasks: 1247,
  completedTasks: 1089,
  pendingTasks: 158,
  totalRevenue: 125680,
  monthlyRevenue: 18450,
};
