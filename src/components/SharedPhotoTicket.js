import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedCalendarEntry } from '../services/calendarService';
import './PhotoTicket.css';

const SharedPhotoTicket = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSharedEntry = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('공유된 데이터 로딩 시작:', { uuid });
        
        const data = await getSharedCalendarEntry(uuid);
        console.log('공유된 데이터 로딩 성공:', data);
        setEntry(data);
      } catch (err) {
        console.error('공유된 데이터 로딩 실패:', err);
        console.error('에러 상세:', {
          message: err.message,
          stack: err.stack,
          uuid: uuid
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      loadSharedEntry();
    } else {
      console.error('UUID가 없습니다');
      setError('UUID가 제공되지 않았습니다.');
      setLoading(false);
    }
  }, [uuid]);

  const formatDate = (date) => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return `${months[date.getMonth()]} ${date.getDate()}일 ${days[date.getDay()]}`;
  };

  const getMoodText = (mood) => {
    const moodMap = {
      '😐': '그냥저냥',
      '😠': '화나요',
      '😊': '좋아요',
      '😢': '슬퍼요',
      '🤩': '신나요'
    };
    return moodMap[mood] || mood;
  };

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="photo-ticket-overlay">
        <div className="photo-ticket-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="photo-ticket-overlay">
        <div className="photo-ticket-container">
          <div className="error-container">
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <div className="error-details">
              <p><strong>UUID:</strong> {uuid}</p>
              <p><strong>API URL:</strong> {process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/calendar/share/{uuid}</p>
              <p><strong>오류 유형:</strong> 500 내부 서버 오류</p>
              <p><strong>해결 방법:</strong> 백엔드 개발자에게 서버 로그 확인 요청</p>
            </div>
            <div className="error-actions">
              <button className="retry-btn" onClick={() => window.location.reload()}>
                다시 시도
              </button>
              <button className="retry-btn" onClick={handleClose}>
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="photo-ticket-overlay">
        <div className="photo-ticket-container">
          <div className="error-container">
            <h3>공유된 페이지를 찾을 수 없습니다</h3>
            <p>링크가 올바르지 않거나 만료되었을 수 있습니다.</p>
            <button className="retry-btn" onClick={handleClose}>
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 더미 데이터 (백엔드 API 연동 전까지 사용)
  const dummyMovieData = {
    title: '끝까지 간다',
    originalTitle: 'A Hard Day',
    releaseDate: '2014.05.29',
    posterUrl: 'https://image.tmdb.org/t/p/w500/example-poster.jpg',
    genre: '액션, 스릴러',
    director: '김성훈',
    rating: 7.2
  };

  // 실제 영화 데이터가 있으면 사용, 없으면 더미 데이터 사용
  const movieData = entry.selectedMovie && entry.selectedMovie.title ? entry.selectedMovie : dummyMovieData;
  const entryDate = new Date(entry.date);

  return (
    <div className="photo-ticket-overlay" onClick={handleClose}>
      <div className="photo-ticket-container" onClick={(e) => e.stopPropagation()}>
        {/* 포토티켓 메인 영역 */}
        <div className="photo-ticket-main">
          {/* 영화 포스터 영역 */}
          <div className="poster-section">
            <div className="poster-container">
              <img 
                src={movieData.posterUrl} 
                alt={movieData.title}
                className="photo-ticket-poster"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x450/333/fff?text=포스터+없음';
                }}
              />
            </div>
          </div>

          {/* 하단 정보 영역 */}
          <div className="ticket-info-section">
            {/* 메모 정보 */}
            {entry.notes && (
              <div className="memo-info">
                <div className="memo-text">
                  {entry.notes}
                </div>
              </div>
            )}

            <div className="ticket-footer">
              <div className="date-info">{formatDate(entryDate)}</div>
              <div className="mood-info">
                <span className="mood-emoji">{entry.mood}</span>
              </div>
              <div className="moodflix-brand">MoodFlix</div>
            </div>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button className="photo-ticket-close" onClick={handleClose} aria-label="닫기">
          ×
        </button>
      </div>
    </div>
  );
};

export default SharedPhotoTicket;
