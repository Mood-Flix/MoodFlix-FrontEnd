import React from 'react';
import { useAuth } from '../hooks/useAuth';
import KakaoLogin from './KakaoLogin';
import './UserAuthSection.css';

const UserAuthSection = () => {
  const { 
    user, 
    isAuthenticated, 
    error: authError, 
    login, 
    loginWithKakaoCode, 
    logout, 
    clearError 
  } = useAuth();

  // 로그인 핸들러 (카카오 액세스 토큰)
  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError();
      await login(kakaoAccessToken);
      console.log('UserAuthSection: 로그인 성공');
    } catch (err) {
      console.error('UserAuthSection: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
      console.log('UserAuthSection: 카카오 코드 로그인 성공');
    } catch (err) {
      console.error('UserAuthSection: 카카오 코드 로그인 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="compact-auth-section">
      {isAuthenticated ? (
        <div className="compact-user-info">
          <span className="compact-welcome">안녕하세요, {user?.name || '사용자'}님!</span>
          <button className="compact-logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      ) : (
        <div className="compact-login-section">
          <KakaoLogin 
            onLoginSuccess={handleLoginSuccess} 
            onLoginError={handleLoginError}
            onKakaoCodeLogin={handleKakaoCodeLogin}
          />
          {authError && (
            <div className="compact-auth-error">
              <span>{authError}</span>
              <button onClick={clearError}>×</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAuthSection;
