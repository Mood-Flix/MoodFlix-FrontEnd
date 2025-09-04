import { useState, useEffect, useCallback } from 'react';
import { kakaoLogin, logout as authLogout, getUserProfile, isTokenValid, refreshToken } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 인증 상태 확인 - 로그인 없이도 앱 사용 가능하도록 수정
   useEffect(() => {
    // 페이지 로드 시, 로컬 스토리지의 정보로 로그인 상태를 복원하는 로직
    const checkAuthStatus = () => {
      setIsLoading(true);
      if (isTokenValid()) {
        const userInfo = getUserProfile(); // authService에서 저장된 정보 가져오기
        if (userInfo) {
          setUser(userInfo);
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  // ✅ [수정] login 함수가 백엔드 통신 및 상태 업데이트를 모두 책임집니다.
  const login = useCallback(async (kakaoAccessToken) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // authService를 통해 백엔드에 로그인 요청
      const loginResult = await kakaoLogin(kakaoAccessToken);
      
      // 백엔드 응답이 성공적이면 상태를 업데이트
      if (loginResult && loginResult.userId) {
        setUser({ userId: loginResult.userId, name: loginResult.name });
        setIsAuthenticated(true);
      }
      
    } catch (error) {
      console.error('로그인 실패 (useAuth):', error);
      setError(error.message || '로그인에 실패했습니다.');
      // 실패 시 상태를 확실하게 로그아웃 상태로 변경
      setIsAuthenticated(false);
      setUser(null);
      throw error; // 에러를 다시 던져서 호출한 쪽에서도 알 수 있게 함
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
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

  // 프로필 강제 로드 (백엔드 연동)
  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true); // 단기 대응은 App에서 profile 뷰일 때 오버레이 비표시(아래 App.js 코멘트 참조)
      const profile = await getUserProfile();
      const normalized = normalizeUser(profile);
      setUser(normalized);
      setIsAuthenticated(true);
      return normalized;
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      setError(error.message || '프로필을 불러오지 못했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
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
    logout,
    refreshAuthToken,
    loadUserProfile,
    clearError,
  };
};

// 백엔드 응답을 프론트 표준 형태로 변환
function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  // 가능한 키 매핑
  const id = raw.id ?? raw.userId ?? raw.kakaoId ?? raw.memberId ?? null;
  const name = raw.name ?? raw.nickname ?? raw.userName ?? raw.displayName ?? null;
  const email = raw.email ?? raw.userEmail ?? null;
  const profileImage = raw.profileImage ?? raw.profile_image ?? raw.profile_image_url ?? raw.avatarUrl ?? raw.picture ?? null;
  return { ...raw, id, name, email, profileImage };
}