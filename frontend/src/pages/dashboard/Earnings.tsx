import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift,
  DollarSign,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function Earnings() {
  const { user } = useAuth();
  
  const { data: userTransactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'my-transactions'],
    queryFn: () => api.getMyTransactions(),
  });
  
  const totalEarnings = userTransactions
    .filter((t: any) => t.type === 'EARNING')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  const totalWithdrawals = Math.abs(userTransactions
    .filter((t: any) => t.type === 'WITHDRAWAL')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0));

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARNING':
        return ArrowDownLeft;
      case 'WITHDRAWAL':
        return ArrowUpRight;
      case 'BONUS':
        return Gift;
      default:
        return DollarSign;
    }
  };

  const getTransactionStyles = (type: string) => {
    switch (type) {
      case 'EARNING':
        return 'bg-success/10 text-success';
      case 'WITHDRAWAL':
        return 'bg-destructive/10 text-destructive';
      case 'BONUS':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Earnings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your wallet and transactions
          </p>
        </div>

        {/* Wallet Card */}
        <div className="mb-8 rounded-2xl gradient-primary p-6 text-primary-foreground shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-primary-foreground/70">Available Balance</p>
              <p className="mt-1 font-display text-4xl font-bold">
                ${(user?.walletBalance ?? 0).toFixed(2)}
              </p>
            </div>
            <Button variant="accent" size="lg">
              <Wallet className="mr-2 h-4 w-4" />
              Withdraw Funds
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="font-display text-xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <ArrowUpRight className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Withdrawn</p>
                <p className="font-display text-xl font-bold text-foreground">${totalWithdrawals.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="font-display text-xl font-bold text-foreground">$0.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Transaction History
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {userTransactions.map((transaction: any) => {
                const Icon = getTransactionIcon(transaction.type);
                const amount = Number(transaction.amount);
                const isPositive = amount > 0;
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-5 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTransactionStyles(transaction.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'MMM d, yyyy · h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}${Math.abs(amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                No transactions yet
              </h3>
              <p className="mt-1 text-muted-foreground">
                Complete tasks to start earning
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
