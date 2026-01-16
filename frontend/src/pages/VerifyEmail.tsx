import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenTool, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const data = await api.verifyEmail(token);
      setStatus('success');
      setMessage(data.message || 'Email verified successfully!');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError) {
        setMessage(error.message || 'Verification failed');
      } else {
        setMessage('Unable to verify email. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md animate-scale-in text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
              <PenTool className="h-5 w-5 text-primary-foreground" />
            </div>
            WriteMarket
          </Link>

          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
            {status === 'loading' && (
              <>
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
                  Verifying your email...
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Please wait while we verify your account
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
                  Email verified! 🎉
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {message}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Redirecting to login page...
                </p>
                <Button
                  variant="hero"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => navigate('/auth/login')}
                >
                  Go to login
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
                  Verification failed
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {message}
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/auth/resend-verification')}
                  >
                    Resend verification email
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/auth/login')}
                  >
                    Back to login
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}