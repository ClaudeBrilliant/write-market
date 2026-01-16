import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PenTool, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        variant: 'destructive',
        title: 'Terms required',
        description: 'Please agree to the terms and conditions.',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register({
        email,
        password,
        firstName,
        lastName,
      });

      if (result.success) {
        toast({
          title: 'Account created! 🎉',
          description: 'Please check your email to verify your account.',
        });
        navigate('/auth/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: result.error || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: 'Unable to connect to the server. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Access to high-paying writing tasks',
    'Flexible work schedule',
    'Secure and timely payments',
    'Supportive writer community',
  ];

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container flex min-h-screen py-12">
        <Link
          to="/"
          className="absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors md:left-8 md:top-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pr-12">
          <div className="max-w-md">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Join our community of professional writers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start earning by completing academic writing tasks on your own schedule.
            </p>
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md animate-scale-in">
            <div className="mb-8 text-center lg:text-left">
              <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
                  <PenTool className="h-5 w-5 text-primary-foreground" />
                </div>
                WriteMarket
              </Link>
              <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
                Create your account
              </h1>
              <p className="mt-2 text-muted-foreground">
                Start your journey as a professional writer
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
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
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
