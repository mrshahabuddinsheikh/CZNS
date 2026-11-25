'use client';

import React from 'react';
import Link from 'next/link';

interface CznsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CznsLogo({ className = '', size = 'md' }: CznsLogoProps) {
  const textSize =
    size === 'sm'
      ? 'text-xl sm:text-2xl'
      : size === 'lg'
      ? 'text-3xl sm:text-4xl'
      : 'text-2xl sm:text-3xl';

  return (
    <Link href="/" className={`inline-flex items-center gap-2 group select-none ${className}`}>
      {/* Modern High-End CZN'S Wordmark with Glowing Accent Apostrophe */}
      <div className="flex items-center tracking-tight font-black font-sans leading-none">
        <span className={`${textSize} text-[#002f34] tracking-[0.06em] group-hover:text-teal-900 transition-colors`}>
          CZN
        </span>
        {/* Stylized Glowing Apostrophe */}
        <span className={`${textSize} text-emerald-500 font-black relative px-0.5 inline-block group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]`}>
          &apos;
        </span>
        <span className={`${textSize} text-[#002f34] tracking-[0.06em] group-hover:text-teal-900 transition-colors`}>
          S
        </span>
        {/* Subtle Tech Pulse Dot */}
        <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1.5 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
      </div>
    </Link>
  );
}
