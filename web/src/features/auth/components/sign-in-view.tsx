'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInViewPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Authenticated as Pragyan P. (Admin)', {
        description: 'Session token issued. Redirecting to Autonomous Decision Console...'
      });
      router.push('/dashboard/strategy-engine');
    }, 600);
  };

  const handleDemoLogin = () => {
    setEmail('pragyan@nexus-d2c.ai');
    setPassword('nexus-autonomous-2026');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Demo Credentials Loaded: Pragyan P.', {
        description: 'Bypassing MFA challenge for verified test cluster.'
      });
      router.push('/dashboard/strategy-engine');
    }, 500);
  };

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#07090e] font-mono text-xs'>
      <div className='w-full max-w-md space-y-6'>
        {/* Brand Header */}
        <div className='text-center space-y-2'>
          <div className='inline-flex items-center justify-center size-10 rounded-xl bg-foreground text-background font-bold text-lg mb-2 shadow-sm'>
            N
          </div>
          <h1 className='text-xl font-bold font-sans text-foreground'>
            NEXUS-D2C Mission Control
          </h1>
          <p className='text-xs text-muted-foreground'>
            Autonomous E-Commerce Advertising Decision &amp; Optimization Engine
          </p>
        </div>

        {/* Auth Form Card */}
        <div className='p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-muted-foreground text-[11px] block font-semibold'>
                Work Email Address
              </label>
              <input
                type='email'
                required
                placeholder='pragyan@nexus-d2c.ai'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <label className='text-muted-foreground text-[11px] font-semibold'>
                  Password
                </label>
                <button
                  type='button'
                  onClick={() => toast.info('Password reset link dispatched to work email.')}
                  className='text-[10px] text-muted-foreground hover:text-foreground underline'
                >
                  Forgot?
                </button>
              </div>
              <input
                type='password'
                required
                placeholder='••••••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
              />
            </div>

            <Button
              type='submit'
              disabled={loading}
              className='w-full h-9 text-xs font-bold uppercase bg-foreground text-background hover:bg-foreground/90'
            >
              {loading ? (
                <>
                  <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                  Verifying Session...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          <div className='relative flex items-center justify-center'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative px-2 bg-card text-[10px] uppercase text-muted-foreground'>
              or fast track
            </div>
          </div>

          <Button
            type='button'
            variant='outline'
            onClick={handleDemoLogin}
            disabled={loading}
            className='w-full h-9 text-xs font-semibold'
          >
            <Icons.sparkles className='size-3.5 mr-1.5 text-indigo-500' />
            1-Click Demo Sign In (Super Admin)
          </Button>

          <div className='text-center pt-2 border-t border-border/60 text-muted-foreground text-[11px]'>
            Don&apos;t have an account?{' '}
            <Link href='/auth/sign-up' className='text-foreground font-semibold underline'>
              Create an Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
