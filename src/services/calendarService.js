import { API_BASE_URL, getAuthHeaders } from '../constants/api';

// 월별 캘린더 데이터 가져오기
export const getMonthlyCalendarData = async (year, month) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar?year=${year}&month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
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
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = data.map(entry => ({
      day: new Date(entry.date).getDate(),
      mood: entry.moodEmoji,
      notes: entry.note,
      date: entry.date,
      id: entry.id,
      recommendations: entry.recommendations || [],
      movieInfo: entry.movieInfo || null
    }));
    
    console.log('calendarService: 변환된 데이터:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('캘린더 데이터 로딩 오류:', error);
    throw error;
  }
};

// 특정 날짜의 캘린더 데이터 가져오기
export const getCalendarEntry = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/entry?date=${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
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
      movieInfo: data.movieInfo || null
    };
  } catch (error) {
    console.error('캘린더 항목 로딩 오류:', error);
    throw error;
  }
};

// 캘린더 데이터 저장/수정
export const saveCalendarEntry = async (date, moodEmoji, note, movieInfo = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        date,
        moodEmoji,
        note,
        movieInfo
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.');
      }
      throw new Error('캘린더 데이터 저장에 실패했습니다.');
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
      movieInfo: data.movieInfo || movieInfo
    };
  } catch (error) {
    console.error('캘린더 데이터 저장 오류:', error);
    throw error;
  }
};

// 캘린더 데이터 삭제
export const deleteCalendarEntry = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/entry?date=${date}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
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

