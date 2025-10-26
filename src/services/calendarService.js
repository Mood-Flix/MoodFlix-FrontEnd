import { API_BASE_URL } from '../constants/api';

// 월별 캘린더 데이터 가져오기
export const getMonthlyCalendarData = async (year, month) => {
  try {
    const token = localStorage.getItem('accessToken');
    // 토큰 확인 로그는 개발 환경에서만 간단히
    if (process.env.NODE_ENV === 'development') {
      console.log('calendarService: 토큰 확인:', !!token);
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('calendarService: 인증 헤더 추가됨');
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('calendarService: 토큰이 없어 인증 헤더 추가 안함');
      }
    }
    
    // 백엔드 API는 1-based month를 기대하므로 +1
    const backendMonth = month + 1;
    
    // 개발 환경에서만 안전한 로그 출력
    if (process.env.NODE_ENV === 'development') {
      const safeHeaders = { ...headers };
      if (safeHeaders.Authorization) {
        safeHeaders.Authorization = 'Bearer ***REDACTED***';
      }
      console.log('calendarService: API 호출 시작', {
        url: `${API_BASE_URL}/api/calendar?year=${year}&month=${backendMonth}`,
        headers: safeHeaders,
        hasToken: !!token,
        frontendMonth: month,
        backendMonth: backendMonth
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/api/calendar?year=${year}&month=${backendMonth}`, {
      method: 'GET',
      headers
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('calendarService: API 응답 상태', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    }

    // 응답 본문 로깅 제거 (민감정보 보호)

    if (!response.ok) {
      if (response.status === 401) {
        console.error('calendarService: 인증 실패 - 401');
        throw new Error('로그인이 필요합니다.');
      }
      console.error('calendarService: API 호출 실패', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('캘린더 데이터를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    // 민감한 데이터 로깅 제거
    
    // 상세 데이터 분석 로깅 제거 (민감정보 보호)
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = data.map((entry, index) => {
      
      // 날짜 파싱 - 백엔드에서 "2025-01-18" 형식으로 오는 경우
      const entryDate = new Date(entry.date);
      const day = entryDate.getDate();
      
      // 영화 데이터 변환 - 백엔드 MovieSummaryResponse 구조에 맞게
      let selectedMovie = null;
      if (entry.selectedMovie) {
        selectedMovie = {
          id: entry.selectedMovie.id,
          tmdbId: entry.selectedMovie.tmdbId,
          title: entry.selectedMovie.title,
          posterUrl: entry.selectedMovie.posterUrl,
          genre: entry.selectedMovie.genre,
          releaseDate: entry.selectedMovie.releaseDate,
          voteAverage: entry.selectedMovie.voteAverage
        };
      }
      
      const transformed = {
        day: day,
        mood: entry.moodEmoji,
        notes: entry.note,
        date: entry.date,
        id: entry.id,
        recommendations: entry.recommendations || [],
        selectedMovie: selectedMovie
      };
      
      // 변환 과정 로깅 제거 (민감정보 보호)
      return transformed;
    });
    
    // 변환된 데이터 로깅 제거 (민감정보 보호)
    return transformedData;
  } catch (error) {
    console.error('캘린더 데이터 로딩 오류:', error);
    throw error;
  }
};

// 특정 날짜의 캘린더 데이터 가져오기
export const getCalendarEntry = async (date) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/calendar/entry?date=${date}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.');
      }
      if (response.status === 404) {
        return null; // 해당 날짜에 데이터가 없음
      }
      throw new Error('캘린더 항목을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const entryDate = new Date(data.date);
    
    // 영화 데이터 변환 - 백엔드 MovieSummaryResponse 구조에 맞게
    let selectedMovie = null;
    if (data.selectedMovie) {
      selectedMovie = {
        id: data.selectedMovie.id,
        tmdbId: data.selectedMovie.tmdbId,
        title: data.selectedMovie.title,
        posterUrl: data.selectedMovie.posterUrl,
        genre: data.selectedMovie.genre,
        releaseDate: data.selectedMovie.releaseDate,
        voteAverage: data.selectedMovie.voteAverage
      };
    }
    
    return {
      day: entryDate.getDate(),
      mood: data.moodEmoji,
      notes: data.note,
      date: data.date,
      id: data.id,
      recommendations: data.recommendations || [],
      selectedMovie: selectedMovie
    };
  } catch (error) {
    console.error('캘린더 항목 로딩 오류:', error);
    throw error;
  }
};

// 캘린더 데이터 저장/수정
export const saveCalendarEntry = async (date, moodEmoji, note, movieData = null) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 백엔드 API 스펙에 맞게 요청 데이터 구성
    const requestBody = {
      date,
      moodEmoji,
      note,
      movieId: movieData ? movieData.id : null
    };
    
    // 전송 데이터 로깅 제거 (민감정보 보호)
    
    
    const response = await fetch(`${API_BASE_URL}/api/calendar/entry`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.');
      }
      throw new Error('캘린더 데이터 저장에 실패했습니다.');
    }

    const data = await response.json();
    // 저장 응답 데이터 로깅 제거 (민감정보 보호)
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const entryDate = new Date(data.date);
    
    // 영화 데이터 변환 - 백엔드 MovieSummaryResponse 구조에 맞게
    let selectedMovie = null;
    if (data.selectedMovie) {
      selectedMovie = {
        id: data.selectedMovie.id,
        tmdbId: data.selectedMovie.tmdbId,
        title: data.selectedMovie.title,
        posterUrl: data.selectedMovie.posterUrl,
        genre: data.selectedMovie.genre,
        releaseDate: data.selectedMovie.releaseDate,
        voteAverage: data.selectedMovie.voteAverage
      };
    }
    
    return {
      day: entryDate.getDate(),
      mood: data.moodEmoji,
      notes: data.note,
      date: data.date,
      id: data.id,
      recommendations: data.recommendations || [],
      selectedMovie: selectedMovie
    };
  } catch (error) {
    console.error('캘린더 데이터 저장 오류:', error);
    throw error;
  }
};

// 캘린더 데이터 삭제
export const deleteCalendarEntry = async (date) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/calendar/entry?date=${date}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.');
      }
      throw new Error('캘린더 데이터 삭제에 실패했습니다.');
    }

    return { success: true };
  } catch (error) {
    console.error('캘린더 데이터 삭제 오류:', error);
    throw error;
  }
};

// UUID로 공유된 캘린더 엔트리 가져오기
export const getSharedCalendarEntry = async (uuid) => {
  try {
    const url = `${API_BASE_URL}/api/calendar/share/${uuid}`;
    console.log('공유 API 호출:', { url, uuid, API_BASE_URL });
    
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // 네트워크 타임아웃 설정
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    });

    console.log('공유 API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('공유된 페이지를 찾을 수 없습니다.');
      }
      throw new Error(`공유된 캘린더 데이터를 불러오는데 실패했습니다. (${response.status}: ${response.statusText})`);
    }

    const data = await response.json();
    console.log('공유 API 데이터:', data);
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const entryDate = new Date(data.date);
    
    // 영화 데이터 변환 - 백엔드 MovieSummaryResponse 구조에 맞게
    let selectedMovie = null;
    if (data.selectedMovie) {
      selectedMovie = {
        id: data.selectedMovie.id,
        tmdbId: data.selectedMovie.tmdbId,
        title: data.selectedMovie.title,
        posterUrl: data.selectedMovie.posterUrl,
        genre: data.selectedMovie.genre,
        releaseDate: data.selectedMovie.releaseDate,
        voteAverage: data.selectedMovie.voteAverage
      };
    }
    
    return {
      day: entryDate.getDate(),
      mood: data.moodEmoji,
      notes: data.note,
      date: data.date,
      id: data.id,
      recommendations: data.recommendations || [],
      selectedMovie: selectedMovie,
      posterUrl: data.posterUrl
    };
  } catch (error) {
    console.error('공유된 캘린더 데이터 로딩 오류:', error);
    
    // 네트워크 오류 처리
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
    }
    
    // CORS 오류 처리
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      throw new Error('CORS 오류가 발생했습니다. 백엔드 서버의 CORS 설정을 확인해주세요.');
    }
    
    // 네트워크 연결 오류 처리
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('네트워크 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
    
    throw error;
  }
};

