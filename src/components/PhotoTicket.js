import React from 'react';
import './PhotoTicket.css';

const PhotoTicket = ({ entry, date, onClose }) => {
  if (!entry) return null;

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

  // 더미 데이터 (백엔드 API 연동 전까지 사용)
  const dummyMovieData = {
    title: '끝까지 간다',
    originalTitle: 'A Hard Day',
    releaseDate: '2014.05.29',
    posterUrl: 'https://image.tmdb.org/t/p/w500/example-poster.jpg', // 실제 포스터 URL로 교체 예정
    genre: '액션, 스릴러',
    director: '김성훈',
    rating: 7.2
  };

  // 실제 영화 데이터가 있으면 사용, 없으면 더미 데이터 사용
  const movieData = entry.selectedMovie && entry.selectedMovie.title ? entry.selectedMovie : dummyMovieData;


  return (
    <div className="photo-ticket-overlay" onClick={onClose}>
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
              <div className="date-info">{formatDate(date)}</div>
              <div className="mood-info">
                <span className="mood-emoji">{entry.mood}</span>
              </div>
              <div className="moodflix-brand">MoodFlix</div>
            </div>
          </div>
        </div>


        {/* 닫기 버튼 */}
        <button className="photo-ticket-close" onClick={onClose} aria-label="닫기">
          ×
        </button>
      </div>
    </div>
  );
};

export default PhotoTicket;
