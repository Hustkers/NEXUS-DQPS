import React from 'react';

export interface PlatformLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Official Google multi-color G logo (SVG vectors)
 */
export function GoogleLogo({ className, size = 16, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Official Meta infinity logo (gradient or Meta blue)
 */
export function MetaLogo({ className, size = 16, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="metaLogoGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#0064e0" />
          <stop offset="50%" stopColor="#0079fc" />
          <stop offset="100%" stopColor="#0082fb" />
        </linearGradient>
      </defs>
      <path
        d="M6.438 5.438C3.896 5.438 1.5 7.643 1.5 11.235c0 4.248 3.125 7.327 6.096 7.327 2.225 0 3.655-1.258 4.404-2.258.75 1 2.18 2.258 4.404 2.258 2.971 0 6.096-3.079 6.096-7.327 0-3.592-2.396-5.797-4.938-5.797-2.378 0-3.957 1.677-4.664 2.766-.707-1.089-2.286-2.766-4.664-2.766h.204zm-.094 2.062c1.782 0 3.141 1.487 3.864 2.852-1.036 1.777-2.274 3.738-4.048 3.738-1.897 0-3.66-1.745-3.66-4.855 0-2.457 1.428-3.735 3.844-3.735zm11.312 0c2.416 0 3.844 1.278 3.844 3.735 0 3.11-1.763 4.855-3.66 4.855-1.774 0-3.012-1.961-4.048-3.738.723-1.365 2.082-2.852 3.864-2.852z"
        fill="url(#metaLogoGrad)"
      />
    </svg>
  );
}

/**
 * Official Amazon smile logo
 */
export function AmazonLogo({ className, size = 16, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Amazon A glyph */}
      <path
        d="M13.82 12.35c-.07.41-.05.69.05.84.11.15.35.23.73.23.47 0 .94-.13 1.41-.38.48-.25.88-.58 1.2-.99.04.18.06.34.06.48 0 .42-.11.75-.32 1-.22.25-.56.45-1.02.62-.47.16-1.06.25-1.78.25-.66 0-1.22-.1-1.68-.3-.46-.2-.8-.49-1.03-.86-.23-.37-.34-.84-.34-1.4 0-.32.05-.69.14-1.12.09-.43.21-.92.36-1.47l.48-1.78c.11-.42.17-.8.17-1.14 0-.39-.12-.66-.35-.81-.23-.15-.65-.23-1.26-.23-.42 0-.84.06-1.26.17-.42.11-.79.28-1.12.51l-.25-.99c.43-.24.96-.44 1.58-.6.62-.16 1.25-.24 1.89-.24.92 0 1.58.18 1.98.54.4.36.6 1.01.6 1.95 0 .28-.03.62-.09 1.02l-.46 1.76c-.05.21-.08.41-.08.61 0 .22.06.37.18.45.12.08.33.12.63.12.37 0 .74-.09 1.11-.27.37-.18.67-.42.9-.72l.24.47c-.24.38-.59.7-1.05.96-.46.26-.97.39-1.53.39-.45 0-.8-.1-1.05-.29-.25-.19-.4-.51-.45-.96z"
        fill="#FF9900"
      />
      {/* Amazon Smile Arrow */}
      <path
        d="M20.66 17.22c-2.88 2.12-7.07 3.24-10.66 3.24-5.04 0-9.56-1.92-12.98-5.14-.26-.24-.03-.58.28-.39 3.69 2.14 8.24 3.42 12.93 3.42 3.19 0 6.91-.77 10.15-2.39.49-.24.87.38.28.86z"
        fill="#FF9900"
      />
      {/* Arrowhead */}
      <path
        d="M21.94 15.93c-.36-.46-2.39-.33-3.3-.22-.27.03-.32-.2-.07-.37 1.63-1.14 4.29-.81 4.59-.44.3.38-.08 3.05-1.61 4.31-.24.2-.42.09-.29-.17.44-.89 1.04-2.65.68-3.11z"
        fill="#FF9900"
      />
    </svg>
  );
}

/**
 * Official Shopify bag logo with green/white glyph
 */
export function ShopifyLogo({ className, size = 16, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Shopify Bag Body */}
      <path
        d="M19.16 6.87l-2.07-.63c-.02-.13-.05-.28-.09-.43-.33-1.28-.97-2.37-1.89-3.08C14.18 2.01 13.06 1.7 12 1.7c-1.07 0-2.18.31-3.11 1.03-.92.71-1.56 1.8-1.89 3.08-.04.15-.07.3-.09.43l-2.07.63c-.45.14-.72.6-.62 1.06l2.36 12.02c.08.4.43.7.84.7h9.16c.41 0 .76-.3.84-.7l2.36-12.02c.1-.46-.17-.92-.62-1.06zM12 3.2c.69 0 1.41.22 2.01.69.61.47 1.05 1.21 1.29 2.14l-6.6 2c.24-.93.68-1.67 1.29-2.14.6-.47 1.32-.69 2.01-.69zm-1.87 6.44l-1.32.4 1.39 3.32-1.74.53-.45-1.08c-.1-.24-.26-.33-.49-.26l-.42.13.88 2.1 2.21-.67-.06-.14c-.11-.26-.13-.53-.06-.8l.06-.23zm2.59 7.64c-.2-.06-.41-.12-.62-.18l-.51 1.63c.21.06.42.12.63.18.99.31 1.83.21 2.45-.29.65-.53.86-1.38.61-2.26-.3-1.05-1.12-1.73-2.16-2.06-.88-.28-1.34-.63-1.46-1.06-.14-.49.03-.93.47-1.24.43-.31.99-.37 1.68-.15.2.06.39.14.59.23l.49-1.58c-.21-.09-.42-.17-.64-.24-.99-.31-1.86-.21-2.5.28-.65.51-.88 1.37-.62 2.29.31 1.1 1.16 1.8 2.25 2.14.86.27 1.29.62 1.41 1.04.14.49-.03.95-.49 1.28-.43.32-1.03.37-1.76.14z"
        fill="#95BF47"
      />
      {/* Front Bag Accent */}
      <path
        d="M6.9 6.87L12 5.32l5.1 1.55-1.3 6.64H8.2L6.9 6.87z"
        fill="#5E8E3E"
        opacity="0.15"
      />
    </svg>
  );
}

/**
 * Official TikTok music note logo
 */
export function TikTokLogo({ className, size = 16, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.3 6.3 0 0 0 1.85-4.42V8.82a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.89-.25z" />
    </svg>
  );
}

/**
 * Universal Platform Logo helper component
 */
export function PlatformLogo({
  platform = 'meta',
  className,
  size = 16,
  ...props
}: PlatformLogoProps & { platform?: string }) {
  const normalized = (platform || 'meta').toLowerCase();

  if (normalized.includes('tiktok')) {
    return <TikTokLogo size={size} className={className} {...props} />;
  }
  if (normalized.includes('google')) {
    return <GoogleLogo size={size} className={className} {...props} />;
  }
  if (normalized.includes('meta') || normalized.includes('facebook') || normalized.includes('instagram')) {
    return <MetaLogo size={size} className={className} {...props} />;
  }
  if (normalized.includes('amazon')) {
    return <AmazonLogo size={size} className={className} {...props} />;
  }
  if (normalized.includes('shopify')) {
    return <ShopifyLogo size={size} className={className} {...props} />;
  }

  // Fallback to Google / neutral icon
  return <GoogleLogo size={size} className={className} {...props} />;
}

