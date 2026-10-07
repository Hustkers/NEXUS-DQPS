'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

export default function ProfileViewPage() {
  const [name, setName] = useState('Pragyan P.');
  const [email] = useState('pragyan@nexus-d2c.ai');
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [cpmAlerts, setCpmAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const handleCopyKey = (key: string, label: string) => {
    navigator.clipboard.writeText(key);
    toast.success(`${label} Copied to Clipboard`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile Settings Saved', {
      description: 'Your profile and alerting preferences have been updated.'
    });
  };

  return (
    <div className='flex w-full flex-col gap-6 p-4 md:p-6 font-mono text-xs max-w-5xl mx-auto'>
      {/* Header Banner */}
      <div className='flex items-center justify-between border-b border-border/80 pb-4'>
        <div>
          <h1 className='text-xl font-bold font-sans text-foreground'>Account &amp; Security Profile</h1>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Autonomous Brand Lead Credentials, API Telemetry Secrets, and Alert Routing
          </p>
        </div>
        <Badge className='bg-emerald-600 text-white font-mono text-xs'>
          SUPER ADMIN
        </Badge>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Left Column: Identity & Contact */}
        <div className='md:col-span-2 space-y-6'>
          <Card className='border border-border/80 bg-card shadow-xs'>
            <CardHeader>
              <CardTitle className='text-base font-bold font-sans'>Identity &amp; Profile Details</CardTitle>
              <CardDescription className='text-xs'>
                Personal information associated with your autonomous decision audit logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <label className='text-muted-foreground text-[11px] block'>Full Name</label>
                    <input
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-muted-foreground text-[11px] block'>Email Address</label>
                    <input
                      type='email'
                      disabled
                      value={email}
                      className='w-full h-9 rounded-md border border-border bg-muted/40 px-3 text-xs font-mono text-muted-foreground cursor-not-allowed'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <label className='text-muted-foreground text-[11px] block'>Timezone</label>
                    <input
                      type='text'
                      disabled
                      value='Asia/Kolkata (IST - UTC+05:30)'
                      className='w-full h-9 rounded-md border border-border bg-muted/40 px-3 text-xs font-mono text-muted-foreground'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-muted-foreground text-[11px] block'>Default Currency</label>
                    <input
                      type='text'
                      disabled
                      value='INR (₹) - Indian Rupee'
                      className='w-full h-9 rounded-md border border-border bg-muted/40 px-3 text-xs font-mono text-muted-foreground'
                    />
                  </div>
                </div>

                <Button type='submit' size='sm' className='font-bold bg-foreground text-background hover:bg-foreground/90'>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* API Keys Card */}
          <Card className='border border-border/80 bg-card shadow-xs'>
            <CardHeader>
              <CardTitle className='text-base font-bold font-sans'>API Telemetry Keys</CardTitle>
              <CardDescription className='text-xs'>
                Use these bearer tokens to authenticate high-frequency webhook ingest and MCP connectors.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between'>
                <div>
                  <span className='text-[10px] uppercase font-bold text-muted-foreground block'>
                    Production Ingestion Key
                  </span>
                  <code className='text-foreground text-xs'>nx_live_98a7f401bc24982a...</code>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleCopyKey('nx_live_98a7f401bc24982a884e9102c771fae0', 'Production Ingestion Key')}
                  className='h-7 text-xs font-semibold'
                >
                  <Icons.copy className='size-3 mr-1' />
                  Copy
                </Button>
              </div>

              <div className='p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between'>
                <div>
                  <span className='text-[10px] uppercase font-bold text-muted-foreground block'>
                    Webhook HMAC Signing Secret
                  </span>
                  <code className='text-foreground text-xs'>whsec_d47b198c02efa718...</code>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleCopyKey('whsec_d47b198c02efa718b521099238bc3', 'Webhook Secret')}
                  className='h-7 text-xs font-semibold'
                >
                  <Icons.copy className='size-3 mr-1' />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Notifications */}
        <div className='space-y-6'>
          {/* Security Overview */}
          <Card className='border border-border/80 bg-card shadow-xs'>
            <CardHeader>
              <CardTitle className='text-sm font-bold font-sans'>Security &amp; 2FA</CardTitle>
              <CardDescription className='text-xs'>Authentication safeguard level</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Two-Factor Auth</span>
                <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                  Enforced (FIDO2)
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Active Sessions</span>
                <span className='font-bold text-foreground'>2 Devices</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>RBAC Role</span>
                <span className='font-bold text-foreground'>Root Admin</span>
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => toast.info('Hardware key verification active.')}
                className='w-full mt-2 text-xs font-mono'
              >
                Manage Security Keys
              </Button>
            </CardContent>
          </Card>

          {/* Alerting Preferences */}
          <Card className='border border-border/80 bg-card shadow-xs'>
            <CardHeader>
              <CardTitle className='text-sm font-bold font-sans'>Anomaly Alerting</CardTitle>
              <CardDescription className='text-xs'>Instant autonomous dispatch rules</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-foreground font-semibold'>Telegram Anomaly Dispatch</div>
                  <div className='text-[10px] text-muted-foreground'>Urgent stockout &amp; surge alerts</div>
                </div>
                <Button
                  size='sm'
                  variant={telegramAlerts ? 'secondary' : 'outline'}
                  onClick={() => {
                    setTelegramAlerts(!telegramAlerts);
                    toast.info(telegramAlerts ? 'Telegram alerts muted' : 'Telegram alerts enabled');
                  }}
                  className='h-7 text-xs'
                >
                  {telegramAlerts ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-foreground font-semibold'>CPM Volatility Threshold</div>
                  <div className='text-[10px] text-muted-foreground'>Trigger on &gt;30% variance</div>
                </div>
                <Button
                  size='sm'
                  variant={cpmAlerts ? 'secondary' : 'outline'}
                  onClick={() => {
                    setCpmAlerts(!cpmAlerts);
                    toast.info(cpmAlerts ? 'CPM alerts muted' : 'CPM alerts enabled');
                  }}
                  className='h-7 text-xs'
                >
                  {cpmAlerts ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-foreground font-semibold'>Daily Executive Briefing</div>
                  <div className='text-[10px] text-muted-foreground'>08:00 IST morning summary</div>
                </div>
                <Button
                  size='sm'
                  variant={dailyDigest ? 'secondary' : 'outline'}
                  onClick={() => {
                    setDailyDigest(!dailyDigest);
                    toast.info(dailyDigest ? 'Daily digest disabled' : 'Daily digest enabled');
                  }}
                  className='h-7 text-xs'
                >
                  {dailyDigest ? 'ON' : 'OFF'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
