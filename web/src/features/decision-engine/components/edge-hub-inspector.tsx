'use client';

import React, { useState } from 'react';
import { EdgeDeliveryHub, EDGE_HUBS } from '@/data/ad-delivery-hubs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconX,
  IconBolt,
  IconServer,
  IconActivity,
  IconArrowsExchange,
  IconCheck,
  IconLoader2
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface EdgeHubInspectorProps {
  hub: EdgeDeliveryHub;
  onClose: () => void;
  onSelectPeer?: (peerId: string) => void;
}

export function EdgeHubInspector({
  hub,
  onClose,
  onSelectPeer
}: EdgeHubInspectorProps) {
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    latency: number;
    jitter: number;
    timestamp: string;
  } | null>(null);

  const handleRunPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      // Simulate realistic network jitter around the hub's latency
      const delta = (Math.random() - 0.5) * (hub.jitterMs * 2);
      const measuredLatency = Math.max(8, Math.round((hub.latencyMs + delta) * 10) / 10);
      const measuredJitter = Math.round((hub.jitterMs + (Math.random() - 0.5) * 0.4) * 10) / 10;
      setPingResult({
        latency: measuredLatency,
        jitter: measuredJitter,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsPinging(false);
    }, 450);
  };

  const peers = hub.connectedPeerIds
    .map((id) => EDGE_HUBS.find((h) => h.id === id))
    .filter(Boolean) as EdgeDeliveryHub[];

  return (
    <div
      role='dialog'
      aria-labelledby='edge-hub-title'
      className='animate-in fade-in zoom-in-95 duration-200 rounded-xl border border-cyan-500/30 bg-zinc-950/95 p-4 text-zinc-100 shadow-2xl backdrop-blur-md font-mono'
    >
      {/* Header */}
      <div className='flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='size-2 rounded-full bg-cyan-400 animate-ping shrink-0' />
            <h4 id='edge-hub-title' className='text-xs font-bold uppercase tracking-wider text-cyan-300'>
              {hub.code} • {hub.city}
            </h4>
            <Badge
              variant='outline'
              className='text-[9px] px-1.5 py-0 border-cyan-500/40 text-cyan-400 bg-cyan-950/40'
            >
              {hub.status}
            </Badge>
          </div>
          <p className='text-[10px] text-zinc-400 mt-1 truncate'>{hub.name}</p>
        </div>

        <button
          onClick={onClose}
          aria-label='Close inspector'
          className='rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors shrink-0'
        >
          <IconX className='size-3.5' />
        </button>
      </div>

      {/* Latency & Throughput Highlight Grid */}
      <div className='grid grid-cols-2 gap-2 my-3'>
        <div className='rounded-lg bg-zinc-900/80 border border-zinc-800 p-2.5'>
          <div className='text-[10px] text-zinc-500 flex items-center gap-1'>
            <IconActivity className='size-3 text-cyan-400' />
            Telemetry Latency
          </div>
          <div className='text-lg font-bold text-cyan-300 mt-0.5'>
            {pingResult ? pingResult.latency : hub.latencyMs}{' '}
            <span className='text-[10px] font-normal text-zinc-400'>ms</span>
          </div>
          <div className='text-[9px] text-zinc-500 mt-0.5'>
            Jitter ±{pingResult ? pingResult.jitter : hub.jitterMs}ms • P99: {hub.p99Ms}ms
          </div>
        </div>

        <div className='rounded-lg bg-zinc-900/80 border border-zinc-800 p-2.5'>
          <div className='text-[10px] text-zinc-500 flex items-center gap-1'>
            <IconServer className='size-3 text-emerald-400' />
            Throughput (QPS)
          </div>
          <div className='text-lg font-bold text-emerald-300 mt-0.5'>
            {hub.throughputReqSec.toLocaleString()}{' '}
            <span className='text-[10px] font-normal text-zinc-400'>req/s</span>
          </div>
          <div className='text-[9px] text-zinc-500 mt-0.5'>
            Fill: {hub.fillRatePct}% • Cache: {hub.cacheHitPct}%
          </div>
        </div>
      </div>

      {/* Platform & Routing Info */}
      <div className='space-y-1.5 text-[10px] bg-zinc-900/40 rounded-lg p-2.5 border border-zinc-800/60 mb-3'>
        <div className='flex justify-between items-center'>
          <span className='text-zinc-500'>Platform Vector:</span>
          <span className='text-zinc-200 font-semibold'>{hub.platformLabel}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-zinc-500'>Ad Impression Rate:</span>
          <span className='text-cyan-400 font-bold'>{hub.impressionsRate}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-zinc-500'>Packet Drop Rate:</span>
          <span className='text-emerald-400 font-semibold'>{hub.packetLossPct}% (Nominal)</span>
        </div>
        <div className='text-[9.5px] text-zinc-400 pt-1 border-t border-zinc-800/60 leading-relaxed'>
          {hub.description}
        </div>
      </div>

      {/* Connected Vector Peer Routes */}
      {peers.length > 0 && (
        <div className='mb-3'>
          <div className='text-[10px] text-zinc-500 flex items-center gap-1 mb-1.5'>
            <IconArrowsExchange className='size-3 text-cyan-400' />
            Connected Delivery Arcs ({peers.length}):
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {peers.map((peer) => (
              <button
                key={peer.id}
                onClick={() => onSelectPeer?.(peer.id)}
                className='text-[9px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 transition-all flex items-center gap-1'
                title={`Orient to ${peer.name}`}
              >
                <span>{peer.code}</span>
                <span className='text-cyan-400 font-bold'>{peer.latencyMs}ms</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80'>
        <Button
          size='sm'
          onClick={handleRunPing}
          disabled={isPinging}
          className='h-7 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white font-mono flex items-center gap-1 px-2.5'
        >
          {isPinging ? (
            <>
              <IconLoader2 className='size-3 animate-spin' />
              Pinging Node...
            </>
          ) : (
            <>
              <IconBolt className='size-3' />
              ⚡ Trigger Diagnostic Ping
            </>
          )}
        </Button>

        {pingResult && (
          <span className='text-[9px] text-emerald-400 flex items-center gap-1 shrink-0'>
            <IconCheck className='size-3' />
            ACK in {pingResult.latency}ms
          </span>
        )}
      </div>
    </div>
  );
}
