import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendarContext } from '../contexts/CalendarContext';
import { useAuth } from '../hooks/useAuth';
import UserAuthSection from './UserAuthSection';
import './Calendar.css';

const Calendar = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  const {
    calendarData,
    loading,
    error,
    currentYear: calendarYear,
    currentMonth: calendarMonth,
    getEntryForDate,
    saveEntry,
    deleteEntry,
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
      console.log('Calendar: 로그인 성공');
    } catch (err) {
      console.error('Calendar: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
      console.log('Calendar: 카카오 코드 로그인 성공');
    } catch (err) {
      console.error('Calendar: 카카오 코드 로그인 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  // localStorage에서 선택된 영화 정보를 가져오는 useEffect
  useEffect(() => {
    const savedMovie = localStorage.getItem('selectedMovieForCalendar');
    if (savedMovie) {
      try {
        const movieData = JSON.parse(savedMovie);
        setSelectedMovie(movieData);
        // 영화 정보를 가져온 후 localStorage에서 제거
        localStorage.removeItem('selectedMovieForCalendar');
        // 영화가 선택된 경우 바로 편집 모드로 전환
        setIsEditMode(true);
      } catch (error) {
        console.error('영화 정보 파싱 오류:', error);
      }
    }
  }, []);

  const moods = [
    { emoji: '😐', text: '그냥저냥' },
    { emoji: '😠', text: '화나요' },
    { emoji: '😊', text: '좋아요' },
    { emoji: '😢', text: '슬퍼요' },
    { emoji: '🤩', text: '신나요' }
  ];

  const displayMonth = calendarMonth;
  const displayYear = calendarYear;
  
  // 디버깅: Calendar 컴포넌트의 현재 월/년도 확인
  console.log('Calendar: 현재 월/년도:', {
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
  // 저장된 영화가 있는 날짜들 (기분 데이터가 있는 날짜들)
  const daysWithMood = monthData.filter(entry => entry.mood).map(entry => entry.day);

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = new Date(displayYear, displayMonth, day);
      setSelectedDate(clickedDate);
      
      // 기존 데이터가 있는지 확인
      const existingEntry = getEntryForDate(clickedDate);
      if (existingEntry) {
        // 이모지를 텍스트로 변환하여 선택 상태 설정
        const moodText = moods.find(mood => mood.emoji === existingEntry.mood)?.text || '';
        setSelectedMood(moodText);
        setNotes(existingEntry.notes || '');
      } else {
        setSelectedMood('');
        setNotes('');
      }
      
      setIsEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) {
      alert('기분을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 선택된 기분의 이모지를 찾아서 전송
      const selectedMoodData = moods.find(mood => mood.text === selectedMood);
      const moodEmoji = selectedMoodData ? selectedMoodData.emoji : selectedMood;
      
      // 영화 정보가 있으면 함께 저장
      const movieInfo = selectedMovie ? {
        id: selectedMovie.id,
        title: selectedMovie.title,
        posterUrl: selectedMovie.posterUrl,
        genre: selectedMovie.genre,
        releaseDate: selectedMovie.releaseDate,
        voteAverage: selectedMovie.voteAverage
      } : null;
      
      await saveEntry(selectedDate, moodEmoji, notes, movieInfo);
      alert('저장되었습니다!');
      setIsEditMode(false);
      setSelectedMovie(null); // 영화 정보 초기화
    } catch (error) {
      alert('저장에 실패했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComplete = () => {
    handleSave();
  };

  const handleBackToRecommendations = () => {
    // 선택된 영화 정보를 초기화하고 추천 페이지로 이동
    setSelectedMovie(null);
    navigate('/recommendation');
  };

  const handleDelete = async () => {
    if (!window.confirm('이 날짜의 데이터를 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteEntry(selectedDate);
      alert('삭제되었습니다!');
      setIsEditMode(false);
    } catch (error) {
      alert('삭제에 실패했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return `${months[date.getMonth()]} ${date.getDate()}일 ${days[date.getDay()]}`;
  };

  const handleClose = () => {
    // 추천 페이지에서 온 경우 홈으로, 다른 곳에서 온 경우 뒤로
    if (window.location.pathname.includes('/calendar/edit')) {
      navigate('/calendar');
    } else {
      navigate(-1);
    }
  };

  // 로딩 상태 플래그 (데이터 조회 시에만 전역 오버레이)
  const showGlobalLoading = loading && !isEditMode;
  
  // 로그인하지 않은 사용자에게 표시할 메시지
  if (!isAuthenticated) {
    return (
      <div className="calendar-container">
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
        <div className="calendar-popup">
          <div className="auth-required-container">
            <h3>캘린더를 사용하려면 로그인이 필요합니다</h3>
            <p>로그인 후 나만의 기분 캘린더를 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="calendar-container">
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
      
      {showGlobalLoading && (
        <div className="calendar-popup">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>캘린더 데이터를 불러오는 중...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="calendar-popup">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={goToCurrentMonth} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      )}
      {!showGlobalLoading && !error && (
        <>
          {!isEditMode ? (
            // 기본 캘린더 뷰
            <div className="calendar-popup">
              <div className="calendar-header">
                <button className="close-btn" onClick={handleClose} aria-label="캘린더 닫기">×</button>
                <div className="calendar-navigation">
                  <button className="nav-btn" onClick={goToPreviousMonth}>‹</button>
                  <h2>{`${displayMonth + 1}월 ${displayYear}`}</h2>
                  <button className="nav-btn" onClick={goToNextMonth}>›</button>
                </div>
              </div>
              <div className="calendar-grid">
                <div className="calendar-weekdays">
                  <span>일</span>
                  <span>월</span>
                  <span>화</span>
                  <span>수</span>
                  <span>목</span>
                  <span>금</span>
                  <span>토</span>
                </div>
                <div className="calendar-days">
                  {calendarDays.map((day, index) => {
                    const hasEntry = daysWithEntries.includes(day);
                    const hasMood = daysWithMood.includes(day);
                    const entry = hasEntry ? monthData.find(e => e.day === day) : null;
                    
                    return (
                      <div
                        key={index}
                        className={`calendar-day ${day ? 'has-content' : 'empty'} ${hasMood ? 'has-mood' : ''}`}
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
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // 편집 모드 캘린더 뷰
            <div className="calendar-edit-popup">
              {/* 편집 모드에서 저장/삭제 중일 때만 로딩 오버레이 */}
              {isLoading && (
                <div className="loading-container" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                  borderRadius: '12px'
                }}>
                  <div className="loading-spinner"></div>
                  <p>저장 중...</p>
                </div>
              )}
              <div className="calendar-edit-header">
                <button className="back-btn" onClick={handleBackToRecommendations}>← 추천 페이지로</button>
              </div>
              <div className="calendar-edit-content">
                {/* 왼쪽 패널 - 나만의 캘린더 */}
                <div className="calendar-left-panel">
                  <h3>나만의 캘린더</h3>
                  <div className="recommended-movies">
                    <h4>추천 영화</h4>
                    {(() => {
                      // 선택된 영화가 있으면 우선 표시
                      if (selectedMovie) {
                        return (
                          <div className="calendar-movie-recommendation selected-movie">
                            <div className="movie-poster-container">
                              <img 
                                src={selectedMovie.posterUrl} 
                                alt={selectedMovie.title}
                                className="movie-poster"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150x225/666/fff?text=포스터+없음';
                                }}
                              />
                            </div>
                            <div className="movie-description">
                              <h5>{selectedMovie.title}</h5>
                              <p>{selectedMovie.genre} • {selectedMovie.releaseDate ? new Date(selectedMovie.releaseDate).getFullYear() : 'N/A'}</p>
                              <p>평점: {selectedMovie.voteAverage ? selectedMovie.voteAverage.toFixed(1) : 'N/A'}</p>
                            </div>
                          </div>
                        );
                      }

                      const existingEntry = getEntryForDate(selectedDate);
                      const recommendations = existingEntry?.recommendations || [];
                      const savedMovie = existingEntry?.movieInfo;
                      
                      // 저장된 영화가 있으면 우선 표시
                      if (savedMovie) {
                        return (
                          <div className="calendar-movie-recommendation saved-movie">
                            <div className="movie-poster-container">
                              <img 
                                src={savedMovie.posterUrl} 
                                alt={savedMovie.title}
                                className="movie-poster"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150x225/666/fff?text=포스터+없음';
                                }}
                              />
                            </div>
                            <div className="movie-description">
                              <h5>{savedMovie.title}</h5>
                              <p>{savedMovie.genre} • {savedMovie.releaseDate ? new Date(savedMovie.releaseDate).getFullYear() : 'N/A'}</p>
                              <p>평점: {savedMovie.voteAverage ? savedMovie.voteAverage.toFixed(1) : 'N/A'}</p>
                              <div className="movie-status">
                                <span className="saved-badge">✅ 저장됨</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      if (recommendations.length > 0) {
                        return recommendations.map((rec, index) => (
                          <div key={index} className="calendar-movie-recommendation">
                            <div className="movie-poster-placeholder">
                              <span>영화 포스터</span>
                            </div>
                            <div className="movie-description">
                              <h5>{rec.movieTitle}</h5>
                              <p>유사도: {(rec.similarityScore * 100).toFixed(1)}%</p>
                              <p>입력: {rec.userInputText}</p>
                            </div>
                          </div>
                        ));
                      } else {
                        return (
                          <>
                            <div className="movie-poster-placeholder">
                              <span>영화 포스터</span>
                            </div>
                            <div className="movie-description">
                              <p>기분을 선택하고 저장하면</p>
                              <p>추천 영화가 표시됩니다.</p>
                            </div>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* 중앙 패널 - 날짜 선택 */}
                <div className="calendar-center-panel">
                  <h3>날짜를 선택해주세요.</h3>
                  <div className="calendar-month-navigation">
                    <button className="nav-btn" onClick={goToPreviousMonth}>‹</button>
                    <p>{displayYear}년 {displayMonth + 1}월</p>
                    <button className="nav-btn" onClick={goToNextMonth}>›</button>
                  </div>
                  <div className="calendar-grid">
                    <div className="calendar-weekdays">
                      <span>일</span>
                      <span>월</span>
                      <span>화</span>
                      <span>수</span>
                      <span>목</span>
                      <span>금</span>
                      <span>토</span>
                    </div>
                    <div className="calendar-days">
                      {calendarDays.map((day, index) => {
                        const hasEntry = daysWithEntries.includes(day);
                        const hasMood = daysWithMood.includes(day);
                        const entry = hasEntry ? monthData.find(e => e.day === day) : null;
                        const isSelected = !!day
                          && selectedDate.getFullYear() === displayYear
                          && selectedDate.getMonth() === displayMonth
                          && day === selectedDate.getDate();
                        
                        return (
                          <div
                            key={index}
                            className={`calendar-day ${day ? 'has-content' : 'empty'} ${isSelected ? 'selected' : ''} ${hasMood ? 'has-mood' : ''}`}
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
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 오른쪽 패널 - 직접 수정 */}
                <div className="calendar-right-panel">
                  <h3>직접 수정</h3>
                  <p>{formatDate(selectedDate)}</p>
                  
                  <div className="mood-selection">
                    <h4>오늘의 기분</h4>
                    <div className="mood-options">
                      {moods.map((mood, index) => (
                        <button
                          key={index}
                          className={`mood-option ${selectedMood === mood.text ? 'selected' : ''}`}
                          onClick={() => setSelectedMood(mood.text)}
                        >
                          <span className="mood-emoji">{mood.emoji}</span>
                          <span className="mood-text">{mood.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="notes-section">
                    <h4>메모</h4>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="오늘은 너무 서운한 일이 있었다."
                      className="notes-textarea"
                    />
                  </div>

                  {getEntryForDate(selectedDate) && (
                    <div className="button-group">
                      <button className="delete-btn" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <button className="edit-complete-btn" onClick={handleEditComplete}>
                저장
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Calendar;
