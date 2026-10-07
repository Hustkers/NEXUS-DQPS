'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { teamInfoContent } from '@/config/infoconfig';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Optimizer' | 'Analyst';
  status: 'Active' | 'Pending';
  lastActive: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: 'usr-1', name: 'Pragyan P.', email: 'pragyan@nexus-d2c.ai', role: 'Owner', status: 'Active', lastActive: 'Now' },
  { id: 'usr-2', name: 'Shivam Kumar', email: 'shivam@nexus-d2c.ai', role: 'Admin', status: 'Active', lastActive: '5m ago' },
  { id: 'usr-3', name: 'Garv B.', email: 'garv@nexus-d2c.ai', role: 'Optimizer', status: 'Active', lastActive: '1h ago' },
  { id: 'usr-4', name: 'Abhishek R.', email: 'abhishek@nexus-d2c.ai', role: 'Analyst', status: 'Active', lastActive: '1d ago' }
];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: Member = {
      id: `usr-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'Optimizer',
      status: 'Pending',
      lastActive: 'Invited'
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
    toast.success(`Invitation Sent to ${inviteEmail}`, {
      description: 'Role: Optimizer with autonomous budget reallocation authorization.'
    });
  };

  const handleRemove = (id: string, name: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.info(`Removed ${name} from Workspace`, {
      description: 'Revoked API keys and session tokens.'
    });
  };

  return (
    <PageContainer
      pageTitle='Team & Access Control'
      pageDescription='Manage workspace collaborators, autonomous execution permissions, and RBAC policies'
      infoContent={teamInfoContent}
    >
      <div className='space-y-6 font-mono text-xs'>
        {/* Navigation Breadcrumb */}
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Link href='/dashboard/workspaces' className='hover:text-foreground underline'>
            Workspaces
          </Link>
          <span>/</span>
          <span className='text-foreground font-bold'>Team &amp; Roles</span>
        </div>

        {/* Invite Member Card */}
        <Card className='border border-border/80 bg-card shadow-xs'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-bold font-sans'>Invite New Collaborator</CardTitle>
            <CardDescription className='text-xs'>
              Send an email invitation with granular permissions for autonomous campaign orchestration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className='flex flex-col sm:flex-row gap-3'>
              <input
                type='email'
                placeholder='colleague@brand.com'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className='flex-1 h-9 rounded-md border border-border bg-background px-3 text-xs font-mono placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary'
              />
              <Button type='submit' size='sm' className='font-bold bg-foreground text-background hover:bg-foreground/90'>
                <Icons.plus className='size-3.5 mr-1.5' />
                Send Invitation
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Members List Table */}
        <div className='rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs'>
          <div className='p-4 border-b border-border/80 flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-bold text-foreground font-sans'>Active Members ({members.length})</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>Users with access to autonomous decision telemetry.</p>
            </div>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                toast.success('Access Audit Log Exported', {
                  description: 'CSV report with 2FA status, last login, and action ledger downloaded.'
                });
              }}
              className='text-xs font-semibold'
            >
              <Icons.download className='size-3 mr-1.5' />
              Export Audit Log
            </Button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-left text-xs font-mono border-collapse'>
              <thead>
                <tr className='border-b border-border/80 bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider select-none'>
                  <th className='py-2.5 px-4 font-semibold'>User</th>
                  <th className='py-2.5 px-4 font-semibold'>Role</th>
                  <th className='py-2.5 px-4 font-semibold'>Status</th>
                  <th className='py-2.5 px-4 font-semibold'>Last Active</th>
                  <th className='py-2.5 px-4 text-right font-semibold'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/60'>
                {members.map((m) => (
                  <tr key={m.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='py-3 px-4'>
                      <div className='font-bold text-foreground font-sans text-xs'>{m.name}</div>
                      <div className='text-[11px] text-muted-foreground font-mono'>{m.email}</div>
                    </td>
                    <td className='py-3 px-4'>
                      <Badge variant='outline' className='text-[10px] font-mono'>
                        {m.role}
                      </Badge>
                    </td>
                    <td className='py-3 px-4'>
                      <Badge
                        variant='outline'
                        className={`text-[10px] ${
                          m.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className='py-3 px-4 text-muted-foreground'>{m.lastActive}</td>
                    <td className='py-3 px-4 text-right'>
                      {m.role === 'Owner' ? (
                        <span className='text-[11px] text-muted-foreground italic'>Owner</span>
                      ) : (
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleRemove(m.id, m.name)}
                          className='h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs'
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
