import { API_BASE_URL } from '../constants/api';

// 캘린더 데이터 가져오기
export const getCalendarData = async (year, month) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendar?year=${year}&month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('캘린더 데이터를 불러오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('캘린더 데이터 로딩 오류:', error);
    throw error;
  }
};

// 특정 날짜의 캘린더 데이터 가져오기
export const getCalendarEntry = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendar/entry?date=${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('캘린더 항목을 불러오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('캘린더 항목 로딩 오류:', error);
    throw error;
  }
};

// 캘린더 데이터 저장/수정
export const saveCalendarEntry = async (date, mood, notes) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendar/entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        date,
        mood,
        notes
      })
    });

    if (!response.ok) {
      throw new Error('캘린더 데이터 저장에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('캘린더 데이터 저장 오류:', error);
    throw error;
  }
};

// 캘린더 데이터 삭제
export const deleteCalendarEntry = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendar/entry?date=${date}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('캘린더 데이터 삭제에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('캘린더 데이터 삭제 오류:', error);
    throw error;
  }
};

// 월별 캘린더 데이터 가져오기 (로컬 스토리지 대체용)
export const getMonthlyCalendarData = async (year, month) => {
  try {
    // 실제 백엔드 연동 전까지는 로컬 스토리지에서 데이터 가져오기
    const storageKey = `calendar_${year}_${month}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return [];
  } catch (error) {
    console.error('월별 캘린더 데이터 로딩 오류:', error);
    return [];
  }
};

// 캘린더 데이터 저장 (로컬 스토리지 대체용)
export const saveMonthlyCalendarData = async (year, month, data) => {
  try {
    // 실제 백엔드 연동 전까지는 로컬 스토리지에 저장
    const storageKey = `calendar_${year}_${month}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return { success: true };
  } catch (error) {
    console.error('월별 캘린더 데이터 저장 오류:', error);
    throw error;
  }
};
