'use client';

import { useEffect } from 'react';

/**
 * Ensures the entire dashboard, including portals (dialogs, popovers, dropdowns,
 * tooltips, sheets, command palettes) that mount to document.body, inherits
 * the Vengence UI Orbitron typography system.
 */
export function DashboardFontSync() {
  useEffect(() => {
    document.documentElement.classList.add('vengence-dashboard-active');
    document.body.classList.add('vengence-dashboard-active');

    return () => {
      document.documentElement.classList.remove('vengence-dashboard-active');
      document.body.classList.remove('vengence-dashboard-active');
    };
  }, []);

  return null;
}
