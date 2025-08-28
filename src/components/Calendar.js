import React, { useState, useEffect } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import './Calendar.css';

const Calendar = ({ onBack }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
  } = useCalendar();

  const moods = [
    { emoji: '😐', text: '그냥저냥' },
    { emoji: '😠', text: '화나요' },
    { emoji: '😊', text: '좋아요' },
    { emoji: '😢', text: '슬퍼요' },
    { emoji: '🤩', text: '신나요' }
  ];

  const currentDate = new Date();
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

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = new Date(displayYear, displayMonth, day);
      setSelectedDate(clickedDate);
      
      // 기존 데이터가 있는지 확인
      const existingEntry = getEntryForDate(clickedDate);
      if (existingEntry) {
        setSelectedMood(existingEntry.mood);
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
      await saveEntry(selectedDate, selectedMood, notes);
      alert('저장되었습니다!');
      setIsEditMode(false);
    } catch (error) {
      alert('저장에 실패했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComplete = () => {
    setIsEditMode(false);
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

  // 로딩 상태
  if (loading) {
    return (
      <div className="calendar-container">
        <div className="calendar-popup">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>캘린더 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="calendar-container">
        <div className="calendar-popup">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={goToCurrentMonth} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {!isEditMode ? (
        // 기본 캘린더 뷰
        <div className="calendar-popup">
          <div className="calendar-header">
            <button className="close-btn" onClick={onBack}>×</button>
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
                const entry = hasEntry ? monthData.find(e => e.day === day) : null;
                
                return (
                  <div
                    key={index}
                    className={`calendar-day ${day ? 'has-content' : 'empty'} ${hasEntry ? 'has-mood' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day && (
                      <>
                        <span className="day-number">{day}</span>
                        {hasEntry && (
                          <span className="mood-indicator">
                            {moods.find(m => m.text === entry.mood)?.emoji || '😊'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <button className="edit-calendar-btn" onClick={() => setIsEditMode(true)}>
            캘린더 수정
          </button>
        </div>
      ) : (
                 // 편집 모드 캘린더 뷰
         <div className="calendar-edit-popup">
           <div className="calendar-edit-header">
             <button className="back-btn" onClick={() => setIsEditMode(false)}>← 뒤로가기</button>
             <button className="close-btn" onClick={onBack}>×</button>
           </div>
          <div className="calendar-edit-content">
            {/* 왼쪽 패널 - 나만의 캘린더 */}
            <div className="calendar-left-panel">
              <h3>나만의 캘린더</h3>
              <div className="profile-section">
                <div className="profile-placeholder">프로필</div>
              </div>
                             <div className="recommended-movies">
                 <h4>추천 영화</h4>
                 <div className="movie-poster-placeholder">
                   <span>영화 포스터</span>
                 </div>
                 <div className="movie-description">
                   <p>영화 줄거리가 여기에 표시됩니다.</p>
                   <p>백엔드 연동 후 실제 영화 정보가 표시될 예정입니다.</p>
                 </div>
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
                    const isSelected = day === selectedDate.getDate();
                    
                    return (
                      <div
                        key={index}
                        className={`calendar-day ${day ? 'has-content' : 'empty'} ${isSelected ? 'selected' : ''} ${hasEntry ? 'has-entry' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        {day && <span className="day-number">{day}</span>}
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

              <div className="button-group">
                <button className="save-btn" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? '저장 중...' : '저장'}
                </button>
                {getEntryForDate(selectedDate) && (
                  <button className="delete-btn" onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? '삭제 중...' : '삭제'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <button className="edit-complete-btn" onClick={handleEditComplete}>
            수정 완료
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
