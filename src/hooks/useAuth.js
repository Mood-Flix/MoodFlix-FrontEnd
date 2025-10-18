import { useState, useEffect, useCallback } from 'react';
import { kakaoLogin, logout as authLogout } from '../services/authService';

export const useAuth = () => {
  // 초기 상태를 로컬 스토리지에서 확인
  const getInitialAuthState = () => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    const hasValidAuth = !!(token && userInfo);
    
    if (hasValidAuth) {
      try {
        return {
          user: JSON.parse(userInfo),
          isAuthenticated: true
        };
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        return { user: null, isAuthenticated: false };
      }
    }
    
    return { user: null, isAuthenticated: false };
  };

  const initialState = getInitialAuthState();
  const [user, setUser] = useState(initialState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      console.log('인증 상태 확인 시작');
      
      try {
        const token = localStorage.getItem('accessToken');
        const userInfo = localStorage.getItem('userInfo');
        
        console.log('로컬 스토리지 상태:', {
          hasToken: !!token,
          hasUserInfo: !!userInfo,
          tokenLength: token ? token.length : 0
        });
        
        if (token && userInfo) {
          try {
            const parsedUserInfo = JSON.parse(userInfo);
            setUser(parsedUserInfo);
            setIsAuthenticated(true);
            console.log('인증 상태 설정 완료: true', parsedUserInfo);
          } catch (parseError) {
            console.error('사용자 정보 파싱 오류:', parseError);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('토큰 또는 사용자 정보가 없음');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        console.log('인증 상태 확인 완료');
      }
    };

    // 즉시 실행 - 동기적으로 처리하여 지연 최소화
    checkAuthStatus();
  }, []);

  // 인증 상태를 다시 확인하는 함수
  const refreshAuthStatus = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    const hasValidAuth = !!(token && userInfo);
    
    console.log('useAuth refreshAuthStatus: 인증 상태 새로고침', {
      isAuthenticated,
      hasValidAuth,
      hasToken: !!token,
      hasUserInfo: !!userInfo
    });
    
    if (hasValidAuth && !isAuthenticated) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        setUser(parsedUserInfo);
        setIsAuthenticated(true);
        console.log('인증 상태 새로고침 완료: true', parsedUserInfo);
      } catch (parseError) {
        console.error('사용자 정보 파싱 오류:', parseError);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else if (!hasValidAuth && isAuthenticated) {
      setUser(null);
      setIsAuthenticated(false);
      console.log('인증 상태 새로고침 완료: false');
    }
  }, [isAuthenticated]);

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
        
        // 로그인 성공 후 sessionStorage 플래그 초기화
        sessionStorage.removeItem('calendarReloadAttempted');
        
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
        
        // 로그인 성공 후 sessionStorage 플래그 초기화
        sessionStorage.removeItem('calendarReloadAttempted');
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
    refreshAuthStatus,
  };
};