import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getMonthlyCalendarData,
  saveCalendarEntry,
  deleteCalendarEntry
} from '../services/calendarService';
import { useAuth } from '../hooks/useAuth';

const CalendarContext = createContext();

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading, refreshAuthStatus } = useAuth();
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // 특정 월의 캘린더 데이터 로드
  const loadCalendarData = useCallback(async (year, month) => {
    // 인증되지 않은 상태에서는 데이터를 로드하지 않음
    if (!isAuthenticated) {
      console.log('CalendarContext: 인증되지 않은 상태 - 캘린더 데이터 로드 건너뜀');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await getMonthlyCalendarData(year, month);
      console.log('CalendarContext: 로드된 데이터:', { year, month, data });
      setCalendarData(prev => ({
        ...prev,
        [`${year}-${month}`]: data
      }));
    } catch (err) {
      setError(err.message);
      console.error('캘린더 데이터 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);


  // 특정 날짜의 데이터 가져오기
  const getEntryForDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const monthData = calendarData[`${year}-${month}`] || [];
    return monthData.find(entry => entry.day === day);
  }, [calendarData]);

  // 캘린더 데이터 저장
  const saveEntry = useCallback(async (date, mood, notes, movieData = null) => {
    // 인증 상태를 새로고침
    refreshAuthStatus();
    
    // 인증 상태를 다시 확인
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    const hasValidAuth = !!(token && userInfo);
    
    console.log('CalendarContext saveEntry: 인증 상태 확인', {
      isAuthenticated,
      hasValidAuth,
      hasToken: !!token,
      hasUserInfo: !!userInfo
    });
    
    // 인증되지 않은 상태에서는 저장하지 않음
    if (!isAuthenticated && !hasValidAuth) {
      throw new Error('로그인이 필요합니다.');
    }

    setLoading(true);
    setError(null);
    
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const dateString = [
        year,
        String(month + 1).padStart(2, '0'),
        String(day).padStart(2, '0')
      ].join('-');
      
      // 백엔드에 저장
      console.log('CalendarContext: 저장할 데이터:', { 
        dateString, 
        mood, 
        notes, 
        movieData,
        movieDataString: JSON.stringify(movieData, null, 2),
        movieDataType: typeof movieData,
        hasMovieData: !!movieData
      });
      const savedEntry = await saveCalendarEntry(dateString, mood, notes, movieData);
      console.log('CalendarContext: 저장된 응답:', savedEntry);
      console.log('CalendarContext: 저장된 영화 데이터:', savedEntry.selectedMovie);
      
      // 로컬 상태 업데이트
      const monthKey = `${year}-${month}`;
      const monthData = calendarData[monthKey] || [];
      
      const existingIndex = monthData.findIndex(entry => entry.day === day);
      const newEntry = {
        day,
        mood: savedEntry.mood,
        notes: savedEntry.notes,
        date: savedEntry.date,
        id: savedEntry.id,
        recommendations: savedEntry.recommendations,
        selectedMovie: savedEntry.selectedMovie || null
      };
      
      console.log('CalendarContext: 새 엔트리 생성:', {
        newEntry,
        selectedMovie: newEntry.selectedMovie,
        hasMovie: !!newEntry.selectedMovie
      });
      
      let updatedMonthData;
      if (existingIndex >= 0) {
        // 기존 항목 수정
        updatedMonthData = [...monthData];
        updatedMonthData[existingIndex] = newEntry;
      } else {
        // 새 항목 추가
        updatedMonthData = [...monthData, newEntry];
      }
      
      // 상태 업데이트
      setCalendarData(prev => ({
        ...prev,
        [monthKey]: updatedMonthData
      }));
      
      console.log('CalendarContext: 상태 업데이트 완료:', {
        monthKey,
        updatedMonthData,
        newEntry,
        selectedMovie: newEntry.selectedMovie
      });
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('캘린더 데이터 저장 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [calendarData, isAuthenticated, refreshAuthStatus]);

  // 캘린더 데이터 삭제
  const deleteEntry = useCallback(async (date) => {
    // 인증 상태를 새로고침
    refreshAuthStatus();
    
    // 인증 상태를 다시 확인
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    const hasValidAuth = !!(token && userInfo);
    
    console.log('CalendarContext deleteEntry: 인증 상태 확인', {
      isAuthenticated,
      hasValidAuth,
      hasToken: !!token,
      hasUserInfo: !!userInfo
    });
    
    // 인증되지 않은 상태에서는 삭제하지 않음
    if (!isAuthenticated && !hasValidAuth) {
      throw new Error('로그인이 필요합니다.');
    }

    setLoading(true);
    setError(null);
    
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const dateString = [
        year,
        String(month + 1).padStart(2, '0'),
        String(day).padStart(2, '0')
      ].join('-');
      
      // 백엔드에서 삭제
      await deleteCalendarEntry(dateString);
      
      // 로컬 상태 업데이트
      const monthKey = `${year}-${month}`;
      const monthData = calendarData[monthKey] || [];
      
      const updatedMonthData = monthData.filter(entry => entry.day !== day);
      
      // 상태 업데이트
      setCalendarData(prev => ({
        ...prev,
        [monthKey]: updatedMonthData
      }));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('캘린더 데이터 삭제 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [calendarData, isAuthenticated, refreshAuthStatus]);

  // 월 변경
  const changeMonth = useCallback((year, month) => {
    console.log('CalendarContext: 월 변경:', { year, month });
    setCurrentYear(year);
    setCurrentMonth(month);
    loadCalendarData(year, month);
  }, [loadCalendarData]);

  // 현재 월로 이동
  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    changeMonth(now.getFullYear(), now.getMonth());
  }, [changeMonth]);

  // 이전 월로 이동
  const goToPreviousMonth = useCallback(() => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    changeMonth(newDate.getFullYear(), newDate.getMonth());
  }, [currentYear, currentMonth, changeMonth]);

  // 다음 월로 이동
  const goToNextMonth = useCallback(() => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    changeMonth(newDate.getFullYear(), newDate.getMonth());
  }, [currentYear, currentMonth, changeMonth]);

  // 컴포넌트 마운트 시 현재 월 데이터 로드 (인증 상태 확인 후)
  useEffect(() => {
    // 인증 로딩이 완료되고 인증된 상태일 때만 데이터 로드
    if (!authLoading && isAuthenticated) {
      console.log('CalendarContext: 인증 완료 - 현재 월 데이터 로드 시작');
      loadCalendarData(currentYear, currentMonth);
    }
  }, [authLoading, isAuthenticated, currentYear, currentMonth, loadCalendarData]);

  const value = {
    calendarData,
    loading,
    error,
    currentYear,
    currentMonth,
    loadCalendarData,
    getEntryForDate,
    saveEntry,
    deleteEntry,
    changeMonth,
    goToCurrentMonth,
    goToPreviousMonth,
    goToNextMonth
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
