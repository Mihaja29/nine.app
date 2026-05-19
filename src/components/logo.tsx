import React from 'react';

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-28 h-28",
  };

  return (
    <img 
      src="/logo.png" 
      alt="Logo NINE" 
      className={`object-contain ${sizes[size]} ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}

export function LogoText({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };
  return (
    <span className={`font-black tracking-tight text-gray-900 lowercase ${sizes[size]} ${className}`}>
      nine
    </span>
  );
}
