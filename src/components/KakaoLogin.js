import React, { useEffect, useState } from 'react';
import './KakaoLogin.css';
// Kakao 코드 처리는 상위(useAuth)로 위임합니다.

const KakaoLogin = ({ onLoginSuccess, onLoginError, onKakaoCodeLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 카카오 SDK 초기화
    const initializeKakao = () => {
      const kakaoKey = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
      if (!kakaoKey) {
        console.warn('카카오 JavaScript 키가 설정되지 않았습니다.');
        return;
      }

      if (window.Kakao && typeof window.Kakao.init === 'function') {
        if (!window.Kakao.isInitialized()) {
          try {
            window.Kakao.init(kakaoKey);
            console.log('카카오 SDK 초기화 완료');
          } catch (error) {
            console.error('카카오 SDK 초기화 실패:', error);
            return;
          }
        }
        setIsInitialized(true);
      } else {
        // SDK 로드 대기
        setTimeout(initializeKakao, 1000);
      }
    };

    // URL 파라미터 확인
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('카카오 로그인 에러:', error);
        onLoginError?.('카카오 로그인에 실패했습니다.');
        return;
      }

      if (code) {
        // URL에서 코드 제거 후 상위로 위임
        window.history.replaceState({}, document.title, window.location.pathname);
        onKakaoCodeLogin?.(code);
        return;
      }
    };

    // 초기화 및 URL 파라미터 확인
    initializeKakao();
    checkUrlParams();
  }, []);


  // 카카오 로그인 버튼 클릭
  const handleKakaoLogin = () => {
    if (!isInitialized) {
      console.error('카카오 SDK가 초기화되지 않았습니다.');
      onLoginError?.('카카오 SDK를 불러올 수 없습니다.');
      return;
    }

    if (!window.Kakao.Auth) {
      console.error('카카오 Auth 객체가 존재하지 않습니다.');
      onLoginError?.('카카오 인증 서비스를 사용할 수 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // 카카오 로그인 페이지로 리다이렉트 (계정 선택 강제)
      window.Kakao.Auth.authorize({
        redirectUri: window.location.origin,
        prompt: 'select_account' // 계정 선택 화면 강제 표시
      });
    } catch (error) {
      console.error('카카오 로그인 호출 중 오류:', error);
      setIsLoading(false);
      onLoginError?.('카카오 로그인 중 오류가 발생했습니다.');
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