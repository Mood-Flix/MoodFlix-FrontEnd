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
    
    // 백엔드 API는 1-based month를 기대하므로 +1
    const backendMonth = month + 1;
    
    console.log('calendarService: API 호출 시작', {
      url: `${API_BASE_URL}/api/calendar?year=${year}&month=${backendMonth}`,
      headers,
      hasToken: !!token,
      frontendMonth: month,
      backendMonth: backendMonth
    });
    
    const response = await fetch(`${API_BASE_URL}/api/calendar?year=${year}&month=${backendMonth}`, {
      method: 'GET',
      headers
    });

    console.log('calendarService: API 응답 상태', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 응답 본문을 텍스트로 먼저 확인
    const responseText = await response.clone().text();
    console.log('calendarService: 응답 본문 (텍스트):', responseText);

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
    console.log('calendarService: 백엔드 응답 데이터 전체:', JSON.stringify(data, null, 2));
    console.log('calendarService: 응답 데이터 타입:', typeof data);
    console.log('calendarService: 응답 데이터 길이:', data?.length || 0);
    console.log('calendarService: 응답이 배열인가?', Array.isArray(data));
    console.log('calendarService: 요청 URL:', `${API_BASE_URL}/api/calendar?year=${year}&month=${backendMonth}`);
    console.log('calendarService: 요청 헤더:', headers);
    
    // 백엔드 응답 구조 상세 분석
    if (Array.isArray(data) && data.length > 0) {
      console.log('calendarService: 첫 번째 항목 상세 분석:', data[0]);
      console.log('calendarService: 첫 번째 항목 전체 구조:', JSON.stringify(data[0], null, 2));
      console.log('calendarService: selectedMovie 필드 확인:', data[0].selectedMovie);
      console.log('calendarService: selectedMovie 타입:', typeof data[0].selectedMovie);
      console.log('calendarService: selectedMovie 내용:', JSON.stringify(data[0].selectedMovie, null, 2));
      
      // 모든 항목의 selectedMovie 확인
      data.forEach((entry, index) => {
        console.log(`calendarService: 항목 ${index} selectedMovie:`, {
          hasSelectedMovie: !!entry.selectedMovie,
          selectedMovie: entry.selectedMovie,
          movieTitle: entry.selectedMovie?.title,
          movieId: entry.selectedMovie?.id
        });
      });
    } else if (Array.isArray(data)) {
      console.log('calendarService: 빈 배열 응답 - 데이터가 없음');
    } else {
      console.log('calendarService: 예상과 다른 응답 형식:', data);
    }
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = data.map((entry, index) => {
      console.log(`calendarService: 항목 ${index} 변환 전:`, entry);
      console.log(`calendarService: 항목 ${index} selectedMovie:`, entry.selectedMovie);
      
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
      
      console.log(`calendarService: 항목 ${index} 변환 후:`, transformed);
      console.log(`calendarService: 항목 ${index} 영화 데이터 확인:`, {
        hasSelectedMovie: !!transformed.selectedMovie,
        selectedMovieTitle: transformed.selectedMovie?.title,
        selectedMovieId: transformed.selectedMovie?.id,
        originalSelectedMovie: entry.selectedMovie
      });
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
    
    console.log('calendarService: 백엔드로 전송할 데이터 (수정됨):', {
      date,
      moodEmoji,
      note,
      movieId: movieData ? movieData.id : null,
      movieData: movieData,
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

