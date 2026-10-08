export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts
    }).format(new Date(date));
  } catch {
    return '';
  }
}

export function formatCurrency(val: number, options?: { decimals?: number; compact?: boolean }) {
  const decimals = options?.decimals !== undefined ? options.decimals : (options?.compact ? 1 : 2);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: options?.compact ? 'compact' : 'standard',
  }).format(val);
}

export function formatNumber(val: number, options?: { decimals?: number; compact?: boolean }) {
  const decimals = options?.decimals ?? 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: options?.compact ? 'compact' : 'standard',
  }).format(val);
}

export function formatROAS(val: number, options?: { decimals?: number }) {
  const decimals = options?.decimals ?? 2;
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val)}x`;
}

export function formatPercent(val: number, options?: { decimals?: number; showSign?: boolean }) {
  const decimals = options?.decimals ?? 1;
  const num = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: options?.showSign ? 'exceptZero' : 'auto',
  }).format(val);
  return `${num}%`;
}

export function formatINR(val: number, options?: { decimals?: number }) {
  const decimals = options?.decimals ?? 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}
