import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  DollarSign,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function TasksList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available tasks
  const { data: openTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'available'],
    queryFn: () => api.getAvailableTasks(),
  });

  const subjects = [...new Set(openTasks.map((t: any) => t.subject))];

  const filteredTasks = openTasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || task.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // Create bid mutation
  const createBidMutation = useMutation({
    mutationFn: (data: { taskId: string; amount: number; proposal: string }) =>
      api.createBid(data),
    onSuccess: () => {
      toast({
        title: 'Bid submitted!',
        description: `Your bid of $${bidAmount} has been submitted.`,
      });
      setIsBidDialogOpen(false);
      setBidAmount('');
      setBidMessage('');
      setSelectedTask(null);
      queryClient.invalidateQueries({ queryKey: ['bids'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to submit bid',
        description: error.message || 'Please try again.',
      });
    },
  });

  const handleBidSubmit = () => {
    if (!bidAmount || !bidMessage || !selectedTask) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please enter a bid amount and message.',
      });
      return;
    }

    createBidMutation.mutate({
      taskId: selectedTask.id,
      amount: parseFloat(bidAmount),
      proposal: bidMessage,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Available Tasks
          </h1>
          <p className="mt-1 text-muted-foreground">
            Browse and bid on writing tasks
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {task.subject}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {task._count?.bids || 0} bids
                </span>
              </div>

              <h3 className="mb-2 font-display font-semibold text-foreground line-clamp-2">
                {task.title}
              </h3>

              <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>

              <div className="mb-4 grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{task.pages} pages</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${Number(task.budget).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(task.deadline))}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Due {format(new Date(task.deadline), 'MMM d, yyyy')}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedTask(task);
                    setBidAmount(Number(task.budget).toFixed(2));
                    setIsBidDialogOpen(true);
                  }}
                >
                  Place Bid
                </Button>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No tasks found
            </h3>
            <p className="mt-1 text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : null}

        {/* Bid Dialog */}
        <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Place a Bid</DialogTitle>
              <DialogDescription>
                Submit your bid for: {selectedTask?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Client Budget:</span>
                  <span className="font-semibold text-foreground">${selectedTask ? Number(selectedTask.budget).toFixed(2) : '0.00'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pages:</span>
                  <span className="font-semibold text-foreground">{selectedTask?.pages} pages</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-semibold text-foreground">
                    {selectedTask && format(new Date(selectedTask.deadline), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidAmount">Your Bid Amount ($)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidMessage">Cover Letter</Label>
                <Textarea
                  id="bidMessage"
                  placeholder="Explain why you're the best fit for this task..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBidDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBidSubmit} disabled={createBidMutation.isPending}>
                {createBidMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Bid'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
