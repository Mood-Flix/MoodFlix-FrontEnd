import React, { useState } from 'react';
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
    goToCurrentMonth
  } = useCalendarContext();

  // 인증 관련 상태
  const { user, isAuthenticated, error: authError, login, loginWithKakaoCode, logout, clearError } = useAuth();

  // 로그인 핸들러 (카카오 액세스 토큰)
  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError();
      await login(kakaoAccessToken);
      console.log('MyCalendar: 로그인 성공');
    } catch (err) {
      console.error('MyCalendar: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
      console.log('MyCalendar: 카카오 코드 로그인 성공');
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
  
  // 디버깅: 현재 월과 년도 확인
  console.log('MyCalendar: 현재 월/년도:', {
    displayMonth,
    displayYear,
    '현재 날짜': new Date(),
    '현재 월 (0-based)': new Date().getMonth(),
    '현재 년도': new Date().getFullYear(),
    '월 표시 (displayMonth + 1)': displayMonth + 1,
    '년도 표시': displayYear
  });

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
  // 영화 정보가 있는 날짜들
  const daysWithMovies = monthData.filter(entry => entry.movieInfo).map(entry => entry.day);
  
  // 디버깅을 위한 콘솔 로그
  console.log('MyCalendar Debug:', {
    monthData,
    daysWithMood,
    daysWithMovies,
    calendarData,
    'monthData 길이': monthData.length,
    'daysWithMood 길이': daysWithMood.length,
    'daysWithMovies 길이': daysWithMovies.length
  });
  
  // 각 항목의 상세 정보 출력
  if (monthData.length > 0) {
    console.log('monthData 상세:', monthData);
    monthData.forEach((entry, index) => {
      console.log(`항목 ${index}:`, {
        day: entry.day,
        mood: entry.mood,
        movieInfo: entry.movieInfo,
        notes: entry.notes
      });
    });
  }

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
    setPreviewEntry(null);
    setPreviewDate(null);
    navigate('/calendar/edit', { state: { selectedDate: previewDate, editMode: true } });
  };

  const handleBackToHome = () => {
    navigate('/');
  };


  // 로그인하지 않은 사용자에게 표시할 메시지
  if (!isAuthenticated) {
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
      
      {loading && (
        <div className="my-calendar-popup">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>캘린더 데이터를 불러오는 중...</p>
          </div>
        </div>
      )}
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
                        {/* 디버깅용 - 기분 데이터가 있는 날짜 표시 */}
                        {hasMood && (
                          <div style={{fontSize: '8px', color: 'red', position: 'absolute', top: '2px', left: '2px'}}>
                            M
                          </div>
                        )}
                        {/* 강제로 기분 표시 테스트 */}
                        {entry && entry.mood && (
                          <div style={{fontSize: '8px', color: 'blue', position: 'absolute', top: '2px', right: '2px'}}>
                            {entry.mood}
                          </div>
                        )}
                        {hasMovie && entry && (
                          <span className="movie-indicator">🎬</span>
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
