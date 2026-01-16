import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function WriterDashboard() {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });

  // Fetch assigned tasks
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'assigned'],
    queryFn: () => api.getTasks({ status: 'ASSIGNED' }),
  });

  const { data: inProgressTasks = [] } = useQuery({
    queryKey: ['tasks', 'in-progress'],
    queryFn: () => api.getTasks({ status: 'IN_PROGRESS' }),
  });

  // Fetch my bids
  const { data: myBids = [], isLoading: bidsLoading } = useQuery({
    queryKey: ['bids', 'my-bids'],
    queryFn: () => api.getMyBids(),
  });

  // Fetch recent transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'my-transactions'],
    queryFn: () => api.getMyTransactions({ type: 'EARNING' }),
  });

  const assignedTasks = [
    ...allTasks.filter((t: any) => t.assignedToId === user?.id),
    ...inProgressTasks.filter((t: any) => t.assignedToId === user?.id),
  ];

  const pendingBids = myBids.filter((b: any) => b.status === 'PENDING');
  const recentEarnings = transactions.slice(0, 3);

  const stats = [
    {
      label: 'Active Tasks',
      value: statsLoading ? '...' : (dashboardStats?.activeTasks ?? 0),
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Pending Bids',
      value: statsLoading ? '...' : (dashboardStats?.pendingBids ?? 0),
      icon: Clock,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Completed',
      value: statsLoading ? '...' : (dashboardStats?.completedTasks ?? 0),
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Earnings This Month',
      value: statsLoading 
        ? '...' 
        : `$${Number(dashboardStats?.earningsThisMonth ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-accent/10 text-accent',
    },
  ];

  const isLoading = statsLoading || tasksLoading || bidsLoading || transactionsLoading;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your writing activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Tasks */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Your Active Tasks
              </h2>
              <Link to="/dashboard/tasks">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : assignedTasks.length > 0 ? (
                <div className="space-y-4">
                  {assignedTasks.slice(0, 3).map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.pages} pages · Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        task.status === 'IN_PROGRESS' 
                          ? 'bg-warning/10 text-warning' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {task.status === 'IN_PROGRESS' ? 'In Progress' : 'Assigned'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No active tasks</p>
                  <Link to="/dashboard/tasks">
                    <Button variant="outline" size="sm" className="mt-4">
                      Browse Available Tasks
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Earnings */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Earnings
              </h2>
              <Link to="/dashboard/earnings">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentEarnings.length > 0 ? (
                <div className="space-y-4">
                  {recentEarnings.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                          <DollarSign className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-success">
                        +${Number(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No earnings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 rounded-xl gradient-primary p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-primary-foreground">
                Ready to take on more work?
              </h3>
              <p className="text-primary-foreground/80">
                Browse available tasks and submit your bids
              </p>
            </div>
            <Link to="/dashboard/tasks">
              <Button variant="accent" size="lg">
                Browse Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
