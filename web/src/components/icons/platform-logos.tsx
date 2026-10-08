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
      {/* Amazon 'a' glyph */}
      <path
        d="M6.61 11.802c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02z"
        fill="currentColor"
      />
      {/* Amazon Smile + Arrowhead */}
      <path
        d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm19.48.371c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z"
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

