import { API_BASE_URL, getAuthHeaders } from '../constants/api';

// 월별 캘린더 데이터 가져오기
export const getMonthlyCalendarData = async (year, month) => {
  try {
    const token = localStorage.getItem('accessToken');
    console.log('calendarService: 토큰 확인:', !!token);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('calendarService: 인증 헤더 추가됨');
    } else {
      console.log('calendarService: 토큰이 없어 인증 헤더 추가 안함');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/calendar?year=${year}&month=${month}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.');
      }
      throw new Error('캘린더 데이터를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    console.log('calendarService: 백엔드 응답 데이터:', data);
    console.log('calendarService: 응답 데이터 타입:', typeof data);
    console.log('calendarService: 응답 데이터 길이:', data.length);
    
    // 백엔드 응답 구조 상세 분석
    if (Array.isArray(data) && data.length > 0) {
      console.log('calendarService: 첫 번째 항목 상세 분석:', data[0]);
      console.log('calendarService: selectedMovie 필드 확인:', data[0].selectedMovie);
      console.log('calendarService: selectedMovie 타입:', typeof data[0].selectedMovie);
      console.log('calendarService: selectedMovie 내용:', JSON.stringify(data[0].selectedMovie, null, 2));
    }
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = data.map((entry, index) => {
      console.log(`calendarService: 항목 ${index} 변환 전:`, entry);
      console.log(`calendarService: 항목 ${index} selectedMovie:`, entry.selectedMovie);
      
      const transformed = {
        day: new Date(entry.date).getDate(),
        mood: entry.moodEmoji,
        notes: entry.note,
        date: entry.date,
        id: entry.id,
        recommendations: entry.recommendations || [],
        selectedMovie: entry.selectedMovie || null
      };
      
      console.log(`calendarService: 항목 ${index} 변환 후:`, transformed);
      return transformed;
    });
    
    console.log('calendarService: 변환된 데이터:', transformedData);
    console.log('calendarService: 영화 데이터가 있는 항목들:', 
      transformedData.filter(entry => entry.selectedMovie && entry.selectedMovie.title)
    );
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
    return {
      day: new Date(data.date).getDate(),
      mood: data.moodEmoji,
      notes: data.note,
      date: data.date,
      id: data.id,
      recommendations: data.recommendations || [],
      selectedMovie: data.selectedMovie || null
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
    
    // API 스펙에 맞게 movieId를 전송하되, 백엔드에서 영화 정보를 조회할 수 없는 경우를 대비해 추가 정보도 포함
    const requestBody = {
      date,
      moodEmoji,
      note,
      movieId: movieData ? movieData.id : null
    };
    
    // 백엔드에서 영화 정보를 조회할 수 없는 경우를 대비해 추가 영화 정보도 포함
    // 만약 백엔드가 selectedMovie 객체를 직접 받는다면 이 부분을 사용
    if (movieData) {
      requestBody.movieInfo = {
        tmdbId: movieData.tmdbId,
        title: movieData.title,
        posterUrl: movieData.posterUrl,
        genre: movieData.genre,
        releaseDate: movieData.releaseDate,
        voteAverage: movieData.voteAverage
      };
      
      // 백엔드가 selectedMovie 객체를 직접 받는 경우를 위한 대안
      // requestBody.selectedMovie = movieData;
    }
    
    console.log('calendarService: 백엔드로 전송할 데이터:', {
      date,
      moodEmoji,
      note,
      movieData,
      movieId: movieData ? movieData.id : null,
      movieInfo: movieData ? requestBody.movieInfo : null,
      movieDataString: JSON.stringify(movieData, null, 2),
      movieDataType: typeof movieData,
      hasMovieData: !!movieData
    });
    
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
    console.log('calendarService: 저장 응답 데이터:', data);
    console.log('calendarService: 저장된 selectedMovie:', data.selectedMovie);
    console.log('calendarService: selectedMovie 타입:', typeof data.selectedMovie);
    console.log('calendarService: selectedMovie 내용:', JSON.stringify(data.selectedMovie, null, 2));
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    return {
      day: new Date(data.date).getDate(),
      mood: data.moodEmoji,
      notes: data.note,
      date: data.date,
      id: data.id,
      recommendations: data.recommendations || [],
      selectedMovie: data.selectedMovie || null
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

