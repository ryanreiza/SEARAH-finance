import React from 'react';
import { useFinance, DEFAULT_SEARAH_SYMBOL } from '../../context/FinanceContext';

/**
 * Custom Logotype 'A' (Greek Lambda / Inverted Chevron)
 * Shape matching the exact letterform from SEARAH brand identity (image_6ea4677b.png)
 */
export const SearahLambdaA: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 84 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
    style={{
      height: '0.86em',
      width: '0.74em',
      verticalAlign: '-0.025em',
      margin: '0 0.02em',
    }}
    aria-hidden="true"
  >
    <path d="M 3 100 L 37.5 4.5 C 39.5 0.5 44.5 0.5 46.5 4.5 L 81 100 L 62.5 100 L 42 27 L 21.5 100 Z" />
  </svg>
);

export interface SearahBrandLogotypeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'monochrome-white';
  showSubtitle?: boolean;
  className?: string;
  color?: string;
}

/**
 * Dedicated Brand Typography Component: SEΛRΛH + AI FAMILY FINANCE
 * Renders the exact model and font geometry from user-provided image_6ea4677b.png:
 * - On light backgrounds: Crisp deep navy (#0B2747) with transparent background
 * - On dark backgrounds: Crisp pure white (#FFFFFF) with transparent background
 * - Custom colors: Supported via alpha mask
 */
