import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { 
  PenTool, 
  Shield, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  FileText,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Browse Tasks',
    description: 'Access a wide variety of academic writing tasks across different subjects and disciplines.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description: 'Set your own rates and bid on projects that match your expertise and availability.',
  },
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Work on your own terms. Choose tasks that fit your schedule and workload preferences.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Get paid promptly for completed work with our secure payment processing system.',
  },
];

const stats = [
  { value: '1,200+', label: 'Active Writers' },
  { value: '15,000+', label: 'Completed Tasks' },
  { value: '$2.5M+', label: 'Paid to Writers' },
  { value: '4.9/5', label: 'Average Rating' },
];

const steps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up as a writer and complete your profile with your expertise areas.',
  },
  {
    step: '02',
    title: 'Browse & Bid',
    description: 'Explore available tasks and place competitive bids on projects you want.',
  },
  {
    step: '03',
    title: 'Write & Submit',
    description: 'Complete assigned tasks with quality work and submit before the deadline.',
  },
  {
    step: '04',
    title: 'Get Paid',
    description: 'Receive payment directly to your wallet after task approval.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-subtle" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container relative py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-4 w-4" />
              <span>Join the top writing platform</span>
            </div>
            
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in">
              Your Skills,{' '}
              <span className="text-gradient">Your Earnings</span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Connect with clients seeking quality academic writing. Set your rates, 
              choose your projects, and build a successful freelance career.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth/register">
                <Button variant="hero" size="xl" className="gap-2">
                  Start Writing Today
                  <ArrowRight className="h-5 w-5"/>
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" size="xl">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-4 text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>Join 1,200+ writers earning on WriteMarket</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Why Writers Choose Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to succeed as a freelance academic writer
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-md">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 gradient-subtle">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start earning in four simple steps
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 font-display text-5xl font-bold text-primary/20">
                  {step.step}
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-8 bg-border lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 sm:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(0_0%_100%/0.1),transparent_50%)]" />
            
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Start Earning?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of writers who are building their careers on WriteMarket. 
                Sign up today and get access to high-paying writing opportunities.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth/register">
                  <Button variant="accent" size="xl" className="gap-2">
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <PenTool className="h-4 w-4 text-primary-foreground" />
              </div>
              WriteMarket
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WriteMarket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
