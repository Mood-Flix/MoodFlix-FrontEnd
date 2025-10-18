import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAuth } from '../hooks/useAuth';
import UserAuthSection from './UserAuthSection';

const Profile = () => {
  const { user, isAuthenticated, error: authError, login, loginWithKakaoCode, logout, clearError } = useAuth();
  const [imgError, setImgError] = useState(false);

  const displayUser = user || {};

  // 로그인 핸들러 (카카오 액세스 토큰)
  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError();
      await login(kakaoAccessToken);
      console.log('Profile: 로그인 성공');
    } catch (err) {
      console.error('Profile: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
      console.log('Profile: 카카오 코드 로그인 성공');
    } catch (err) {
      console.error('Profile: 카카오 코드 로그인 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    setImgError(false);
  }, [displayUser?.profileImage, displayUser?.id]);

  return (
    <div className="profile-container">
      {/* 사용자 인증 섹션 */}
      <UserAuthSection 
        user={user}
        isAuthenticated={isAuthenticated}
        authError={authError}
        onLoginSuccess={handleLoginSuccess}
        onKakaoCodeLogin={handleKakaoCodeLogin}
        onLoginError={handleLoginError}
        onLogout={handleLogout}
        onClearError={clearError}
      />
      
      <div className="profile-card">
        <div className="profile-card-header">
          <h2 className="profile-title">프로필</h2>
        </div>
        {!isAuthenticated ? (
          <p className="profile-value" style={{ marginBottom: 12, opacity: 0.9 }}>로그인 후 프로필 정보를 확인할 수 있습니다.</p>
        ) : (
          <>
            {(displayUser?.profileImage && !imgError) ? (
              <img
                className="profile-avatar-image"
                src={displayUser.profileImage}
                alt="프로필 이미지"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="profile-avatar" aria-hidden="true">
                {(displayUser?.name?.charAt(0) || 'U').toUpperCase()}
              </div>
            )}
            <div className="profile-info">
              <div className="profile-row">
                <span className="profile-label">이름</span>
                <span className="profile-value">{displayUser?.name || '-'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">이메일</span>
                <span className="profile-value">{displayUser?.email || '-'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;


