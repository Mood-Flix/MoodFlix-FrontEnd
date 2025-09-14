import React, { useEffect, useState } from 'react';
import './KakaoLogin.css';

const KakaoLogin = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 카카오 SDK 초기화
    const kakaoKey = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
    if (!kakaoKey) {
      console.warn('REACT_APP_KAKAO_JAVASCRIPT_KEY가 설정되지 않았습니다.');
      return;
    }
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
    }
  }, []);

  const handleKakaoLogin = async () => {
    if (!window.Kakao) {
      onLoginError?.('카카오 SDK를 불러올 수 없습니다.');
      return;
    }

    // 로그인 시점에 미초기화 시 재초기화 시도
    if (!window.Kakao.isInitialized()) {
      const kakaoKey = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
      if (!kakaoKey) {
        onLoginError?.('카카오 설정 누락으로 로그인을 진행할 수 없습니다.');
        return;
      }
      try {
        window.Kakao.init(kakaoKey);
      } catch (e) {
        console.error('카카오 SDK 초기화 실패:', e);
        onLoginError?.('카카오 설정 오류로 로그인을 진행할 수 없습니다.');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      const authObj = await new Promise((resolve, reject) => {
        window.Kakao.Auth.login({
          success: resolve,
          fail: reject,
        });
      });
      
      // console.debug('카카오 로그인 성공'); // 필요 시 개발 환경에서만

      // ✅ [핵심 수정] 성공 시, 백엔드 통신 없이 액세스 토큰만 부모(HomeScreen)에게 전달합니다.
      onLoginSuccess?.(authObj.access_token);

    } catch (error) {
      console.error('카카오 SDK 로그인 실패:', error);
      onLoginError?.('카카오 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kakao-login-container">
      <button 
        className="kakao-login-button"
        onClick={handleKakaoLogin}
        disabled={isLoading}
        aria-label="카카오로 로그인"
      >
        <img 
          src="/kakao-logo.svg" 
          alt="카카오" 
          className="kakao-icon"
        />
        <span className="kakao-text">
          {isLoading ? '로그인 중...' : '카카오로 로그인'}
        </span>
      </button>
    </div>
  );
};

export default KakaoLogin;