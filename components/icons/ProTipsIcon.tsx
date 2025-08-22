
import React from 'react';

export const ProTipsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 2a7 7 0 0 0-7 7c0 3.03 1.09 4.31 3.32 6.56a.5.5 0 0 0 .68.04L12 14l2.99 1.6a.5.5 0 0 0 .68-.04C17.91 13.31 19 12.03 19 9a7 7 0 0 0-7-7z"></path>
        <path d="M9 21h6"></path>
        <path d="M12 18v3"></path>
    </svg>
);
