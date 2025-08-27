import React from 'react';
import { FaHome, FaSearch, FaPlus, FaCalendar } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
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
        <button className="nav-button active" aria-label="홈으로 이동">
          <FaHome className="nav-icon" />
        </button>
        <button className="nav-button" aria-label="검색">
          <FaSearch className="nav-icon" />
        </button>
        <button className="nav-button" aria-label="추가">
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
