import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PenTool,
  LayoutDashboard,
  FileText,
  Gavel,
  Wallet,
  LogOut,
  Menu,
  X,
  Users,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const writerNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Available Tasks', icon: FileText },
  { href: '/dashboard/bids', label: 'My Bids', icon: Gavel },
  { href: '/dashboard/earnings', label: 'Earnings', icon: Wallet },
];

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tasks', label: 'Manage Tasks', icon: FileText },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = isAdmin ? adminNavItems : writerNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform bg-sidebar transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <PenTool className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              WriteMarket
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-sidebar-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {isAdmin ? 'Administrator' : 'Writer'}
                </p>
              </div>
            </div>
            {!isAdmin && (
              <div className="mt-3 rounded-lg bg-sidebar-accent p-3">
                <p className="text-xs text-sidebar-foreground/60">Wallet Balance</p>
                <p className="text-lg font-bold text-sidebar-primary">
                  ${(user?.walletBalance ?? 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t border-sidebar-border p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-display font-bold">WriteMarket</span>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
