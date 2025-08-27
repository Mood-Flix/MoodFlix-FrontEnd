import React, { useState } from 'react';
import PropTypes from 'prop-types';
import KakaoLogin from './KakaoLogin';
import { useAuth } from '../hooks/useAuth';
import './HomeScreen.css';

const HomeScreen = ({ onStart }) => {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth();
  const [loginError, setLoginError] = useState(null);

  const handleLoginSuccess = async (data) => {
    try {
      clearError(); // useAuth 훅 에러 초기화
      
      // 백엔드로 로그인 요청
      await login(data.kakaoAccessToken, data.userInfo);
      if (process.env.MODE_ENV !== 'production') {
        console.debug('백엔드 로그인 성공');
      }
    } catch (error) {
      // useAuth.login 내부에서 이미 setError 처리됨
      if (process.env.MODE_ENV !== 'production') {
        console.error('백엔드 로그인 실패:', error);
      }
    }
  };

  const handleLoginError = (errorMessage) => {
    setLoginError(errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  const handleStartApp = () => {
    // 로그인 상태와 관계없이 앱 시작 가능
    onStart();
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
            <button onClick={() => { setLoginError(null); clearError(); }}>닫기</button>
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
            {/* 로그인 없이 시작하기 버튼 추가 */}
            <div className="guest-login-section">
              <button 
                className="guest-start-button"
                onClick={handleStartApp}
                aria-label="로그인 없이 MoodFlix 시작하기"
              >
                로그인 없이 시작하기
              </button>
              <p className="guest-description">
                로그인 없이도 영화 추천 기능을 이용할 수 있습니다
              </p>
            </div>
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
