import React from 'react';
import KakaoLogin from './KakaoLogin';
import './UserAuthSection.css';

const UserAuthSection = ({ 
  className = '',
  user,
  isAuthenticated,
  authError,
  onLoginSuccess,
  onKakaoCodeLogin,
  onLoginError,
  onLogout,
  onClearError
}) => {

  return (
    <div className={`user-auth-section ${className}`}>
      {isAuthenticated ? (
        <div className="user-info">
          <span className="welcome-text">안녕하세요, {user?.name || '사용자'}님!</span>
          <button className="logout-button" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      ) : (
        <div className="login-section">
          <KakaoLogin 
            onLoginSuccess={onLoginSuccess} 
            onLoginError={onLoginError}
            onKakaoCodeLogin={onKakaoCodeLogin}
          />
          {authError && (
            <div className="auth-error">
              <span>{authError}</span>
              <button onClick={onClearError}>×</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAuthSection;