export const SearahBrandLogotype: React.FC<SearahBrandLogotypeProps> = ({
  size = 'md',
  variant = 'light',
  showSubtitle = true,
  className = '',
  color,
}) => {
  const isDark = variant === 'dark' || variant === 'monochrome-white';

  // Dimension scaling keeping exact aspect ratio:
  // Combined logotype (Title + Subtitle): 287 x 78 (~3.68 : 1)
  // Title only (SEARAH): 287 x 47 (~6.11 : 1)
  const dimensions = showSubtitle
    ? {
        xs: { height: 18, width: 66 },
        sm: { height: 24, width: 88 },
        md: { height: 32, width: 118 },
        lg: { height: 44, width: 162 },
        xl: { height: 60, width: 220 },
      }[size]
    : {
        xs: { height: 14, width: 86 },
        sm: { height: 18, width: 110 },
        md: { height: 24, width: 147 },
        lg: { height: 34, width: 208 },
        xl: { height: 46, width: 281 },
      }[size];

  const assetBase = showSubtitle ? 'searah_logotype' : 'searah_title';
  const defaultSrc = isDark
    ? `/assets/aistudio/${assetBase}_white.png`
    : `/assets/aistudio/${assetBase}_navy.png`;

  // Custom color via CSS mask
  if (color) {
    const maskSrc = `/assets/aistudio/${assetBase}_mask.png`;
    return (
      <div
        className={`inline-block shrink-0 select-none ${className}`}
        style={{
          height: dimensions.height,
          width: dimensions.width,
          backgroundColor: color,
          WebkitMaskImage: `url(${maskSrc})`,
          maskImage: `url(${maskSrc})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'left center',
          maskPosition: 'left center',
        }}
        aria-label="SEARAH AI FAMILY FINANCE"
      />
    );
  }

  return (
    <div className={`inline-flex items-center shrink-0 select-none ${className}`}>
      <img
        src={defaultSrc}
        alt="SEARAH AI FAMILY FINANCE"
        style={{
          height: dimensions.height,
          width: 'auto',
          aspectRatio: showSubtitle ? '287 / 78' : '287 / 47',
        }}
        className="object-contain select-none max-w-full"
        draggable={false}
      />
    </div>
  );
};

export interface SearahLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'monochrome-white' | 'image';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  customSymbolUrl?: string;
  useDualRoadSvg?: boolean;
}

/**
 * Main SEARAH Logo component combining the dynamic S symbol
 * and the exact SEARAH brand logotype from image_6ea4677b.png
 */
export const SearahLogo: React.FC<SearahLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  className = '',
  customSymbolUrl,
  useDualRoadSvg = false,
}) => {
  let contextSymbol = DEFAULT_SEARAH_SYMBOL;
  try {
    const finance = useFinance();
    if (finance?.customSymbolUrl) {
      contextSymbol = finance.customSymbolUrl;
    }
  } catch {
    contextSymbol = DEFAULT_SEARAH_SYMBOL;
  }

  const effectiveSymbol = customSymbolUrl || contextSymbol || DEFAULT_SEARAH_SYMBOL;

  const iconDimensions = {
    xs: { width: 22, height: 22 },
    sm: { width: 30, height: 30 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
    xl: { width: 78, height: 78 },
  }[size];

  // If explicit static reference banner is requested
  if (variant === 'image') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/assets/aistudio/image_6ea4677b.png"
          alt="SEARAH - AI Family Finance"
          className="h-auto object-contain select-none rounded-lg"
          style={{ height: iconDimensions.height }}
        />
      </div>
    );
  }

  const isWhite = variant === 'monochrome-white';
  const tealColor = isWhite ? '#2DD4BF' : '#14B8A6';
  const tealGradStart = isWhite ? '#5EEAD4' : '#00D29E';
  const tealGradEnd = isWhite ? '#14B8A6' : '#0B2747';
  const navyColor = isWhite ? '#FFFFFF' : '#0B2747';
  const navyGradStart = isWhite ? '#FFFFFF' : '#0F2C52';
  const navyGradEnd = isWhite ? '#CBD5E1' : '#071A30';

  // S Emblem: Uses the user's uploaded image from Settings (or default cyan ribbon S)
  const emblemElement = useDualRoadSvg ? (
    <svg
      width={iconDimensions.width}
      height={iconDimensions.height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="SEARAH Logo Emblem"
    >
      <defs>
        <linearGradient id={`searahTealRibbon_${isWhite ? 'w' : 'd'}`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor={tealGradStart} />
          <stop offset="45%" stopColor={tealColor} />
          <stop offset="100%" stopColor={tealGradEnd} />
        </linearGradient>

        <linearGradient id={`searahNavyRibbon_${isWhite ? 'w' : 'd'}`} x1="30%" y1="20%" x2="90%" y2="95%">
          <stop offset="0%" stopColor={navyGradStart} />
          <stop offset="60%" stopColor={navyColor} />
          <stop offset="100%" stopColor={navyGradEnd} />
        </linearGradient>

        <filter id={`searahGlow_${isWhite ? 'w' : 'd'}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="4"
            floodColor={isWhite ? 'rgba(45,212,191,0.25)' : 'rgba(11,39,71,0.2)'}
          />
        </filter>
      </defs>

      <path
        d="M 52 42 C 40 24 60 14 86 16 C 114 18 136 34 140 58 C 144 80 128 98 106 108 L 84 118 C 72 124 64 134 66 148 C 68 160 76 168 86 170 C 74 172 60 162 56 148 C 50 124 68 102 90 92 L 112 82 C 122 76 128 66 126 56 C 122 42 108 34 94 36 C 76 38 64 50 66 62 L 52 42 Z"
        fill={`url(#searahTealRibbon_${isWhite ? 'w' : 'd'})`}
        filter={`url(#searahGlow_${isWhite ? 'w' : 'd'})`}
      />
      <path
        d="M 148 158 C 160 176 140 186 114 184 C 86 182 64 166 60 142 C 56 120 72 102 94 92 L 116 82 C 128 76 136 66 134 52 C 132 40 124 32 114 30 C 126 28 140 38 144 52 C 150 76 132 98 110 108 L 88 118 C 78 124 72 134 74 144 C 78 158 92 166 106 164 C 124 162 136 150 134 138 L 148 158 Z"
        fill={`url(#searahNavyRibbon_${isWhite ? 'w' : 'd'})`}
      />
      <circle cx="100" cy="100" r="7" fill={tealColor} opacity="0.35" />
    </svg>
  ) : (
    <div
      className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
      style={{ width: iconDimensions.width, height: iconDimensions.height }}
    >
      <img
        src={effectiveSymbol}
        alt="Simbol S SEARAH"
        className="w-full h-full object-contain rounded-xl shadow-xs select-none"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DEFAULT_SEARAH_SYMBOL;
        }}
      />
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {emblemElement}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex ${
        variant === 'vertical' ? 'flex-col items-center text-center' : 'items-center gap-3'
      } ${className}`}
    >
      {emblemElement}
      <div className={`flex flex-col justify-center ${variant === 'vertical' ? 'items-center mt-2' : ''}`}>
        <SearahBrandLogotype
          size={size}
          variant={isWhite ? 'monochrome-white' : 'light'}
          showSubtitle={true}
        />
        {showTagline && (
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            Satu Tujuan. Keuangan Lebih Terarah.
          </span>
        )}
      </div>
    </div>
  );
};
