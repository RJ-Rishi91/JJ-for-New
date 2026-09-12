import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({
  className = "h-8 sm:h-9 w-auto",
  withLink = true,
  withTagline = false,
  taglineClassName = "text-[10px] text-[#A0A0AB] tracking-wider uppercase font-semibold"
}) {
  const content = (
    <div className="flex items-center gap-2.5 select-none group">
      <img
        src="/logo.png"
        alt="Junior Journalist"
        className={`${className} object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(255,214,0,0.15)]`}
      />
      {withTagline && (
        <span className={taglineClassName}>
          For Youth • By Youth • To The Youth
        </span>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" className="inline-flex items-center focus:outline-none" data-testid="logo-link">
        {content}
      </Link>
    );
  }

  return content;
}
