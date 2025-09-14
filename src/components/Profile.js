import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, isAuthenticated, loadUserProfile, isLoading } = useAuth();
  const [imgError, setImgError] = useState(false);

  const displayUser = user || {};

  useEffect(() => {
    setImgError(false);
  }, [displayUser?.profileImage, displayUser?.id]);

  return (
    <div className="profile-container">
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
              <div className="profile-row">
                <span className="profile-label">아이디</span>
                <span className="profile-value">{displayUser?.id || '-'}</span>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button type="button" className="profile-back" onClick={() => loadUserProfile()} disabled={isLoading}>
                {isLoading ? '불러오는 중...' : '프로필 새로고침'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;


