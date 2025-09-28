import { useState, useEffect, useCallback } from 'react';
import { kakaoLogin, logout as authLogout, getUserProfile, isTokenValid } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoading(true);
      
      if (isTokenValid()) {
        const userInfo = getUserProfile();
        if (userInfo) {
          setUser(userInfo);
          setIsAuthenticated(true);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // 카카오 인가 코드로 로그인
  const loginWithKakaoCode = useCallback(async (authorizationCode) => {
    if (isLoading) {
      console.log('이미 로그인 처리 중입니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 인가 코드를 토큰으로 변환
      const { exchangeKakaoCodeForToken } = await import('../services/authService');
      const tokenData = await exchangeKakaoCodeForToken(authorizationCode);

      if (!tokenData || !tokenData.accessToken) {
        console.log('토큰 교환 결과가 없습니다. 이미 처리되었을 수 있습니다.');
        return;
      }

      // 사용자 정보 설정
      if (tokenData.userInfo) {
        setUser(tokenData.userInfo);
        setIsAuthenticated(true);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('accessToken', tokenData.accessToken);
        if (tokenData.refreshToken) {
          localStorage.setItem('refreshToken', tokenData.refreshToken);
        }
        localStorage.setItem('userInfo', JSON.stringify(tokenData.userInfo));
        
        console.log('카카오 로그인 성공:', tokenData.userInfo);
      } else {
        throw new Error('카카오 사용자 정보를 가져올 수 없습니다.');
      }

    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      setError(error.message || '카카오 로그인에 실패했습니다.');
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // 카카오 액세스 토큰으로 로그인
  const login = useCallback(async (kakaoAccessToken) => {
    if (isLoading) {
      console.log('이미 로그인 처리 중입니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const loginResult = await kakaoLogin(kakaoAccessToken);

      if (loginResult?.user) {
        setUser(loginResult.user);
        setIsAuthenticated(true);
        console.log('카카오 로그인 성공:', loginResult.user);
      }

    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      setError(error.message || '로그인에 실패했습니다.');
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // 로그아웃
  const logout = useCallback(() => {
    try {
      authLogout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithKakaoCode,
    logout,
    clearError,
  };
};