import React from 'react';

// 행복한 감정 아이콘
export const HappyIcon = ({ className }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="18" r="16" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
    <circle cx="12" cy="14" r="2" fill="#333"/>
    <circle cx="24" cy="14" r="2" fill="#333"/>
    <path d="M12 22 Q18 28 24 22" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

// 슬픈 감정 아이콘
export const SadIcon = ({ className }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="18" r="16" fill="#87CEEB" stroke="#4682B4" strokeWidth="2"/>
    <circle cx="12" cy="14" r="2" fill="#333"/>
    <circle cx="24" cy="14" r="2" fill="#333"/>
    <path d="M12 26 Q18 20 24 26" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

// 신나는 감정 아이콘
export const ExcitedIcon = ({ className }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="18" r="16" fill="#FF6B6B" stroke="#FF4500" strokeWidth="2"/>
    <circle cx="12" cy="14" r="2" fill="#333"/>
    <circle cx="24" cy="14" r="2" fill="#333"/>
    <path d="M10 10 L14 6 M26 10 L22 6 M10 26 L14 30 M26 26 L22 30" stroke="#FF4500" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 22 Q18 28 24 22" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

// 평온한 감정 아이콘
export const PeacefulIcon = ({ className }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="18" r="16" fill="#98FB98" stroke="#32CD32" strokeWidth="2"/>
    <circle cx="12" cy="14" r="2" fill="#333"/>
    <circle cx="24" cy="14" r="2" fill="#333"/>
    <path d="M18 8 Q18 12 18 16" stroke="#32CD32" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 16 Q22 20 26 16" stroke="#32CD32" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M12 22 Q18 26 24 22" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

// 로맨틱한 감정 아이콘
export const RomanticIcon = ({ className }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="18" r="16" fill="#FF69B4" stroke="#FF1493" strokeWidth="2"/>
    <path d="M18 10 C14 10, 10 14, 10 18 C10 22, 14 26, 18 26 C22 26, 26 22, 26 18 C26 14, 22 10, 18 10 Z" fill="#FF1493"/>
    <path d="M18 10 C18 6, 14 6, 14 10 C14 14, 18 18, 18 18 C18 18, 22 14, 22 10 C22 6, 18 6, 18 10 Z" fill="#FFB6C1"/>
  </svg>
);

// 불안한 감정 아이콘
export const AnxiousIcon = ({ className }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="18" r="16" fill="#DDA0DD" stroke="#9370DB" strokeWidth="2"/>
    <circle cx="12" cy="14" r="2" fill="#333"/>
    <circle cx="24" cy="14" r="2" fill="#333"/>
    <path d="M8 8 L12 4 M28 8 L24 4 M8 28 L12 32 M28 28 L24 32" stroke="#9370DB" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 22 Q18 18 24 22" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M14 24 Q18 20 22 24" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);
