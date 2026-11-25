'use client';

import React from 'react';
import Link from 'next/link';

interface CznsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CznsLogo({ className = '', size = 'md' }: CznsLogoProps) {
  const heightClass =
    size === 'sm'
      ? 'h-8 sm:h-9'
      : size === 'lg'
      ? 'h-13 sm:h-16'
      : 'h-10 sm:h-12';

  return (
    <Link href="/" className={`inline-flex items-center group select-none shrink-0 ${className}`}>
      {/* Official CZN'S Trademark Logo provided by user */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/czns-logo.png"
        alt="CZN'S Pakistan Mobile Store"
        className={`${heightClass} w-auto object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-300`}
      />
    </Link>
  );
}
