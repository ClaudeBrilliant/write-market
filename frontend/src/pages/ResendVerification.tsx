import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PenTool, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.resendVerification(email);
      toast({
        title: 'Verification email sent! 📧',
        description: 'Please check your inbox and spam folder.',
      });
      setEmail('');
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: 'destructive',
          title: 'Failed to send',
          description: error.message || 'Please try again later.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection error',
          description: 'Unable to connect to the server.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Link
          to="/auth/login"
          className="absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors md:left-8 md:top-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
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
              Resend verification
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your email to receive a new verification link
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
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}