import React, { useState } from 'react';
import {
  useFinance,
  DEFAULT_SEARAH_SYMBOL,
  DEFAULT_SEARTA_WORDMARK,
} from '../../context/FinanceContext';

export const SearahLambdaA: React.FC<{ className?: string }> = () => null;

export interface SearahBrandLogotypeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'monochrome-white';
  showSubtitle?: boolean;
  className?: string;
  color?: string;
  wordmarkUrl?: string;
}

/**
 * Dedicated Brand Typography Component: "searta" + AI FAMILY FINANCE
 * Renders the exact official brand wordmark from user URL:
 * https://i.ibb.co.com/JRt2gFkq/searta.png (2824x941 px)
 * - On light backgrounds: Displays the official wordmark image with transparent blend
 * - On dark backgrounds: Pure crisp white (#FFFFFF) transparent wordmark
 * - Custom colors: Supported via alpha mask
 */
export const SearahBrandLogotype: React.FC<SearahBrandLogotypeProps> = ({
  size = 'md',
  variant = 'light',
  showSubtitle = true,
  className = '',
  color,
  wordmarkUrl,
}) => {
  const isDark = variant === 'dark' || variant === 'monochrome-white';
  const [imgError, setImgError] = useState(false);
  const [retrySrc, setRetrySrc] = useState<string | null>(null);

  // Scaled dimensions preserving the 1444:481 aspect ratio (~3:1)
  const config = {
    xs: { height: 18, subtitleSize: '7.5px', subtitleMargin: '1px' },
    sm: { height: 25, subtitleSize: '8.5px', subtitleMargin: '2px' },
    md: { height: 32, subtitleSize: '10px', subtitleMargin: '2px' },
    lg: { height: 44, subtitleSize: '12px', subtitleMargin: '3px' },
    xl: { height: 56, subtitleSize: '14px', subtitleMargin: '4px' },
  }[size];

  // Default image source
  const targetWordmark = wordmarkUrl || DEFAULT_SEARTA_WORDMARK;
  const initialSrc = isDark
    ? '/assets/aistudio/searta_white.png'
    : targetWordmark;

  const currentSrc = retrySrc || initialSrc;

  // Custom color via CSS mask
  if (color) {
    const maskSrc = '/assets/aistudio/searta_wordmark_mask.png';
    return (
      <div className={`inline-flex flex-col justify-center shrink-0 select-none ${className}`}>
        <div
          className="inline-block shrink-0 select-none"
          style={{
            height: config.height,
            width: config.height * 3.0,
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
          aria-label="searta"
        />
        {showSubtitle && (
          <span
            className="font-sans font-bold tracking-[0.24em] uppercase select-none leading-none opacity-80"
            style={{
              color,
              fontSize: config.subtitleSize,
              marginTop: config.subtitleMargin,
            }}
          >
            AI FAMILY FINANCE
          </span>
        )}
      </div>
    );
  }

  const handleImageError = () => {
    if (!retrySrc) {
      // First fallback: local transparent asset or direct local copy
      setRetrySrc(isDark ? '/assets/aistudio/searta_wordmark_white.png' : '/assets/aistudio/searta_transparent.png');
    } else if (retrySrc !== '/searta.png' && retrySrc !== '/searta_white.png') {
      // Second fallback: root /searta.png or /searta_white.png
      setRetrySrc(isDark ? '/searta_white.png' : '/searta.png');
    } else {
      // Ultimate fallback: stylized brand font (Nunito / Fredoka)
      setImgError(true);
    }
  };

  return (
    <div className={`inline-flex flex-col justify-center shrink-0 select-none ${className}`}>
      {!imgError ? (
        <img
          src={currentSrc}
          alt="searta - AI Family Finance"
          style={{
            height: config.height,
            width: 'auto',
            aspectRatio: '2824 / 941',
          }}
          className={`object-contain select-none max-w-full ${
            !isDark ? 'mix-blend-multiply' : ''
          }`}
          draggable={false}
          onError={handleImageError}
        />
      ) : (
        /* Fallback text styled with font-searta (Nunito 900 rounded single-story lowercase) */
        <div className="flex flex-col select-none">
          <span
            className={`font-searta lowercase font-black tracking-tight select-none leading-none ${
              isDark ? 'text-white' : 'text-[#002B49]'
            }`}
            style={{ fontSize: config.height * 0.7 }}
          >
            searta
          </span>
          {showSubtitle && (
            <span
              className={`font-sans font-extrabold tracking-[0.24em] uppercase select-none leading-none mt-1 ${
                isDark ? 'text-teal-300/90' : 'text-[#8A929B]'
              }`}
              style={{
                fontSize: config.subtitleSize,
                marginTop: config.subtitleMargin,
              }}
            >
              AI FAMILY FINANCE
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export interface SearahLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'monochrome-white' | 'image';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  customSymbolUrl?: string;
  customWordmarkUrl?: string;
  useDualRoadSvg?: boolean;
}

/**
 * Main Logo component combining the dynamic S symbol
 * and the exact "searta" brand logotype from URL:
 * https://i.ibb.co.com/JRt2gFkq/searta.png
 */
export const SearahLogo: React.FC<SearahLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  className = '',
  customSymbolUrl,
  customWordmarkUrl,
  useDualRoadSvg = false,
}) => {
  let contextSymbol = DEFAULT_SEARAH_SYMBOL;
  let contextWordmark = DEFAULT_SEARTA_WORDMARK;

  try {
    const finance = useFinance();
    if (finance?.customSymbolUrl) {
      contextSymbol = finance.customSymbolUrl;
    }
    if (finance?.customWordmarkUrl) {
      contextWordmark = finance.customWordmarkUrl;
    }
  } catch {
    contextSymbol = DEFAULT_SEARAH_SYMBOL;
    contextWordmark = DEFAULT_SEARTA_WORDMARK;
  }

  const effectiveSymbol = customSymbolUrl || contextSymbol || DEFAULT_SEARAH_SYMBOL;
  const effectiveWordmark = customWordmarkUrl || contextWordmark || DEFAULT_SEARTA_WORDMARK;

  const iconDimensions = {
    xs: { width: 22, height: 22 },
    sm: { width: 28, height: 28 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
    xl: { width: 78, height: 78 },
  }[size];

  // If explicit static reference image is requested
  if (variant === 'image') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={effectiveWordmark}
          alt="searta - AI Family Finance"
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

  // S Emblem: Uses the user's uploaded image from Settings (or default symbol)
  const emblemElement = useDualRoadSvg ? (
    <svg
      width={iconDimensions.width}
      height={iconDimensions.height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="searta Logo Emblem"
    >
      <defs>
        <linearGradient id={`seartaTealRibbon_${isWhite ? 'w' : 'd'}`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor={tealGradStart} />
          <stop offset="45%" stopColor={tealColor} />
          <stop offset="100%" stopColor={tealGradEnd} />
        </linearGradient>

        <linearGradient id={`seartaNavyRibbon_${isWhite ? 'w' : 'd'}`} x1="30%" y1="20%" x2="90%" y2="95%">
          <stop offset="0%" stopColor={navyGradStart} />
          <stop offset="60%" stopColor={navyColor} />
          <stop offset="100%" stopColor={navyGradEnd} />
        </linearGradient>

        <filter id={`seartaGlow_${isWhite ? 'w' : 'd'}`} x="-15%" y="-15%" width="130%" height="130%">
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
        fill={`url(#seartaTealRibbon_${isWhite ? 'w' : 'd'})`}
        filter={`url(#seartaGlow_${isWhite ? 'w' : 'd'})`}
      />
      <path
        d="M 148 158 C 160 176 140 186 114 184 C 86 182 64 166 60 142 C 56 120 72 102 94 92 L 116 82 C 128 76 136 66 134 52 C 132 40 124 32 114 30 C 126 28 140 38 144 52 C 150 76 132 98 110 108 L 88 118 C 78 124 72 134 74 144 C 78 158 92 166 106 164 C 124 162 136 150 134 138 L 148 158 Z"
        fill={`url(#seartaNavyRibbon_${isWhite ? 'w' : 'd'})`}
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
        alt="Simbol searta"
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
        variant === 'vertical'
          ? 'flex-col items-center text-center'
          : size === 'xs'
          ? 'items-center gap-1.5'
          : 'items-center gap-2 sm:gap-2.5'
      } ${className}`}
    >
      {emblemElement}
      <div className={`flex flex-col justify-center ${variant === 'vertical' ? 'items-center mt-2' : ''}`}>
        <SearahBrandLogotype
          size={size}
          variant={isWhite ? 'monochrome-white' : 'light'}
          showSubtitle={true}
          wordmarkUrl={effectiveWordmark}
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

// Aliases for modern naming convention
export const SeartaLogo = SearahLogo;
export const SeartaBrandLogotype = SearahBrandLogotype;
