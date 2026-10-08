import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Decision Engine',
    items: [
      {
        title: 'Mission Control',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: true,
        shortcut: ['m', 'c'],
        items: []
      },
      {
        title: 'Learning Engine',
        url: '/dashboard/autonomous-engine',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['a', 'l'],
        items: []
      },
      {
        title: 'Strategy Engine',
        url: '/dashboard/strategy-engine',
        icon: 'bot',
        isActive: false,
        shortcut: ['a', 'e'],
        items: []
      },
      {
        title: 'Global Telemetry',
        url: '/dashboard/globe',
        icon: 'globe',
        isActive: false,
        shortcut: ['3', 'g'],
        items: []
      },
      {
        title: 'Anomalies & RCA',
        url: '/dashboard/anomalies',
        icon: 'warning',
        isActive: false,
        shortcut: ['r', 'c'],
        items: []
      },
      {
        title: 'Performance Gauges',
        url: '/dashboard/gauges',
        icon: 'trendingUp',
        isActive: false,
        shortcut: ['r', 'g'],
        items: []
      },
      {
        title: 'Reallocations',
        url: '/dashboard/reallocations',
        icon: 'adjustments',
        isActive: false,
        shortcut: ['b', 'r'],
        items: []
      },
      {
        title: 'Ad Playground',
        url: '/dashboard/playground',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['a', 'p'],
        items: []
      },
      {
        title: 'Decision Ledger',
        url: '/dashboard/ledger',
        icon: 'check',
        isActive: false,
        shortcut: ['d', 'l'],
        items: []
      },
      {
        title: 'Visitor Attribution',
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
        title: 'Identity Graph',
        url: '/dashboard/fingerprint',
        icon: 'fingerprint',
        isActive: false,
        shortcut: ['f', 'p'],
        items: []
      },
      {
        title: 'Scenario Simulator',
        url: '/dashboard/simulator',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['s', 's'],
        items: []
      },
      {
        title: 'Product Catalog',
        url: '/dashboard/product',
        icon: 'kanban',
        isActive: false,
        shortcut: ['n', 'p'],
        items: []
      },
      {
        title: 'SKU Matrix',
        url: '/dashboard/matrix',
        icon: 'product',
        isActive: false,
        shortcut: ['s', 'm'],
        items: []
      },
      {
        title: 'Schema Normalizer',
        url: '/dashboard/normalization',
        icon: 'normalization',
        isActive: false,
        shortcut: ['s', 'n'],
        items: []
      }
    ]
  }
];
