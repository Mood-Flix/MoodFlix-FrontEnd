import { useState, useEffect, useCallback } from 'react';
import { kakaoLogin, logout as authLogout, getUserProfile, isTokenValid, refreshToken } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 인증 상태 확인 - 로그인 없이도 앱 사용 가능하도록 수정
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        // 토큰이 있고 유효한 경우에만 인증 상태로 설정
        if (isTokenValid()) {
          try {
            const userProfile = await getUserProfile();
            setUser(userProfile);
            setIsAuthenticated(true);
          } catch (error) {
            // 프로필 조회 실패 시 토큰 갱신 시도
            try {
              const refreshed = await refreshToken();
              if (refreshed?.accessToken) {
                const userProfile = await getUserProfile();
                setUser(userProfile);
                setIsAuthenticated(true);
              } else {
                // 토큰 갱신 실패 시 게스트 모드로 설정
                setUser(null);
                setIsAuthenticated(false);
              }
            } catch (_) {
              // 모든 인증 시도 실패 시 게스트 모드로 설정
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          // 토큰이 없거나 유효하지 않은 경우: refreshToken이 있으면 갱신 시도
          const hasRefresh = !!localStorage.getItem('refreshToken');
          if (hasRefresh) {
            try {
              const refreshed = await refreshToken();
              if (refreshed?.accessToken) {
                const userProfile = await getUserProfile();
                setUser(userProfile);
                setIsAuthenticated(true);
              } else {
                setUser(null);
                setIsAuthenticated(false);
              }
            } catch (_) {
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('인증 상태 확인 실패:', error);
        // 에러 발생 시에도 게스트 모드로 설정하여 앱 사용 가능
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 카카오 로그인 처리
  const login = useCallback(async (kakaoAccessToken, kakaoUserInfo) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 백엔드로 카카오 로그인 요청
      const loginResult = await kakaoLogin(kakaoAccessToken, kakaoUserInfo);
      
      // 로그인 성공 시 사용자 정보 설정
      setUser(loginResult.user || kakaoUserInfo);
      setIsAuthenticated(true);
      
      return loginResult;
    } catch (error) {
      console.error('로그인 실패:', error);
      setError(error.message || '로그인에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그아웃 처리
  const logout = useCallback(() => {
    try {
      authLogout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      setError(error.message || '로그아웃에 실패했습니다.');
    }
  }, []);

  // 토큰 갱신
  const refreshAuthToken = useCallback(async () => {
    try {
      const result = await refreshToken();
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      // 토큰 갱신 실패 시 로그아웃
      logout();
      throw error;
    }
  }, [logout]);

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
    logout,
    refreshAuthToken,
    clearError,
  };
};
