import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Plus,
  MoreVertical,
  FileText,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ManageTasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    description: '',
    pages: '',
    budget: '',
    deadline: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.getTasks(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => api.createTask(data),
    onSuccess: () => {
      toast({
        title: 'Task created!',
        description: 'The task has been created successfully.',
      });
      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        subject: '',
        description: '',
        pages: '',
        budget: '',
        deadline: '',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create task',
        description: error.message || 'Please try again.',
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      toast({
        title: 'Task deleted!',
        description: 'The task has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete task',
        description: error.message || 'Please try again.',
      });
    },
  });

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.subject || !newTask.pages || !newTask.budget || !newTask.deadline) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    createTaskMutation.mutate({
      title: newTask.title,
      subject: newTask.subject,
      description: newTask.description,
      pages: parseInt(newTask.pages),
      budget: parseFloat(newTask.budget),
      deadline: newTask.deadline,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-success/10 text-success';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'bg-warning/10 text-warning';
      case 'COMPLETED':
        return 'bg-primary/10 text-primary';
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
              Manage Tasks
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create and manage writing assignments
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTasks.map((task: any) => (
            <div
              key={task.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <span className="text-xs text-muted-foreground">{task.subject}</span>
              <h3 className="mt-1 font-display font-semibold text-foreground line-clamp-2">
                {task.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{task.pages} pg</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${Number(task.budget).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(task.deadline), 'MMM d')}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>{task.bidsCount} bids</span>
                {task.assignedTo && (
                  <span className="text-primary">Assigned</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isLoading && filteredTasks.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No tasks found
            </h3>
            <p className="mt-1 text-muted-foreground">
              Create a new task to get started
            </p>
          </div>
        )}

        {/* Create Task Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new writing assignment for writers to bid on.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Research Paper on Climate Change"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Environmental Science"
                  value={newTask.subject}
                  onChange={(e) => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed task requirements..."
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    placeholder="10"
                    value={newTask.pages}
                    onChange={(e) => setNewTask(prev => ({ ...prev, pages: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="200"
                    value={newTask.budget}
                    onChange={(e) => setNewTask(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
