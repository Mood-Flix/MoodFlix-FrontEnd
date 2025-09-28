/**
 * 카카오 인증 서비스
 * 간단하고 명확한 로직으로 재작성
 */

// 전역 처리 상태 (중복 방지)
let isProcessing = false;
const processedCodes = new Set();

/**
 * 카카오 인가 코드를 액세스 토큰으로 변환
 */
export const exchangeKakaoCodeForToken = async (authorizationCode) => {
  // 이미 처리된 코드인지 확인
  if (processedCodes.has(authorizationCode)) {
    console.log('이미 처리된 인가 코드입니다.');
    return null;
  }

  // 현재 처리 중인지 확인
  if (isProcessing) {
    console.log('다른 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.');
    return null;
  }

  isProcessing = true;

  try {
    console.log('카카오 토큰 교환 시작');
    
    const kakaoAppKey = process.env.REACT_APP_KAKAO_APP_KEY || process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
    if (!kakaoAppKey) {
      throw new Error('카카오 앱 키가 설정되지 않았습니다.');
    }

    // 카카오 OAuth API 호출
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoAppKey,
        redirect_uri: window.location.origin,
        code: authorizationCode
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`토큰 요청 실패: ${errorData.error_description || errorData.error}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('카카오 토큰 획득 성공');

    // 사용자 정보 조회
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('사용자 정보 조회 실패');
    }

    const userData = await userResponse.json();
    console.log('카카오 사용자 정보 조회 성공');

    // 성공적으로 교환된 코드만 처리 완료로 표시
    processedCodes.add(authorizationCode);

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      userInfo: {
        id: userData.id,
        name: userData.kakao_account?.profile?.nickname || '카카오 사용자',
        email: userData.kakao_account?.email,
        profileImage: userData.kakao_account?.profile?.profile_image_url
      }
    };

  } catch (error) {
    console.error('카카오 토큰 교환 실패:', error);
    throw error;
  } finally {
    isProcessing = false;
  }
};

/**
 * 카카오 로그인 처리
 */
export const kakaoLogin = async (kakaoAccessToken) => {
  try {
    console.log('카카오 로그인 처리 시작');
    
    // 사용자 정보 조회
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${kakaoAccessToken}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('사용자 정보 조회 실패');
    }

    const userData = await userResponse.json();
    console.log('카카오 사용자 정보 조회 성공');

    // 사용자 정보 정규화
    const userInfo = {
      id: userData.id,
      name: userData.kakao_account?.profile?.nickname || '카카오 사용자',
      email: userData.kakao_account?.email,
      profileImage: userData.kakao_account?.profile?.profile_image_url
    };

    // 로컬 스토리지에 저장
    localStorage.setItem('accessToken', kakaoAccessToken);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    return {
      accessToken: kakaoAccessToken,
      user: userInfo
    };

  } catch (error) {
    console.error('카카오 로그인 실패:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = () => {
  console.log('로그아웃 처리');
  
  // 로컬 스토리지 정리
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  
  // 카카오 세션 완전 정리
  clearKakaoSession();
};

/**
 * 토큰 유효성 검사
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

/**
 * 저장된 사용자 정보 가져오기
 */
export const getUserProfile = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 카카오 인증 상태 확인
 */
export const checkKakaoAuthStatus = async () => {
  if (!window.Kakao || !window.Kakao.Auth) {
    return { isConnected: false, token: null };
  }

  try {
    const token = window.Kakao.Auth.getAccessToken();
    if (!token) {
      return { isConnected: false, token: null };
    }

    return new Promise((resolve) => {
      window.Kakao.Auth.getStatusInfo({
        success: (response) => {
          resolve({
            isConnected: response.status === 'connected',
            token: token,
            userInfo: response.user
          });
        },
        fail: () => {
          resolve({ isConnected: false, token: null });
        }
      });
    });
  } catch (error) {
    console.error('카카오 토큰 상태 확인 실패:', error);
    return { isConnected: false, token: null };
  }
};

/**
 * 카카오 세션 완전 정리
 */
export const clearKakaoSession = () => {
  if (!window.Kakao || !window.Kakao.Auth) {
    return;
  }

  try {
    // 토큰 유효성 먼저 확인
    const token = window.Kakao.Auth.getAccessToken();
    
    if (token) {
      // 토큰이 있으면 서버에 로그아웃 요청 (에러 무시)
      window.Kakao.Auth.logout((response) => {
        console.log('카카오 서버 로그아웃 요청 완료');
      });
    }
    
    // 로컬 토큰 정리 (서버 요청과 관계없이 항상 수행)
    window.Kakao.Auth.setAccessToken(null);
    console.log('카카오 로컬 세션 정리 완료');
    
  } catch (error) {
    // 에러가 발생해도 로컬 토큰은 반드시 정리
    console.log('카카오 세션 정리 중 에러 발생, 로컬 정리만 수행');
    try {
      window.Kakao.Auth.setAccessToken(null);
      console.log('카카오 로컬 세션 정리 완료');
    } catch (localError) {
      console.error('로컬 토큰 정리 실패:', localError);
    }
  }
};