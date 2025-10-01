import React from 'react';

export const BackIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
  </svg>
);

export const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const BonusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
         <defs>
            <radialGradient id="bonus-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{stopColor: '#fef08a'}} />
            <stop offset="100%" style={{stopColor: '#facc15'}} />
            </radialGradient>
        </defs>
        <path fillRule="evenodd" fill="url(#bonus-gradient)" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

export const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const BoltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);


export const FistIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#e5e7eb">
        <path d="M66.4,32.3c-2.4-1.7-5.1-2.7-8.1-2.8c-2.3,0-4.5,0.6-6.5,1.7c-1.8,0.9-3.4,2.3-4.6,3.9c-1.2,1.6-2,3.5-2.2,5.5 c-0.3,2,0.1,4.1,0.9,5.9c0.8,1.9,2.1,3.5,3.8,4.7c0.6-1,1-2,1.4-3.1c0.4-1,0.8-2,1.1-3c1.1-3.1,1.8-6.3,1.8-9.5 c0-2.8-0.7-5.6-2.1-8.1c-1.4-2.5-3.3-4.5-5.7-5.9c-2.4-1.4-5-2.1-7.8-2.1c-2.8,0-5.4,0.7-7.8,2.1c-2.4,1.4-4.3,3.4-5.7,5.9 c-1.4,2.5-2.1,5.3-2.1,8.1c0,3.2,0.7,6.4,1.8,9.5c0.3,1,0.7,2,1.1,3c0.4,1.1,0.8,2.1,1.4,3.1c-2.9,0.1-5.6,0.9-7.9,2.3 c-2.3,1.4-4.2,3.3-5.5,5.7c-1.3,2.4-2,5-2,7.7c0,2.1,0.5,4.1,1.4,6c0.9,1.9,2.2,3.5,3.8,4.8V95h55.2V78c1.6-1.2,2.9-2.9,3.8-4.8 c0.9-1.9,1.4-3.9,1.4-6c0-2.7-0.7-5.3-2-7.7C81,42.1,74.9,36,66.4,32.3z" />
    </svg>
);

export const OpenHandIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#e5e7eb">
        <path d="M78.6,52.2c0.6-2.1,0.9-4.3,0.9-6.5c0-4.5-1.2-8.9-3.3-12.8c-2.2-3.9-5.1-7.2-8.7-9.5c-3.6-2.3-7.8-3.6-12.2-3.6 c-4.4,0-8.6,1.3-12.2,3.6c-3.6,2.3-6.5,5.6-8.7,9.5c-2.2,3.9-3.3,8.3-3.3,12.8c0,2.2,0.3,4.4,0.9,6.5H20.5V95h59V52.2H78.6z M50,29.8c3.1,0,6,1,8.5,2.7c2.5,1.7,4.5,4.1,5.9,6.9c1.4,2.8,2.1,6,2.1,9.2c0,1.5-0.2,3-0.6,4.5H34.1c-0.4-1.5-0.6-3-0.6-4.5 c0-3.2,0.7-6.3,2.1-9.2c1.4-2.8,3.4-5.2,5.9-6.9C44,30.8,46.9,29.8,50,29.8z"/>
    </svg>
);

export const CoinIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
         <defs>
            <radialGradient id="coin-gradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" style={{stopColor: '#fef3c7'}} />
                <stop offset="100%" style={{stopColor: '#f59e0b'}} />
            </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill="url(#coin-gradient)" />
        <path d="M12 7.16a4.17 4.17 0 0 0-3.5 6.22 1 1 0 0 0 1.6-.92A2.17 2.17 0 1 1 12 15a2.17 2.17 0 0 1-1.55-.67 1 1 0 1 0-1.56 1.26A4.17 4.17 0 1 0 12 7.16z" fill="#ca8a04" opacity="0.6"/>
    </svg>
);