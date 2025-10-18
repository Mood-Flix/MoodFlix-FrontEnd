import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendarContext } from '../contexts/CalendarContext';
import { useAuth } from '../hooks/useAuth';
import UserAuthSection from './UserAuthSection';
import CalendarPreview from './CalendarPreview';
import './MyCalendar.css';

const MyCalendar = () => {
  const navigate = useNavigate();
  const [previewEntry, setPreviewEntry] = useState(null);
  const [previewDate, setPreviewDate] = useState(null);
  
  const {
    calendarData,
    loading,
    error,
    currentYear: calendarYear,
    currentMonth: calendarMonth,
    getEntryForDate,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    forceReloadData
  } = useCalendarContext();

  // 인증 관련 상태
  const { user, isAuthenticated, isLoading: authLoading, error: authError, login, loginWithKakaoCode, logout, clearError } = useAuth();

  // 로그인 핸들러 (카카오 액세스 토큰)
  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError();
      await login(kakaoAccessToken);
    } catch (err) {
      console.error('MyCalendar: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
    } catch (err) {
      console.error('MyCalendar: 카카오 코드 로그인 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  const displayMonth = calendarMonth;
  const displayYear = calendarYear;
  

  // 현재 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(displayYear, displayMonth, 1);
  const lastDay = new Date(displayYear, displayMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 달력 그리드 생성
  const calendarDays = [];
  
  // 이전 달의 마지막 날들
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 현재 달의 날들
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // 현재 월의 저장된 데이터 가져오기
  const monthData = calendarData[`${displayYear}-${displayMonth}`] || [];
  const daysWithEntries = monthData.map(entry => entry.day);
  // 저장된 기분 데이터가 있는 날짜들
  const daysWithMood = monthData.filter(entry => entry.mood).map(entry => entry.day);
  // 영화 정보가 있는 날짜들 - 더 엄격한 조건으로 확인
  const daysWithMovies = monthData.filter(entry => {
    const hasMovie = entry.selectedMovie && 
                    entry.selectedMovie.title && 
                    entry.selectedMovie.title.trim() !== '';
    return hasMovie;
  }).map(entry => entry.day);
  
  // 디버깅을 위한 로그 (개발 모드에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('MyCalendar: 월 데이터 확인', {
      displayYear,
      displayMonth,
      monthDataLength: monthData.length,
      daysWithMovies: daysWithMovies.length,
      loading,
      error,
      isAuthenticated,
      authLoading,
      calendarData: calendarData,
      monthKey: `${displayYear}-${displayMonth}`,
      hasMonthData: !!calendarData[`${displayYear}-${displayMonth}`],
      token: localStorage.getItem('accessToken') ? 'exists' : 'null',
      userInfo: localStorage.getItem('userInfo') ? 'exists' : 'null',
      // 월 계산 디버깅 정보 추가
      frontendMonth: displayMonth,
      backendMonth: displayMonth + 1,
      monthName: new Date(displayYear, displayMonth).toLocaleString('ko-KR', { month: 'long' }),
      // 실제 데이터 내용 확인
      monthDataDetails: monthData.map(entry => ({
        day: entry.day,
        date: entry.date,
        mood: entry.mood,
        hasMovie: !!entry.selectedMovie,
        movieTitle: entry.selectedMovie?.title
      }))
    });
  }

  // 로그인 후 데이터 로딩 상태 확인 (한 번만 실행)
  useEffect(() => {
    if (isAuthenticated && !loading && !error && monthData.length === 0) {
      console.log('MyCalendar: 로그인 후 데이터가 없음 - 데이터 로딩 재시도');
      // 로그인 후에는 새로고침 플래그를 초기화하고 데이터 로딩을 시도
      sessionStorage.removeItem('calendarReloadAttempted');
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('MyCalendar: 토큰 존재, 강제 데이터 로딩 시도');
        // CalendarContext의 강제 리로드 함수 사용 - 즉시 실행
        forceReloadData();
      }
    }
  }, [isAuthenticated, loading, error, monthData.length, forceReloadData]); // 의존성 배열 개선
  

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = new Date(displayYear, displayMonth, day);
      
      // 기존 데이터가 있는지 확인
      const existingEntry = getEntryForDate(clickedDate);
      if (existingEntry) {
        // 기존 데이터가 있으면 미리 보기 모달 표시
        setPreviewEntry(existingEntry);
        setPreviewDate(clickedDate);
      } else {
        // 새 데이터를 추가하려면 추천 페이지로 이동
        navigate('/recommendation');
      }
    }
  };

  const handlePreviewClose = () => {
    setPreviewEntry(null);
    setPreviewDate(null);
  };

  const handlePreviewEdit = () => {
    // 편집 모드로 바로 이동하면서 기존 데이터도 함께 전달
    navigate('/calendar/edit', { 
      state: { 
        selectedDate: previewDate, 
        editMode: true,
        existingEntry: previewEntry
      } 
    });
    setPreviewEntry(null);
    setPreviewDate(null);
  };


  const handleBackToHome = () => {
    navigate('/');
  };


  // 인증 상태 로딩 중 또는 데이터 로딩 중
  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="my-calendar-container">
        <UserAuthSection 
          user={user}
          isAuthenticated={isAuthenticated}
          authError={authError}
          onLoginSuccess={handleLoginSuccess}
          onKakaoCodeLogin={handleKakaoCodeLogin}
          onLoginError={handleLoginError}
          onLogout={handleLogout}
          onClearError={clearError}
        />
        <div className="my-calendar-popup">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{authLoading ? '인증 상태를 확인하는 중...' : '캘린더 데이터를 불러오는 중...'}</p>
          </div>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 사용자에게만 표시할 메시지 (로딩 완료 후, 인증되지 않은 경우에만)
  if (!authLoading && !isAuthenticated) {
    console.log('인증되지 않은 사용자, 로그인 요구 메시지 표시', {
      isAuthenticated,
      authLoading,
      user
    });
    return (
      <div className="my-calendar-container">
        <UserAuthSection 
          user={user}
          isAuthenticated={isAuthenticated}
          authError={authError}
          onLoginSuccess={handleLoginSuccess}
          onKakaoCodeLogin={handleKakaoCodeLogin}
          onLoginError={handleLoginError}
          onLogout={handleLogout}
          onClearError={clearError}
        />
        <div className="my-calendar-popup">
          <div className="auth-required-container">
            <h3>캘린더를 사용하려면 로그인이 필요합니다</h3>
            <p>로그인 후 나만의 기분 캘린더를 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-calendar-container">
      {/* 사용자 인증 섹션 */}
      <UserAuthSection 
        user={user}
        isAuthenticated={isAuthenticated}
        authError={authError}
        onLoginSuccess={handleLoginSuccess}
        onKakaoCodeLogin={handleKakaoCodeLogin}
        onLoginError={handleLoginError}
        onLogout={handleLogout}
        onClearError={clearError}
      />
      
      {error && (
        <div className="my-calendar-popup">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={goToCurrentMonth} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="my-calendar-popup">
          <div className="my-calendar-header">
            <button className="back-btn" onClick={handleBackToHome} aria-label="홈으로 돌아가기">← 홈으로</button>
            <div className="my-calendar-navigation">
              <button className="nav-btn" onClick={goToPreviousMonth}>‹</button>
              <h2>{`${displayMonth + 1}월 ${displayYear}`}</h2>
              <button className="nav-btn" onClick={goToNextMonth}>›</button>
            </div>
          </div>
          
          <div className="my-calendar-grid">
            <div className="my-calendar-weekdays">
              <span>일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span>토</span>
            </div>
            <div className="my-calendar-days">
              {calendarDays.map((day, index) => {
                const hasEntry = daysWithEntries.includes(day);
                const hasMood = daysWithMood.includes(day);
                const hasMovie = daysWithMovies.includes(day);
                const entry = hasEntry ? monthData.find(e => e.day === day) : null;
                const isToday = day && 
                  new Date().getDate() === day && 
                  new Date().getMonth() === displayMonth && 
                  new Date().getFullYear() === displayYear;
                
                return (
                  <div
                    key={index}
                    className={`my-calendar-day ${day ? 'has-content' : 'empty'} ${hasMood ? 'has-mood' : ''} ${hasMovie ? 'has-movie' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day && (
                      <>
                        <span className="day-number">{day}</span>
                        {hasMood && entry && (
                          <span className="mood-indicator">
                            {entry.mood || '😊'}
                          </span>
                        )}
                        {hasMovie && entry && entry.selectedMovie && (
                          <span className="movie-indicator" title={entry.selectedMovie.title}>🎬</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="my-calendar-legend">
            <div className="legend-item">
              <span className="legend-emoji">😊</span>
              <span>기분 기록</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">🎬</span>
              <span>영화 저장</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">📝</span>
              <span>메모만 있음</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">📅</span>
              <span>오늘</span>
            </div>
          </div>
        </div>
      )}

      {/* 미리 보기 모달 */}
      {previewEntry && previewDate && (
        <CalendarPreview
          entry={previewEntry}
          date={previewDate}
          onClose={handlePreviewClose}
          onEdit={handlePreviewEdit}
        />
      )}
    </div>
  );
};

export default MyCalendar;
