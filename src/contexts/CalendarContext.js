import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getMonthlyCalendarData,
  saveCalendarEntry,
  deleteCalendarEntry
} from '../services/calendarService';

const CalendarContext = createContext();

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children }) => {
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // 특정 월의 캘린더 데이터 로드
  const loadCalendarData = useCallback(async (year, month) => {
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
  }, []);

  // 현재 월의 캘린더 데이터 로드
  const loadCurrentMonthData = useCallback(() => {
    loadCalendarData(currentYear, currentMonth);
  }, [currentYear, currentMonth, loadCalendarData]);

  // 특정 날짜의 데이터 가져오기
  const getEntryForDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const monthData = calendarData[`${year}-${month}`] || [];
    return monthData.find(entry => entry.day === day);
  }, [calendarData]);

  // 캘린더 데이터 저장
  const saveEntry = useCallback(async (date, mood, notes, movieInfo = null) => {
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
      console.log('CalendarContext: 저장할 데이터:', { dateString, mood, notes, movieInfo });
      const savedEntry = await saveCalendarEntry(dateString, mood, notes, movieInfo);
      console.log('CalendarContext: 저장된 응답:', savedEntry);
      
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
        movieInfo: savedEntry.movieInfo || movieInfo
      };
      
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
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('캘린더 데이터 저장 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [calendarData]);

  // 캘린더 데이터 삭제
  const deleteEntry = useCallback(async (date) => {
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
  }, [calendarData]);

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

  // 컴포넌트 마운트 시 현재 월 데이터 로드
  useEffect(() => {
    loadCurrentMonthData();
  }, [loadCurrentMonthData]);

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
