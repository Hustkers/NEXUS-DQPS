import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Autonomous Decision Engine',
    items: [
      {
        title: 'Pitch & Overview',
        url: '/',
        icon: 'externalLink',
        isActive: false,
        shortcut: ['h', 'o'],
        items: []
      },
      {
        title: 'Mission Control',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: true,
        shortcut: ['m', 'c'],
        items: []
      },
      {
        title: 'AI Strategy Engine',
        url: '/dashboard/strategy-engine',
        icon: 'bot',
        isActive: false,
        shortcut: ['a', 'e'],
        items: []
      },
      {
        title: '3D Global Intelligence',
        url: '/dashboard/globe',
        icon: 'globe',
        isActive: false,
        shortcut: ['3', 'g'],
        items: []
      },
      {
        title: 'Diagnostic Anomalies & RCA',
        url: '/dashboard/anomalies',
        icon: 'warning',
        isActive: false,
        shortcut: ['r', 'c'],
        items: []
      },
      {
        title: 'ROAS & Health Gauges',
        url: '/dashboard/gauges',
        icon: 'trendingUp',
        isActive: false,
        shortcut: ['r', 'g'],
        items: []
      },
      {
        title: 'Budget Reallocation Feed',
        url: '/dashboard/reallocations',
        icon: 'adjustments',
        isActive: false,
        shortcut: ['b', 'r'],
        items: []
      },
      {
        title: 'Decision Ledger & Learning',
        url: '/dashboard/ledger',
        icon: 'check',
        isActive: false,
        shortcut: ['d', 'l'],
        items: []
      },
      {
        title: 'Visitor Tracking & Attribution',
        url: '/dashboard/tracking',
        icon: 'search',
        isActive: false,
        shortcut: ['v', 't'],
        items: []
      }
    ]
  },
  {
    label: 'Simulation & Catalog',
    items: [
      {
        title: 'Fingerprint Identity Tracker',
        url: '/dashboard/fingerprint',
        icon: 'fingerprint',
        isActive: false,
        shortcut: ['f', 'p'],
        items: []
      },
      {
        title: 'Scenario Shock Sandbox',
        url: '/dashboard/simulator',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['s', 's'],
        items: []
      },
      {
        title: 'Nike Footwear Catalog',
        url: '/dashboard/product',
        icon: 'kanban',
        isActive: false,
        shortcut: ['n', 'p'],
        items: []
      },
      {
        title: 'SKU & Channel Matrix',
        url: '/dashboard/matrix',
        icon: 'product',
        isActive: false,
        shortcut: ['s', 'm'],
        items: []
      },
      {
        title: 'Live Schema Normalizer',
        url: '/dashboard/normalization',
        icon: 'normalization',
        isActive: false,
        shortcut: ['s', 'n'],
        items: []
      }
    ]
  }
];
