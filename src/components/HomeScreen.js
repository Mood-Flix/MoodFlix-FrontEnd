import React from 'react';
import PropTypes from 'prop-types';
import KakaoLogin from './KakaoLogin';
import MovieSyncButton from './MovieSyncButton';
import { useAuth } from '../hooks/useAuth';
import { useMovies } from '../hooks/useMovies';
import './HomeScreen.css';

const HomeScreen = ({ onStart }) => {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth();
  const { refreshMovies } = useMovies();

  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError(); // 이전 에러 메시지 초기화
      await login(kakaoAccessToken); 
      console.log('HomeScreen: 로그인 프로세스 성공');
    } catch (err) {
      console.error('HomeScreen: 로그인 프로세스 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    // 카카오 SDK 자체의 오류를 처리합니다.
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  const handleStartApp = () => {
    onStart();
  };

  const handleSyncSuccess = () => {
    console.log('영화 동기화 성공');
    refreshMovies(); // 영화 데이터 새로고침
  };

  const handleSyncError = (error) => {
    console.error('영화 동기화 실패:', error);
    // 에러 메시지를 사용자에게 표시할 수 있음
  };

  // 인증 상태를 확인하는 동안 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="home-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>인증 상태 확인 중...</p>
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
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={clearError}>닫기</button>
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
              카카오 계정으로 간편하게 로그인하고 개인화된 영화 추천을 받아보세요.
            </p>
            
            {/* ✅ [핵심 수정] 로그인 없이 시작하기 버튼 섹션 */}
            <div className="guest-login-section">
              <button 
                className="guest-start-button"
                onClick={handleStartApp}
                aria-label="로그인 없이 MoodFlix 시작하기"
              >
                로그인 없이 시작하기
              </button>
              <p className="guest-description">
                로그인 없이도 영화 추천 기능을 이용할 수 있습니다.
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
            
            {/* 관리자용 영화 동기화 버튼 */}
            {user?.role === 'ADMIN' && (
              <div className="admin-section">
                <MovieSyncButton 
                  onSyncComplete={handleSyncSuccess}
                  onSyncError={handleSyncError}
                />
              </div>
            )}
            
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
          {/* ... 기능 아이템들 ... */}
        </div>
      </div>
    </div>
  );
};

HomeScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default HomeScreen;