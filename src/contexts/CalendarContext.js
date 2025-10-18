import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  
  // 초기 캘린더 데이터 (항상 빈 객체로 시작)
  const getInitialCalendarData = () => {
    // F5 새로고침 시에도 항상 서버에서 최신 데이터를 가져오도록
    // localStorage 캐시는 사용하지 않고 항상 서버 API 호출
    console.log('CalendarContext: 초기화 - 서버에서 데이터 로드 예정');
    return {};
  };
  
  const [calendarData, setCalendarData] = useState(getInitialCalendarData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [loadingKeys, setLoadingKeys] = useState(new Set());
  
  // 최신 상태를 참조하기 위한 ref
  const calendarDataRef = useRef(calendarData);
  const loadingKeysRef = useRef(loadingKeys);
  
  // ref 업데이트
  calendarDataRef.current = calendarData;
  loadingKeysRef.current = loadingKeys;
  
  // 특정 월의 캘린더 데이터 로드
  const loadCalendarData = useCallback(async (year, month, forceReload = false) => {
    console.log('CalendarContext: loadCalendarData 호출됨', {
      year,
      month,
      forceReload,
      isAuthenticated,
      authLoading
    });
    
    // 인증 상태 확인
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    
    // 토큰이 있으면 인증된 것으로 간주 (새로고침 시 인증 상태 확인 지연 대응)
    const hasValidAuth = !!(token && userInfo);
    
    console.log('CalendarContext: 인증 상태 확인', {
      isAuthenticated,
      hasValidAuth,
      authLoading,
      token: token ? 'exists' : 'null',
      userInfo: userInfo ? 'exists' : 'null'
    });
    
    // 인증되지 않은 상태에서는 데이터를 로드하지 않음
    if (!isAuthenticated && !hasValidAuth) {
      console.log('CalendarContext: 인증되지 않은 상태 - 캘린더 데이터 로드 건너뜀');
      return;
    }

    // 로그인 후 즉시 데이터 로딩을 위해 authLoading 체크를 완화
    // 토큰과 사용자 정보가 있으면 인증된 것으로 간주하고 데이터 로드 진행
    if (authLoading && !hasValidAuth) {
      console.log('CalendarContext: 인증 상태 로딩 중 - 데이터 로드 대기');
      return;
    }

    const monthKey = `${year}-${month}`;
    
    // 이미 로딩 중인 월이면 중복 요청 방지
    if (loadingKeysRef.current.has(monthKey)) {
      console.log('CalendarContext: 이미 로딩 중인 월 - 중복 요청 방지', monthKey);
      return;
    }

    // 강제 리로드가 아닌 경우에만 중복 로드 방지
    if (!forceReload && calendarDataRef.current[monthKey]) {
      console.log('CalendarContext: 이미 데이터가 있는 월 - 중복 로드 방지', monthKey);
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingKeys(prev => new Set(prev).add(monthKey));
    
    try {
      console.log('CalendarContext: 데이터 로드 시작', { 
        year, 
        month, 
        monthKey,
        frontendMonth: month,
        backendMonth: month + 1,
        monthName: new Date(year, month).toLocaleString('ko-KR', { month: 'long' })
      });
      const data = await getMonthlyCalendarData(year, month);
      
      console.log('CalendarContext: API 응답 받음', {
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: data?.length || 0
      });
      
      // 데이터가 있는 경우에만 상태 업데이트
      if (data && Array.isArray(data)) {
        setCalendarData(prev => ({
          ...prev,
          [monthKey]: data
        }));
        console.log('CalendarContext: 데이터 로드 완료', { monthKey, dataLength: data.length });
      } else {
        console.log('CalendarContext: 로드된 데이터가 없음', { monthKey });
        // 빈 배열로 설정하여 데이터가 없다는 것을 명시
        setCalendarData(prev => ({
          ...prev,
          [monthKey]: []
        }));
      }
    } catch (err) {
      setError(err.message);
      console.error('CalendarContext: 캘린더 데이터 로딩 실패 상세:', {
        error: err,
        message: err.message,
        stack: err.stack,
        year,
        month,
        monthKey,
        token: token ? 'exists' : 'null',
        userInfo: userInfo ? 'exists' : 'null'
      });
      
      // 에러 발생 시에도 빈 배열로 설정하여 무한 로딩 방지
      setCalendarData(prev => ({
        ...prev,
        [monthKey]: []
      }));
    } finally {
      setLoading(false);
      setLoadingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(monthKey);
        return newSet;
      });
    }
  }, [isAuthenticated, authLoading]);


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
    
    // 인증 상태 확인
    
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
      const savedEntry = await saveCalendarEntry(dateString, mood, notes, movieData);
      
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
      
      // 새 엔트리 생성
      
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
  }, [calendarData, isAuthenticated, refreshAuthStatus]);

  // 캘린더 데이터 삭제
  const deleteEntry = useCallback(async (date) => {
    // 인증 상태를 새로고침
    refreshAuthStatus();
    
    // 인증 상태를 다시 확인
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    const hasValidAuth = !!(token && userInfo);
    
    // 인증 상태 확인
    
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
    // 월 변경 시에는 즉시 데이터 로드하지 않고, useEffect에서 처리
  }, []);

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

  // 인증 상태와 월 변경에 따른 데이터 로드 통합 관리
  useEffect(() => {
    // 토큰이 있으면 인증된 것으로 간주하여 데이터 로드
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    const hasValidAuth = !!(token && userInfo);
    
    console.log('CalendarContext: 인증 상태 체크', {
      authLoading,
      isAuthenticated,
      hasValidAuth,
      token: token ? 'exists' : 'null',
      userInfo: userInfo ? 'exists' : 'null'
    });
    
    // 인증 로딩이 완료되고 (인증된 상태이거나 토큰이 있는 경우) 데이터 로드
    if (!authLoading && (isAuthenticated || hasValidAuth)) {
      console.log('CalendarContext: 인증 완료 - 서버에서 데이터 로드 시작', {
        currentYear,
        currentMonth,
        authLoading,
        isAuthenticated,
        hasValidAuth
      });
      loadCalendarData(currentYear, currentMonth);
    }
  }, [authLoading, isAuthenticated, currentYear, currentMonth, loadCalendarData]);

  // 로그인 상태 변경 시 즉시 데이터 로드 (추가 보장)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    const hasValidAuth = !!(token && userInfo);
    
    console.log('CalendarContext: 로그인 상태 변경 감지 useEffect 실행', {
      isAuthenticated,
      hasValidAuth,
      token: token ? 'exists' : 'null',
      userInfo: userInfo ? 'exists' : 'null',
      currentYear,
      currentMonth
    });
    
    // 로그인 상태가 변경되었을 때 즉시 데이터 로드
    if (isAuthenticated || hasValidAuth) {
      console.log('CalendarContext: 로그인 상태 변경 감지 - 즉시 데이터 로드', {
        isAuthenticated,
        hasValidAuth,
        currentYear,
        currentMonth
      });
      loadCalendarData(currentYear, currentMonth);
    }
  }, [isAuthenticated, currentYear, currentMonth, loadCalendarData]);

  // 로그인 후 강제 데이터 로드를 위한 추가 useEffect
  useEffect(() => {
    const checkAndLoadData = () => {
      const token = localStorage.getItem('accessToken');
      const userInfo = localStorage.getItem('userInfo');
      const hasValidAuth = !!(token && userInfo);
      
      console.log('CalendarContext: 강제 데이터 로드 체크', {
        isAuthenticated,
        hasValidAuth,
        authLoading,
        token: token ? 'exists' : 'null',
        userInfo: userInfo ? 'exists' : 'null'
      });
      
      if (!authLoading && (isAuthenticated || hasValidAuth)) {
        console.log('CalendarContext: 강제 데이터 로드 실행');
        loadCalendarData(currentYear, currentMonth);
      }
    };
    
    // 로그인 후 약간의 지연을 두고 데이터 로드 시도
    const timeoutId = setTimeout(checkAndLoadData, 200);
    
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, authLoading, currentYear, currentMonth, loadCalendarData]);

  // localStorage 변경 감지를 위한 추가 useEffect
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('accessToken');
      const userInfo = localStorage.getItem('userInfo');
      const hasValidAuth = !!(token && userInfo);
      
      console.log('CalendarContext: localStorage 변경 감지', {
        isAuthenticated,
        hasValidAuth,
        authLoading,
        token: token ? 'exists' : 'null',
        userInfo: userInfo ? 'exists' : 'null'
      });
      
      if (!authLoading && (isAuthenticated || hasValidAuth)) {
        console.log('CalendarContext: localStorage 변경으로 인한 데이터 로드');
        loadCalendarData(currentYear, currentMonth);
      }
    };
    
    // localStorage 변경 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트 마운트 시에도 체크
    const timeoutId = setTimeout(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, authLoading, currentYear, currentMonth, loadCalendarData]);

  // localStorage 저장 로직 제거 - 항상 서버에서 최신 데이터 사용

  // 로그아웃 시 데이터 초기화
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setCalendarData({}); // 상태 초기화
      console.log('CalendarContext: 로그아웃 시 캘린더 데이터 초기화');
    }
  }, [authLoading, isAuthenticated]);



  // 강제 데이터 리로드 함수
  const forceReloadData = useCallback(() => {
    console.log('CalendarContext: 강제 데이터 리로드 요청');
    // 현재 로딩 중이 아니고, 해당 월이 로딩 중이 아닐 때만 실행
    const monthKey = `${currentYear}-${currentMonth}`;
    if (!loading && !loadingKeys.has(monthKey)) {
      loadCalendarData(currentYear, currentMonth, true);
    } else {
      console.log('CalendarContext: 이미 로딩 중이거나 해당 월이 로딩 중 - 강제 리로드 건너뜀');
    }
  }, [currentYear, currentMonth, loading, loadingKeys]);

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
    goToNextMonth,
    forceReloadData
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
