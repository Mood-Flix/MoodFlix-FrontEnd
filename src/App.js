import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import HomeScreen from './components/HomeScreen';
import MovieRecommendation from './components/MovieRecommendation';
import MovieDetail from './components/MovieDetail';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import { useMood } from './hooks/useMood';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    showHome,
    handleStartApp,
    handleGoHome
  } = useMood();
  
  const [currentView, setCurrentView] = useState('main'); // 'main', 'recommendation', 'calendar', 'detail', 'profile'
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [previousView, setPreviousView] = useState('main');

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  const handleShowRecommendation = () => {
    setCurrentView('recommendation');
  };

  const handleShowCalendar = () => {
    setCurrentView('calendar');
  };

  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleGoToHome = () => {
    setCurrentView('main');
  };

  const handleMovieClick = (movie) => {
    setPreviousView(currentView);
    setSelectedMovie(movie);
    setCurrentView('detail');
  };

  const handleBackFromDetail = () => {
    setCurrentView(previousView);
    setSelectedMovie(null);
  };

  return (
    <div className={`app ${showHome ? 'home-view' : ''}`}>
      {showHome ? (
        <HomeScreen onStart={handleStartApp} />
      ) : (
        <>
          <Sidebar 
            onPlusClick={handleShowRecommendation} 
            onHomeClick={handleGoToHome}
            onCalendarClick={handleShowCalendar}
            onProfileClick={handleShowProfile}
            currentView={currentView}
          />
          {currentView === 'main' ? (
            <MainContent onMovieClick={handleMovieClick} />
          ) : currentView === 'recommendation' ? (
            <MovieRecommendation onBack={handleBackToMain} onMovieClick={handleMovieClick} />
          ) : currentView === 'calendar' ? (
            <Calendar onBack={handleBackToMain} />
          ) : currentView === 'profile' ? (
            <Profile onBack={handleBackToMain} />
          ) : (
            <MovieDetail movie={selectedMovie} onBack={handleBackFromDetail} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
