import React from 'react';
import './CalendarPreview.css';

const CalendarPreview = ({ entry, date, onClose, onEdit }) => {
  if (!entry) return null;

  // 디버깅을 위한 로그 추가
  console.log('CalendarPreview: 받은 데이터 확인', {
    entry,
    selectedMovie: entry.selectedMovie,
    hasMovie: !!entry.selectedMovie
  });

  const handleShare = async () => {
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

    const shareText = `📅 ${formatDate(date)}
${entry.mood} ${getMoodText(entry.mood)}
${entry.notes ? `💭 ${entry.notes}` : ''}
${entry.selectedMovie ? `🎬 ${entry.selectedMovie.title}` : ''}

#MoodFlix #기분캘린더`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${formatDate(date)} - MoodFlix`,
          text: shareText,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('공유 실패:', error);
          fallbackShare(shareText);
        }
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('클립보드에 복사되었습니다!');
      }).catch(() => {
        alert('복사에 실패했습니다.');
      });
    } else {
      // 클립보드 API가 없는 경우 텍스트 영역을 생성하여 복사
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('클립보드에 복사되었습니다!');
      } catch (err) {
        alert('복사에 실패했습니다.');
      }
      document.body.removeChild(textArea);
    }
  };

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

  return (
    <div className="calendar-preview-overlay" onClick={onClose}>
      <div className="calendar-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-preview-header">
          <h3>{formatDate(date)}</h3>
          <button className="close-btn" onClick={onClose} aria-label="닫기">×</button>
        </div>
        
        <div className="calendar-preview-content">
          {/* 기분 정보 */}
          <div className="preview-section">
            <h4>오늘의 기분</h4>
            <div className="mood-display">
              <span className="mood-emoji">{entry.mood}</span>
              <span className="mood-text">{getMoodText(entry.mood)}</span>
            </div>
          </div>

          {/* 메모 정보 */}
          {entry.notes && (
            <div className="preview-section">
              <h4>메모</h4>
              <div className="notes-display">
                <p>{entry.notes}</p>
              </div>
            </div>
          )}

          {/* 영화 정보 */}
          {entry.selectedMovie && entry.selectedMovie.title && (
            <div className="preview-section">
              <h4>오늘의 영화</h4>
              <div className="movie-display">
                <div className="movie-poster-container">
                  <img 
                    src={entry.selectedMovie.posterUrl} 
                    alt={entry.selectedMovie.title}
                    className="movie-poster"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x225/666/fff?text=포스터+없음';
                    }}
                  />
                </div>
                <div className="movie-info">
                  <h5>{entry.selectedMovie.title}</h5>
                  <p className="movie-genre">{entry.selectedMovie.genre}</p>
                  {entry.selectedMovie.releaseDate && (
                    <p className="movie-year">{new Date(entry.selectedMovie.releaseDate).getFullYear()}</p>
                  )}
                  {entry.selectedMovie.voteAverage && (
                    <p className="movie-rating">평점: {entry.selectedMovie.voteAverage.toFixed(1)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="calendar-preview-actions">
          <button className="share-btn" onClick={handleShare}>
            공유하기
          </button>
          <button className="edit-btn" onClick={onEdit}>
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPreview;
