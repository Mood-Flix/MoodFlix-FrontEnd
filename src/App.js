import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import HomeScreen from './components/HomeScreen';
import { useMood } from './hooks/useMood';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    showHome,
    handleStartApp,
    handleGoHome
  } = useMood();

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={`app ${showHome ? 'home-view' : ''}`}>
      {showHome ? (
        <HomeScreen onStart={handleStartApp} />
      ) : (
        <>
          <Sidebar />
          <MainContent />
        </>
      )}
    </div>
  );
}

export default App;
