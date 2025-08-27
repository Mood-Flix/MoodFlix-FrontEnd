import React from 'react';
import { FaHome, FaSearch, FaPlus, FaCalendar } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ onPlusClick, onHomeClick, currentView }) => {
  return (
    <nav className="sidebar">
      <div className="logo-section">
        <img 
          src="/MoodFlix (Logo).png" 
          alt="MoodFlix Logo" 
          className="logo-image"
        />
      </div>
      <div className="nav-icons">
        <button 
          className={`nav-button ${currentView === 'main' ? 'active' : ''}`} 
          aria-label="홈으로 이동"
          onClick={onHomeClick}
        >
          <FaHome className="nav-icon" />
        </button>
        <button className="nav-button" aria-label="검색">
          <FaSearch className="nav-icon" />
        </button>
        <button 
          className={`nav-button ${currentView === 'recommendation' ? 'active' : ''}`}
          aria-label="영화 추천"
          onClick={onPlusClick}
        >
          <FaPlus className="nav-icon" />
        </button>
        <button className="nav-button" aria-label="캘린더">
          <FaCalendar className="nav-icon" />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
