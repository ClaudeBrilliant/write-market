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
  MoreVertical,
  CheckCircle,
  XCircle,
  Ban,
  Mail,
  Star,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', statusFilter === 'all' ? undefined : statusFilter],
    queryFn: () => api.getUsers(statusFilter === 'all' ? undefined : { status: statusFilter.toUpperCase() }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      api.updateUserStatus(userId, status),
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'User status has been changed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update status',
        description: error.message || 'Please try again.',
      });
    },
  });

  const filteredUsers = users.filter((user: any) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (userId: string, newStatus: 'ACTIVE' | 'PENDING' | 'SUSPENDED') => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/10 text-success';
      case 'PENDING':
        return 'bg-warning/10 text-warning';
      case 'SUSPENDED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Manage Users
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage writer accounts
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Tasks</TableHead>
                <TableHead className="hidden md:table-cell">Rating</TableHead>
                <TableHead className="hidden lg:table-cell">Balance</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(user.status)}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    N/A
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      N/A
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    ${Number(user.walletBalance || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Mail className="h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status !== 'ACTIVE' && (
                          <DropdownMenuItem 
                            className="gap-2 text-success focus:text-success"
                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        {user.status !== 'PENDING' && (
                          <DropdownMenuItem 
                            className="gap-2 text-warning focus:text-warning"
                            onClick={() => handleStatusChange(user.id, 'PENDING')}
                          >
                            <XCircle className="h-4 w-4" />
                            Set Pending
                          </DropdownMenuItem>
                        )}
                        {user.status !== 'SUSPENDED' && (
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                          >
                            <Ban className="h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!isLoading && filteredUsers.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
