'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type AdChannel = 'all' | 'amazon' | 'google' | 'meta' | 'shopify';

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
    subtitle: 'Amazon • Google • Meta • Shopify',
    badge: 'Blended',
    accentColor: 'text-white border-[#8A8A8A] bg-[#1A1A1A]'
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon Ads',
    fullName: 'Amazon Advertising',
    subtitle: 'Sponsored Products & Buy Box',
    badge: 'Buy Box',
    accentColor: 'text-white border-[#8A8A8A] bg-[#1A1A1A]'
  },
  google: {
    id: 'google',
    name: 'Google Ads',
    fullName: 'Google Performance Max',
    subtitle: 'Shopping & Search Intent',
    badge: 'P-Max',
    accentColor: 'text-white border-[#8A8A8A] bg-[#1A1A1A]'
  },
  meta: {
    id: 'meta',
    name: 'Meta Ads',
    fullName: 'Meta Advantage+',
    subtitle: 'Instagram, Reels & Feed',
    badge: 'Advantage+',
    accentColor: 'text-white border-[#8A8A8A] bg-[#1A1A1A]'
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify Store',
    fullName: 'Shopify D2C Storefront',
    subtitle: 'Direct Checkout & Retention',
    badge: 'Storefront',
    accentColor: 'text-white border-[#8A8A8A] bg-[#1A1A1A]'
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
      if (urlChannel && (urlChannel === 'all' || urlChannel === 'amazon' || urlChannel === 'google' || urlChannel === 'meta' || urlChannel === 'shopify')) {
        setChannelState(urlChannel);
      } else {
        const saved = localStorage.getItem('nexus_ad_channel') as AdChannel;
        if (saved && (saved === 'all' || saved === 'amazon' || saved === 'google' || saved === 'meta' || saved === 'shopify')) {
          setChannelState(saved);
        }
      }

      const handleChannelChange = (e: Event) => {
        const customEvent = e as CustomEvent<{ channel: AdChannel }>;
        const ch = customEvent.detail?.channel;
        if (ch && CHANNELS[ch]) {
          setChannel(ch);
        }
      };

      const handleUiAction = (e: Event) => {
        const customEvent = e as CustomEvent<{ type: string; payload: any }>;
        if (customEvent.detail?.type === 'FILTER_CHANNEL') {
          const ch = customEvent.detail.payload?.channel as AdChannel;
          if (ch && CHANNELS[ch]) {
            setChannel(ch);
          }
        }
      };

      window.addEventListener('nexus:channel_changed', handleChannelChange);
      window.addEventListener('nexus:ui_action', handleUiAction);

      return () => {
        window.removeEventListener('nexus:channel_changed', handleChannelChange);
        window.removeEventListener('nexus:ui_action', handleUiAction);
      };
    }
  }, [pathname]);

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
