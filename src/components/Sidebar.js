import React from 'react';
import { FaHome, FaSearch, FaPlus, FaCalendar, FaUser } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ onPlusClick, onHomeClick, onCalendarClick, onProfileClick, currentView }) => {
  return (
    <nav className="sidebar">
      <div className="logo-section">
        <img 
          src="/MoodFlix_Logo.png" 
          alt="MoodFlix Logo" 
          className="logo-image"
        />
      </div>
      <div className="nav-icons">
        <button
          type="button"
          className={`nav-button ${currentView === 'main' ? 'active' : ''}`}
          aria-label="홈으로 이동"
          aria-pressed={currentView === 'main'}
          onClick={onHomeClick}
        >
          <FaHome className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className="nav-button" 
          aria-label="검색"
        >
          <FaSearch className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className={`nav-button ${currentView === 'recommendation' ? 'active' : ''}`}
          aria-label="영화 추천"
          aria-pressed={currentView === 'recommendation'}
          onClick={onPlusClick}
        >
          <FaPlus className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className={`nav-button ${currentView === 'calendar' ? 'active' : ''}`}
          aria-label="캘린더"
          aria-pressed={currentView === 'calendar'}
          onClick={onCalendarClick}
        >
          <FaCalendar className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className={`nav-button ${currentView === 'profile' ? 'active' : ''}`}
          aria-label="프로필"
          aria-pressed={currentView === 'profile'}
          onClick={onProfileClick}
        >
          <FaUser className="nav-icon" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
