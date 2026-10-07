'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { workspacesInfoContent } from '@/config/infoconfig';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  role: string;
  members: number;
  activeSkus: number;
  environment: 'Production' | 'Staging' | 'Sandbox';
  isCurrent: boolean;
}

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-8824',
    name: 'NEXUS Omnichannel Production',
    role: 'Owner & Admin',
    members: 12,
    activeSkus: 18,
    environment: 'Production',
    isCurrent: true
  },
  {
    id: 'ws-4109',
    name: 'Nike Global DTC Staging',
    role: 'Optimizer Lead',
    members: 6,
    activeSkus: 5,
    environment: 'Staging',
    isCurrent: false
  },
  {
    id: 'ws-1029',
    name: 'Autonomous Reallocation Sandbox',
    role: 'ML Engineer',
    members: 3,
    activeSkus: 2,
    environment: 'Sandbox',
    isCurrent: false
  }
];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);

  const handleSwitchWorkspace = (id: string, name: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        isCurrent: w.id === id
      }))
    );
    toast.success(`Switched to ${name}`, {
      description: 'Autonomous decision context and telemetry telemetry synchronized.'
    });
  };

  const handleCreateWorkspace = () => {
    const newWs: Workspace = {
      id: `ws-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `Autonomous Cluster #${workspaces.length + 1}`,
      role: 'Owner',
      members: 1,
      activeSkus: 0,
      environment: 'Sandbox',
      isCurrent: false
    };
    setWorkspaces((prev) => [...prev, newWs]);
    toast.success(`Created ${newWs.name}`, {
      description: 'Isolated workspace provisioned with default causal telemetry DAG.'
    });
  };

  return (
    <PageContainer
      pageTitle='Workspace Management'
      pageDescription='Manage isolated DTC brand environments, multi-tenant access, and team boundaries'
      infoContent={workspacesInfoContent}
    >
      <div className='space-y-6 font-mono text-xs'>
        {/* Header Action Bar */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-xs'>
          <div>
            <h2 className='text-base font-bold text-foreground font-sans'>
              Active Organizations &amp; Workspaces
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Switch between isolated brand datasets and allocation engines.
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Link href='/dashboard/workspaces/team'>
              <Button size='sm' variant='outline' className='text-xs font-semibold'>
                <Icons.users className='size-3.5 mr-1.5' />
                Manage Team
              </Button>
            </Link>
            <Button
              size='sm'
              onClick={handleCreateWorkspace}
              className='text-xs font-bold bg-foreground text-background hover:bg-foreground/90'
            >
              <Icons.plus className='size-3.5 mr-1.5' />
              New Workspace
            </Button>
          </div>
        </div>

        {/* Workspaces List */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              className={`flex flex-col justify-between border shadow-xs transition-all ${
                ws.isCurrent ? 'border-primary ring-1 ring-primary/20 bg-muted/20' : 'hover:border-border'
              }`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <Badge
                    variant='outline'
                    className={`text-[10px] uppercase font-bold ${
                      ws.environment === 'Production'
                        ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                        : ws.environment === 'Staging'
                        ? 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {ws.environment}
                  </Badge>
                  {ws.isCurrent && (
                    <span className='inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                      <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                      Active
                    </span>
                  )}
                </div>
                <CardTitle className='text-base font-bold font-sans mt-2'>
                  {ws.name}
                </CardTitle>
                <CardDescription className='text-xs'>
                  ID: <code className='text-foreground'>{ws.id}</code> • Role: {ws.role}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 pt-0'>
                <div className='grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/60'>
                  <div>
                    <span className='text-muted-foreground block text-[10px]'>Team Members</span>
                    <strong className='text-foreground text-xs'>{ws.members} collaborators</strong>
                  </div>
                  <div>
                    <span className='text-muted-foreground block text-[10px]'>Active SKUs</span>
                    <strong className='text-foreground text-xs'>{ws.activeSkus} automated</strong>
                  </div>
                </div>

                <div className='pt-2'>
                  {ws.isCurrent ? (
                    <Button disabled className='w-full text-xs font-mono' variant='secondary' size='sm'>
                      <Icons.check className='size-3 mr-1.5 text-emerald-500' />
                      Current Workspace
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSwitchWorkspace(ws.id, ws.name)}
                      className='w-full text-xs font-mono'
                      variant='outline'
                      size='sm'
                    >
                      Switch to Workspace &rarr;
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
