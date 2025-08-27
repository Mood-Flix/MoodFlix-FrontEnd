import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import HomeScreen from './components/HomeScreen';
import MovieRecommendation from './components/MovieRecommendation';
import { useMood } from './hooks/useMood';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    showHome,
    handleStartApp,
    handleGoHome
  } = useMood();
  
  const [currentView, setCurrentView] = useState('main'); // 'main' 또는 'recommendation'

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

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleGoToHome = () => {
    setCurrentView('main');
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
            currentView={currentView}
          />
          {currentView === 'main' ? (
            <MainContent />
          ) : (
            <MovieRecommendation onBack={handleBackToMain} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
