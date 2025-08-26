import React, { useState } from 'react';
import PropTypes from 'prop-types';
import KakaoLogin from './KakaoLogin';
import { useAuth } from '../hooks/useAuth';
import './HomeScreen.css';

const HomeScreen = ({ onStart }) => {
  const { user, isAuthenticated, isLoading, error, login, logout, cleanError } = useAuth();
  const [loginError, setLoginError] = useState(null);

  const handleLoginSuccess = async (data) => {
    try {
      setLoginError(null);
      
      // 백엔드로 로그인 요청
      await login(data.kakaoAccessToken, data.userInfo);
      
      console.log('백엔드 로그인 성공');
    } catch (error) {
      console.error('백엔드 로그인 실패:', error);
      setLoginError(error.message || '로그인에 실패했습니다.');
    }
  };

  const handleLoginError = (errorMessage) => {
    setLoginError(errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  const handleStartApp = () => {
    if (isAuthenticated) {
      onStart();
    }
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="home-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="logo-section">
          <img 
            src="/MoodFlix (Logo).png" 
            alt="MoodFlix Logo" 
            className="home-logo"
          />
        </div>
        
        <div className="welcome-section">
          <h1 className="welcome-title">MoodFlix에 오신 것을 환영합니다</h1>
          <p className="welcome-subtitle">
            당신의 기분에 맞는 완벽한 영화를 찾아보세요
          </p>
          <p className="welcome-description">
            감정을 선택하고 기분을 설명하면, AI가 당신에게 딱 맞는 영화를 추천해드립니다.
          </p>
        </div>

        {/* 에러 메시지 표시 */}
        {(error || loginError) && (
          <div className="error-message">
            <p>{error || loginError}</p>
            <button onClick={() => { setLoginError(null); cleanError(); }}>닫기</button>
          </div>
        )}

        {/* 로그인 상태에 따른 조건부 렌더링 */}
        {!isAuthenticated ? (
          <div className="login-section">
            <KakaoLogin 
              onLoginSuccess={handleLoginSuccess} 
              onLoginError={handleLoginError}
            />
            <p className="login-description">
              카카오 계정으로 간편하게 로그인하고 개인화된 영화 추천을 받아보세요
            </p>
          </div>
        ) : (
          <div className="user-section">
            <div className="user-info">
              <span className="user-welcome">안녕하세요, {user?.name || '사용자'}님!</span>
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
            <div className="action-section">
              <button 
                className="start-button"
                onClick={handleStartApp}
                aria-label="MoodFlix 시작하기"
              >
                시작하기
              </button>
            </div>
          </div>
        )}

        <div className="features-section">
          <div className="feature-item">
            <span className="feature-icon">🎭</span>
            <span className="feature-text">감정 기반 추천</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎬</span>
            <span className="feature-text">맞춤형 영화</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span className="feature-text">AI 분석</span>
          </div>
        </div>
      </div>
    </div>
  );
};

HomeScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default HomeScreen;
