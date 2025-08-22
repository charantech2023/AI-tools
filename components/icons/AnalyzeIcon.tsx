
import React from 'react';

export const AnalyzeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
    <path d="M8 18h.01" />
    <path d="m22 16-4 4-2-2" />
  </svg>
);
