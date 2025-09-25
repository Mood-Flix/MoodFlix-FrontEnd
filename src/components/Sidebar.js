import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaPlus, FaCalendar, FaUser } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ onNavigation }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    if (onNavigation) {
      onNavigation(path);
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    if (path === '/search') {
      return location.pathname === '/search';
    }
    return location.pathname.startsWith(path);
  };

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
          className={`nav-button ${isActive('/') ? 'active' : ''}`}
          aria-label="홈으로 이동"
          aria-pressed={isActive('/')}
          onClick={() => handleNavigation('/')}
        >
          <FaHome className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className={`nav-button ${isActive('/search') ? 'active' : ''}`}
          aria-label="검색"
          aria-pressed={isActive('/search')}
          onClick={() => handleNavigation('/search')}
        >
          <FaSearch className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className={`nav-button ${isActive('/recommendation') ? 'active' : ''}`}
          aria-label="영화 추천"
          aria-pressed={isActive('/recommendation')}
          onClick={() => handleNavigation('/recommendation')}
        >
          <FaPlus className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className={`nav-button ${isActive('/calendar') ? 'active' : ''}`}
          aria-label="캘린더"
          aria-pressed={isActive('/calendar')}
          onClick={() => handleNavigation('/calendar')}
        >
          <FaCalendar className="nav-icon" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className={`nav-button ${isActive('/profile') ? 'active' : ''}`}
          aria-label="프로필"
          aria-pressed={isActive('/profile')}
          onClick={() => handleNavigation('/profile')}
        >
          <FaUser className="nav-icon" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
