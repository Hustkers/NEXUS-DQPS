'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpViewPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Welcome to NEXUS, ${fullName || 'Leader'}!`, {
        description: `Workspace "${orgName || 'Omnichannel Cluster'}" provisioned with default causal attribution engine.`
      });
      router.push('/dashboard/strategy-engine');
    }, 600);
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
            Provision NEXUS Workspace
          </h1>
          <p className='text-xs text-muted-foreground'>
            Deploy Autonomous Decision Pipelines for Your E-Commerce Brand
          </p>
        </div>

        {/* Signup Form Card */}
        <div className='p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-muted-foreground text-[11px] block font-semibold'>
                Brand / Organization Name
              </label>
              <input
                type='text'
                required
                placeholder='Nike APAC / Acme D2C'
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className='w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-muted-foreground text-[11px] block font-semibold'>
                Full Name
              </label>
              <input
                type='text'
                required
                placeholder='Pragyan P.'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-muted-foreground text-[11px] block font-semibold'>
                Work Email Address
              </label>
              <input
                type='email'
                required
                placeholder='pragyan@brand.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-muted-foreground text-[11px] block font-semibold'>
                Create Password
              </label>
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
                  Provisioning Cluster...
                </>
              ) : (
                'Create Workspace &amp; Launch'
              )}
            </Button>
          </form>

          <div className='text-center pt-2 border-t border-border/60 text-muted-foreground text-[11px]'>
            Already have an active cluster?{' '}
            <Link href='/auth/sign-in' className='text-foreground font-semibold underline'>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
