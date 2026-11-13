import React from 'react';

interface IllustrationBadgeProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IllustrationBadge: React.FC<IllustrationBadgeProps> = ({
  name,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  // Child-friendly custom vector illustrations
  switch (name.toLowerCase()) {
    case 'pyramid':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <defs>
            <linearGradient id="pyr-g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="pyr-g2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          <circle cx="50" cy="22" r="10" fill="#FBBF24" />
          {/* Main pyramid body */}
          <polygon points="50,22 18,78 62,78" fill="url(#pyr-g1)" />
          {/* Shaded right face */}
          <polygon points="50,22 62,78 84,72" fill="url(#pyr-g2)" opacity="0.85" />
          {/* Ancient door */}
          <polygon points="38,78 44,66 48,78" fill="#78350F" />
          {/* Sand dune */}
          <path d="M10 82 Q 40 74, 90 82" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'bee':
    case 'spellingbee':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Wings */}
          <ellipse cx="40" cy="34" rx="12" ry="18" fill="#E0F2FE" opacity="0.85" transform="rotate(-25 40 34)" stroke="#38BDF8" strokeWidth="1.5" />
          <ellipse cx="60" cy="34" rx="12" ry="18" fill="#E0F2FE" opacity="0.85" transform="rotate(25 60 34)" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Bee body */}
          <ellipse cx="50" cy="56" rx="20" ry="24" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          {/* Black stripes */}
          <path d="M33 50 Q 50 54, 67 50" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M32 60 Q 50 64, 68 60" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M37 70 Q 50 74, 63 70" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Eyes and cheeks */}
          <circle cx="43" cy="46" r="3" fill="#0F172A" />
          <circle cx="57" cy="46" r="3" fill="#0F172A" />
          <circle cx="38" cy="52" r="2.5" fill="#F43F5E" opacity="0.6" />
          <circle cx="62" cy="52" r="2.5" fill="#F43F5E" opacity="0.6" />
          {/* Smile */}
          <path d="M46 54 Q 50 58, 54 54" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Antennae */}
          <path d="M44 34 Q 40 24, 34 26" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="34" cy="26" r="2.5" fill="#1E293B" />
          <path d="M56 34 Q 60 24, 66 26" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="66" cy="26" r="2.5" fill="#1E293B" />
        </svg>
      );

    case 'butterfly':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FDF2F8" />
          {/* Left top wing */}
          <path d="M48 48 C 30 18, 10 28, 16 52 C 20 62, 38 60, 48 52 Z" fill="#F472B6" />
          <circle cx="28" cy="38" r="6" fill="#FDF2F8" />
          {/* Right top wing */}
          <path d="M52 48 C 70 18, 90 28, 84 52 C 80 62, 62 60, 52 52 Z" fill="#F472B6" />
          <circle cx="72" cy="38" r="6" fill="#FDF2F8" />
          {/* Left bottom wing */}
          <path d="M48 54 C 32 60, 20 74, 30 84 C 40 90, 48 76, 48 54 Z" fill="#FB7185" />
          {/* Right bottom wing */}
          <path d="M52 54 C 68 60, 80 74, 70 84 C 60 90, 52 76, 52 54 Z" fill="#FB7185" />
          {/* Body */}
          <ellipse cx="50" cy="54" rx="4" ry="18" fill="#475569" />
          <circle cx="50" cy="34" r="5" fill="#334155" />
          {/* Antennae */}
          <path d="M48 30 Q 42 20, 36 22" stroke="#334155" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M52 30 Q 58 20, 64 22" stroke="#334155" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'octopus':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#EDE9FE" />
          {/* Tentacles */}
          <path d="M30 60 Q 20 75, 26 84 Q 32 80, 35 68" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M40 64 Q 35 80, 42 86 Q 48 80, 46 66" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M54 66 Q 52 80, 58 86 Q 65 80, 60 64" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M65 68 Q 68 80, 74 84 Q 80 75, 70 60" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Head */}
          <ellipse cx="50" cy="46" rx="24" ry="22" fill="#A78BFA" />
          {/* Big cute eyes */}
          <circle cx="42" cy="46" r="5" fill="#FFFFFF" />
          <circle cx="43" cy="46" r="3" fill="#1E1B4B" />
          <circle cx="58" cy="46" r="5" fill="#FFFFFF" />
          <circle cx="59" cy="46" r="3" fill="#1E1B4B" />
          {/* Smile */}
          <path d="M46 54 Q 50 58, 54 54" stroke="#4C1D95" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'umbrella':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
          {/* Canopy */}
          <path d="M20 54 Q 50 18, 80 54 Q 70 50, 60 54 Q 50 50, 40 54 Q 30 50, 20 54 Z" fill="#0EA5E9" />
          <path d="M20 54 Q 50 18, 80 54 Q 65 30, 50 54 Q 35 30, 20 54 Z" fill="#38BDF8" opacity="0.6" />
          {/* Shaft and handle */}
          <line x1="50" y1="20" x2="50" y2="76" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 76 Q 50 84, 42 84 Q 36 84, 36 78" stroke="#0369A1" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'rainbow':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#F0FDF4" />
          <path d="M16 72 A 34 34 0 0 1 84 72" stroke="#EF4444" strokeWidth="5" fill="none" />
          <path d="M21 72 A 29 29 0 0 1 79 72" stroke="#F97316" strokeWidth="5" fill="none" />
          <path d="M26 72 A 24 24 0 0 1 74 72" stroke="#EAB308" strokeWidth="5" fill="none" />
          <path d="M31 72 A 19 19 0 0 1 69 72" stroke="#22C55E" strokeWidth="5" fill="none" />
          <path d="M36 72 A 14 14 0 0 1 64 72" stroke="#3B82F6" strokeWidth="5" fill="none" />
          {/* Fluffy clouds at ends */}
          <circle cx="22" cy="74" r="8" fill="#E2E8F0" />
          <circle cx="78" cy="74" r="8" fill="#E2E8F0" />
        </svg>
      );

    case 'trophy':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Cup */}
          <path d="M32 30 H 68 V 50 C 68 62, 58 68, 50 68 C 42 68, 32 62, 32 50 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          {/* Shading */}
          <path d="M50 32 H 66 V 48 C 66 58, 58 64, 50 66 Z" fill="#FBBF24" />
          {/* Handles */}
          <path d="M32 36 C 20 36, 20 54, 34 54" stroke="#D97706" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M68 36 C 80 36, 80 54, 66 54" stroke="#D97706" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Stem & Base */}
          <rect x="46" y="68" width="8" height="12" fill="#D97706" />
          <rect x="34" y="80" width="32" height="6" rx="2" fill="#92400E" />
          {/* Star on cup */}
          <polygon points="50,40 52,45 57,45 53,48 55,53 50,50 45,53 47,48 43,45 48,45" fill="#FFFFFF" />
        </svg>
      );

    case 'crown':
    case 'pharaoh':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Pharaoh Nemes Headdress */}
          <path d="M26 36 Q 50 18, 74 36 L 80 68 Q 68 76, 50 76 Q 32 76, 20 68 Z" fill="#F59E0B" />
          {/* Blue Stripes */}
          <path d="M28 40 Q 50 26, 72 40" stroke="#2563EB" strokeWidth="4" fill="none" />
          <path d="M24 50 Q 50 36, 76 50" stroke="#2563EB" strokeWidth="4" fill="none" />
          <path d="M22 60 Q 50 48, 78 60" stroke="#2563EB" strokeWidth="4" fill="none" />
          {/* Golden Cobra Uraeus on forehead */}
          <circle cx="50" cy="28" r="4" fill="#DC2626" />
          {/* Pharaoh Face */}
          <ellipse cx="50" cy="56" rx="14" ry="16" fill="#FDE68A" />
          <ellipse cx="45" cy="54" rx="2" ry="3" fill="#78350F" />
          <ellipse cx="55" cy="54" rx="2" ry="3" fill="#78350F" />
          <path d="M47 62 Q 50 66, 53 62" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Golden beard */}
          <rect x="48" y="72" width="4" height="12" rx="2" fill="#D97706" />
        </svg>
      );

    case 'statue':
    case 'sphinx':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FFFBEB" />
          {/* Golden Sphinx body */}
          <path d="M18 72 C 18 56, 36 54, 52 54 L 80 54 C 84 54, 88 64, 86 72 Z" fill="#D97706" />
          {/* Paws */}
          <rect x="14" y="68" width="24" height="8" rx="4" fill="#F59E0B" />
          <rect x="36" y="68" width="18" height="8" rx="4" fill="#FBBF24" />
          {/* Human head */}
          <circle cx="70" cy="40" r="14" fill="#FBBF24" />
          {/* Nemes headdress */}
          <path d="M58 34 C 64 22, 78 22, 84 34 L 84 48 L 56 48 Z" fill="#2563EB" />
          <circle cx="68" cy="42" r="2" fill="#78350F" />
          <circle cx="74" cy="42" r="2" fill="#78350F" />
          <path d="M69 47 Q 72 49, 75 47" stroke="#78350F" strokeWidth="1.5" fill="none" />
        </svg>
      );

    case 'scroll':
    case 'papyrus':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          <rect x="24" y="24" width="52" height="52" rx="6" fill="#FDE68A" stroke="#D97706" strokeWidth="3" />
          <path d="M32 36 H 68" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" />
          <path d="M32 46 H 68" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" />
          <path d="M32 56 H 60" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" />
          {/* Little Egyptian ankh symbol */}
          <circle cx="50" cy="66" r="3" stroke="#B45309" strokeWidth="1.5" fill="none" />
          <line x1="50" y1="69" x2="50" y2="76" stroke="#B45309" strokeWidth="1.5" />
          <line x1="46" y1="72" x2="54" y2="72" stroke="#B45309" strokeWidth="1.5" />
        </svg>
      );

    case 'waves':
    case 'nile':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
          {/* Reeds on left */}
          <path d="M22 68 Q 20 40, 24 24" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          <path d="M28 72 Q 30 46, 32 30" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          {/* Felucca boat sailing */}
          <polygon points="58,26 78,56 58,56" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
          <polygon points="56,32 44,56 56,56" fill="#BFDBFE" />
          <path d="M42 58 L 80 58 L 74 66 L 48 66 Z" fill="#92400E" />
          {/* Blue water waves */}
          <path d="M15 72 Q 35 66, 55 72 T 90 72" stroke="#0284C7" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M10 82 Q 30 76, 50 82 T 95 82" stroke="#38BDF8" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'camel':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Camel body and single hump */}
          <ellipse cx="50" cy="56" rx="20" ry="14" fill="#D97706" />
          {/* Hump */}
          <ellipse cx="50" cy="42" rx="12" ry="12" fill="#B45309" />
          {/* Long neck and head */}
          <path d="M64 54 C 70 46, 74 34, 76 26" stroke="#D97706" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="80" cy="24" rx="8" ry="6" fill="#F59E0B" />
          <circle cx="82" cy="23" r="1.5" fill="#78350F" />
          {/* Legs */}
          <rect x="36" y="66" width="5" height="20" rx="2" fill="#B45309" />
          <rect x="46" y="66" width="5" height="20" rx="2" fill="#D97706" />
          <rect x="58" y="66" width="5" height="20" rx="2" fill="#B45309" />
          <rect x="66" y="66" width="5" height="20" rx="2" fill="#D97706" />
        </svg>
      );

    case 'fish':
    case 'coral-reef':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
          {/* Coral branches */}
          <path d="M20 86 Q 24 64, 28 54 Q 30 62, 34 86" fill="#F43F5E" />
          <path d="M70 86 Q 74 60, 78 48 Q 82 58, 86 86" fill="#FB923C" />
          {/* Clownfish / Red Sea fish */}
          <ellipse cx="50" cy="44" rx="18" ry="12" fill="#EA580C" />
          <polygon points="32,44 22,34 22,54" fill="#EA580C" />
          {/* White stripes */}
          <path d="M42 34 Q 46 44, 42 54" stroke="#FFFFFF" strokeWidth="3" fill="none" />
          <path d="M54 33 Q 58 44, 54 55" stroke="#FFFFFF" strokeWidth="3" fill="none" />
          <circle cx="60" cy="41" r="2" fill="#000000" />
          {/* Bubbles */}
          <circle cx="68" cy="32" r="3" fill="#BAE6FD" />
          <circle cx="74" cy="24" r="2" fill="#BAE6FD" />
        </svg>
      );

    case 'utensils':
    case 'koshari':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FFEDD5" />
          {/* Big bowl */}
          <path d="M22 46 Q 50 86, 78 46 Z" fill="#EA580C" />
          <ellipse cx="50" cy="46" rx="28" ry="8" fill="#FDBA74" />
          {/* Rice & pasta mound */}
          <ellipse cx="50" cy="42" rx="22" ry="6" fill="#FFFBEB" />
          {/* Brown lentils & chickpeas */}
          <circle cx="44" cy="40" r="3" fill="#78350F" />
          <circle cx="52" cy="42" r="3" fill="#D97706" />
          <circle cx="58" cy="39" r="3" fill="#78350F" />
          {/* Crispy golden onions on top */}
          <path d="M42 36 Q 50 32, 58 36" stroke="#B45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M46 34 Q 52 30, 56 34" stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Red sauce splash */}
          <circle cx="48" cy="44" r="4" fill="#DC2626" />
        </svg>
      );

    case 'falafel':
    case 'coffee':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Baladi bread pocket */}
          <path d="M24 60 C 24 38, 76 38, 76 60 C 76 74, 24 74, 24 60 Z" fill="#D97706" />
          <ellipse cx="50" cy="54" rx="24" ry="10" fill="#FDE68A" />
          {/* Falafel patty */}
          <circle cx="42" cy="50" r="10" fill="#78350F" />
          <circle cx="42" cy="50" r="8" fill="#92400E" />
          {/* Sesame seeds */}
          <circle cx="40" cy="48" r="1" fill="#FEF3C7" />
          <circle cx="44" cy="52" r="1" fill="#FEF3C7" />
          {/* Green parsley garnish */}
          <circle cx="58" cy="48" r="8" fill="#16A34A" />
          <circle cx="60" cy="46" r="3" fill="#22C55E" />
        </svg>
      );

    case 'palmtree':
    case 'dates':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Palm trunk */}
          <path d="M46 86 C 47 62, 50 48, 52 36" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
          {/* Palm leaves */}
          <path d="M52 36 Q 30 22, 18 36" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M52 36 Q 34 14, 30 6" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M52 36 Q 66 14, 70 6" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M52 36 Q 74 22, 84 36" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Sweet brown dates clusters */}
          <circle cx="46" cy="40" r="3.5" fill="#78350F" />
          <circle cx="52" cy="42" r="3.5" fill="#92400E" />
          <circle cx="56" cy="40" r="3.5" fill="#78350F" />
        </svg>
      );

    case 'pencil':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#EEF2FF" />
          <g transform="rotate(-45 50 50)">
            {/* Eraser */}
            <rect x="42" y="16" width="16" height="12" rx="3" fill="#F43F5E" />
            <rect x="42" y="26" width="16" height="6" fill="#CBD5E1" />
            {/* Pencil body */}
            <rect x="42" y="32" width="16" height="38" fill="#FBBF24" />
            <rect x="46" y="32" width="8" height="38" fill="#F59E0B" />
            {/* Wood cone & tip */}
            <polygon points="42,70 58,70 50,86" fill="#FDE68A" />
            <polygon points="47,80 53,80 50,86" fill="#1E293B" />
          </g>
        </svg>
      );

    case 'ruler':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#EEF2FF" />
          <rect x="18" y="36" width="64" height="28" rx="4" fill="#3B82F6" />
          {/* Tick marks */}
          <line x1="26" y1="36" x2="26" y2="48" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="34" y1="36" x2="34" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="42" y1="36" x2="42" y2="48" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="50" y1="36" x2="50" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="58" y1="36" x2="58" y2="48" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="66" y1="36" x2="66" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="74" y1="36" x2="74" y2="48" stroke="#FFFFFF" strokeWidth="2.5" />
        </svg>
      );

    case 'briefcase':
    case 'backpack':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#EEF2FF" />
          {/* Top handle */}
          <path d="M40 30 Q 50 18, 60 30" stroke="#1D4ED8" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Main pack body */}
          <rect x="28" y="30" width="44" height="48" rx="12" fill="#3B82F6" />
          {/* Front pouch */}
          <rect x="34" y="48" width="32" height="24" rx="6" fill="#60A5FA" />
          {/* Zipper */}
          <line x1="36" y1="48" x2="64" y2="48" stroke="#FDE047" strokeWidth="3" />
          <circle cx="50" cy="48" r="3" fill="#D97706" />
        </svg>
      );

    case 'sun':
    case 'sunrise':
    case 'solar-energy':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          <circle cx="50" cy="50" r="22" fill="#F59E0B" />
          {/* Rays */}
          <g stroke="#FBBF24" strokeWidth="4" strokeLinecap="round">
            <line x1="50" y1="14" x2="50" y2="22" />
            <line x1="50" y1="78" x2="50" y2="86" />
            <line x1="14" y1="50" x2="22" y2="50" />
            <line x1="78" y1="50" x2="86" y2="50" />
            <line x1="24" y1="24" x2="30" y2="30" />
            <line x1="70" y1="70" x2="76" y2="76" />
            <line x1="24" y1="76" x2="30" y2="70" />
            <line x1="70" y1="30" x2="76" y2="24" />
          </g>
          {/* Cute happy face */}
          <circle cx="44" cy="48" r="2.5" fill="#78350F" />
          <circle cx="56" cy="48" r="2.5" fill="#78350F" />
          <path d="M45 54 Q 50 58, 55 54" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'globe':
    case 'planet':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
          <circle cx="50" cy="50" r="30" fill="#38BDF8" />
          {/* Green continents */}
          <path d="M38 34 Q 46 30, 52 36 Q 58 44, 48 48 Q 40 44, 38 34 Z" fill="#22C55E" />
          <path d="M44 54 Q 56 50, 62 60 Q 58 72, 46 68 Z" fill="#22C55E" />
          <path d="M60 36 Q 66 32, 70 38 Q 68 46, 62 44 Z" fill="#16A34A" />
          {/* Orbit ring */}
          <ellipse cx="50" cy="50" rx="42" ry="14" stroke="#F59E0B" strokeWidth="3" fill="none" transform="rotate(-20 50 50)" strokeDasharray="3 4" />
        </svg>
      );

    case 'book-open':
    case 'library':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#EEF2FF" />
          {/* Book left page */}
          <path d="M22 34 C 32 30, 44 32, 50 36 L 50 72 C 44 68, 32 66, 22 70 Z" fill="#3B82F6" />
          {/* Book right page */}
          <path d="M78 34 C 68 30, 56 32, 50 36 L 50 72 C 56 68, 68 66, 78 70 Z" fill="#60A5FA" />
          {/* Bookmark ribbon */}
          <path d="M47 34 L 47 54 L 50 50 L 53 54 L 53 34 Z" fill="#F43F5E" />
        </svg>
      );

    default:
      // Vibrant fallback badge with open book and star
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`}>
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          <circle cx="50" cy="50" r="32" fill="#FBBF24" />
          <polygon points="50,26 56,38 70,40 60,50 62,64 50,56 38,64 40,50 30,40 44,38" fill="#FFFFFF" />
        </svg>
      );
  }
};
