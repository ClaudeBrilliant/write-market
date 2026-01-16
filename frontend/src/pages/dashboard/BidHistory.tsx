import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Gavel,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function BidHistory() {
  const { data: userBids = [], isLoading } = useQuery({
    queryKey: ['bids', 'my-bids'],
    queryFn: () => api.getMyBids(),
  });
  
  const pendingBids = userBids.filter((b: any) => b.status === 'PENDING');
  const acceptedBids = userBids.filter((b: any) => b.status === 'APPROVED');
  const rejectedBids = userBids.filter((b: any) => b.status === 'REJECTED');

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning/10 text-warning';
      case 'APPROVED':
        return 'bg-success/10 text-success';
      case 'REJECTED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Clock;
      case 'APPROVED':
        return CheckCircle;
      case 'REJECTED':
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            My Bids
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track all your bid submissions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="font-display text-2xl font-bold text-foreground">{pendingBids.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="font-display text-2xl font-bold text-foreground">{acceptedBids.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="font-display text-2xl font-bold text-foreground">{rejectedBids.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bids List */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              All Bids
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userBids.length > 0 ? (
            <div className="divide-y divide-border">
              {userBids.map((bid: any) => {
                const StatusIcon = getStatusIcon(bid.status);
                return (
                  <div key={bid.id} className="p-5 transition-colors hover:bg-muted/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Gavel className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {bid.task?.title || 'Task'}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {bid.proposal}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              ${Number(bid.amount).toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(bid.status)}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {bid.status === 'APPROVED' ? 'Accepted' : bid.status === 'PENDING' ? 'Pending' : 'Rejected'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Gavel className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                No bids yet
              </h3>
              <p className="mt-1 text-muted-foreground">
                Start bidding on available tasks
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
