import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Mission Intelligence',
    items: [
      {
        title: 'Mission Control Cockpit',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: true,
        shortcut: ['m', 'c'],
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
        title: 'Landing Pitch & Story',
        url: '/',
        icon: 'externalLink',
        isActive: false,
        shortcut: ['h', 'o'],
        items: []
      }
    ]
  },
  {
    label: 'Decision Intelligence',
    items: [
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
      }
    ]
  },
  {
    label: 'Attribution & Sandbox',
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
      }
    ]
  },
  {
    label: 'Commerce & Catalog',
    items: [
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
      }
    ]
  }
];
