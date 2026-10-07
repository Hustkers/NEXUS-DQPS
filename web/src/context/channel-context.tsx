'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type AdChannel = 'all' | 'amazon' | 'google' | 'meta';

export interface ChannelInfo {
  id: AdChannel;
  name: string;
  fullName: string;
  subtitle: string;
  badge: string;
  accentColor: string;
}

export const CHANNELS: Record<AdChannel, ChannelInfo> = {
  all: {
    id: 'all',
    name: 'All Channels',
    fullName: 'Blended Omnichannel (D2C)',
    subtitle: 'Amazon • Google • Meta',
    badge: 'Blended',
    accentColor: 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20'
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon Ads',
    fullName: 'Amazon Advertising',
    subtitle: 'Sponsored Products & Buy Box',
    badge: 'Buy Box',
    accentColor: 'text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20'
  },
  google: {
    id: 'google',
    name: 'Google Ads',
    fullName: 'Google Performance Max',
    subtitle: 'Shopping & Search Intent',
    badge: 'P-Max',
    accentColor: 'text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-950/20'
  },
  meta: {
    id: 'meta',
    name: 'Meta Ads',
    fullName: 'Meta Advantage+',
    subtitle: 'Instagram, Reels & Feed',
    badge: 'Advantage+',
    accentColor: 'text-indigo-700 dark:text-sky-400 border-indigo-200 dark:border-sky-500/30 bg-indigo-50 dark:bg-sky-950/20'
  }
};

interface ChannelContextType {
  channel: AdChannel;
  setChannel: (channel: AdChannel) => void;
  channelInfo: ChannelInfo;
}

const ChannelContext = createContext<ChannelContextType>({
  channel: 'all',
  setChannel: () => {},
  channelInfo: CHANNELS.all
});

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const [channel, setChannelState] = useState<AdChannel>('all');
  const pathname = usePathname();

  // Initialize from URL search or localStorage safely on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlChannel = params.get('channel') as AdChannel;
      if (urlChannel && (urlChannel === 'all' || urlChannel === 'amazon' || urlChannel === 'google' || urlChannel === 'meta')) {
        setChannelState(urlChannel);
      } else {
        const saved = localStorage.getItem('nexus_ad_channel') as AdChannel;
        if (saved && (saved === 'all' || saved === 'amazon' || saved === 'google' || saved === 'meta')) {
          setChannelState(saved);
        }
      }
    }
  }, []);

  const setChannel = (newChannel: AdChannel) => {
    setChannelState(newChannel);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nexus_ad_channel', newChannel);
        const params = new URLSearchParams(window.location.search);
        if (newChannel === 'all') {
          params.delete('channel');
        } else {
          params.set('channel', newChannel);
        }
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        const newUrl = `${pathname || window.location.pathname}${queryStr}`;
        window.history.replaceState(null, '', newUrl);

        // Dispatch a custom event so other components can react immediately if needed
        window.dispatchEvent(new CustomEvent('nexus-channel-change', { detail: { channel: newChannel } }));
      } catch {
        // ignore storage/history exceptions
      }
    }
  };

  return (
    <ChannelContext.Provider
      value={{
        channel,
        setChannel,
        channelInfo: CHANNELS[channel] || CHANNELS.all
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  return useContext(ChannelContext);
}
