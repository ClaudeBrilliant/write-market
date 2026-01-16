import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PenTool, ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both email and password.',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: 'Welcome back! 👋',
          description: 'You have successfully logged in.',
        });
        // Navigation is handled in AuthContext based on role
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: result.error || 'Invalid email or password.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Connection error',
        description: 'Unable to connect to the server. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill for testing (remove in production)
  const handleQuickFill = (role: 'admin' | 'writer') => {
    if (role === 'admin') {
      setEmail('admin@writemarket.com');
      setPassword('admin123');
    } else {
      setEmail('writer@writemarket.com');
      setPassword('writer123');
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Link
          to="/"
          className="absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors md:left-8 md:top-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="w-full max-w-md animate-scale-in">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
                <PenTool className="h-5 w-5 text-primary-foreground" />
              </div>
              WriteMarket
            </Link>
            <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Quick fill for testing - Remove in production */}
            {import.meta.env.DEV && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-center text-muted-foreground">Quick fill (Dev only):</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFill('admin')}
                    className="flex-1 text-xs"
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFill('writer')}
                    className="flex-1 text-xs"
                  >
                    Writer
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/auth/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>

          {/* Email verification notice */}
          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground text-center">
              Haven't verified your email?{' '}
              <Link to="/auth/resend-verification" className="text-primary hover:underline">
                Resend verification link
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
