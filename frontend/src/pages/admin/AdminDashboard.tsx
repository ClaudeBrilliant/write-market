import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.getAdminDashboard(),
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.getUsers(),
  });

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.getTasks(),
  });

  const pendingUsers = allUsers.filter((u: any) => u.status === 'PENDING');
  const openTasks = allTasks.filter((t: any) => t.status === 'OPEN');

  const stats = [
    {
      label: 'Total Users',
      value: dashboardLoading ? '...' : (dashboardData?.totalUsers ?? 0),
      change: '+12%',
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active Tasks',
      value: dashboardLoading ? '...' : (dashboardData?.activeTasks ?? openTasks.length),
      change: '+8%',
      icon: FileText,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Completed Tasks',
      value: dashboardLoading ? '...' : (dashboardData?.completedTasks ?? 0),
      change: '+24%',
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Total Revenue',
      value: dashboardLoading 
        ? '...' 
        : `$${((dashboardData?.totalRevenue ?? 0) / 1000).toFixed(1)}k`,
      change: '+18%',
      icon: DollarSign,
      color: 'bg-accent/10 text-accent',
    },
  ];

  const isLoading = dashboardLoading || usersLoading || tasksLoading;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Platform overview and management
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
                    <p className="mt-1 text-xs text-success">{stat.change} this month</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        {!isLoading && (pendingUsers.length > 0) && (
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {pendingUsers.length > 0 && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {pendingUsers.length} users awaiting approval
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review and activate new writer accounts
                    </p>
                  </div>
                  <Link to="/admin/users">
                    <Button size="sm">Review</Button>
                  </Link>
                </div>
              </div>
            )}
            {pendingBids.length > 0 && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {pendingBids.length} bids pending review
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Approve or reject writer bids
                    </p>
                  </div>
                  <Link to="/admin/tasks">
                    <Button size="sm">Review</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Tasks
              </h2>
              <Link to="/admin/tasks">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : allTasks.slice(0, 4).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${Number(task.budget).toFixed(2)} · {task.pages} pages
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    task.status === 'OPEN' 
                      ? 'bg-success/10 text-success' 
                      : task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Users
              </h2>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : allUsers.slice(0, 4).map((writer: any) => (
                <div key={writer.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {writer.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {writer.firstName} {writer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {writer.email} · ${Number(writer.walletBalance || 0).toFixed(0)} balance
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    writer.status === 'ACTIVE' 
                      ? 'bg-success/10 text-success' 
                      : writer.status === 'PENDING'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {writer.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 rounded-xl gradient-primary p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-primary-foreground">
                Need to create a new task?
              </h3>
              <p className="text-primary-foreground/80">
                Add new writing assignments for your writers
              </p>
            </div>
            <Link to="/admin/tasks">
              <Button variant="accent" size="lg">
                Create Task
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
