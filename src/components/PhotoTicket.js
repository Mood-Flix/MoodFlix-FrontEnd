import React, { useState } from 'react';
import './PhotoTicket.css';

const PhotoTicket = ({ entry, date, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  // 공유 URL 생성
  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    
    // 백엔드에서 받은 UUID 사용
    const uuid = entry.id;
    console.log('공유 URL 생성:', { uuid, entry });
    
    if (!uuid) {
      alert('공유할 수 있는 ID가 없습니다.');
      return;
    }
    
    const url = `${baseUrl}/share/${uuid}`;
    setShareUrl(url);
    setIsShareModalOpen(true);
    
    // 백엔드 API 상태 확인을 위한 테스트
    console.log('생성된 공유 URL:', url);
    console.log('백엔드 API 테스트 필요: GET', `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/calendar/share/${uuid}`);
  };

  // URL 복사 기능
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      // fallback: 텍스트 선택 방식
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // 공유 모달 닫기
  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setIsCopied(false);
  };


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


        {/* 공유 버튼 */}
        <button className="photo-ticket-share" onClick={generateShareUrl} aria-label="공유하기">
          📤
        </button>

        {/* 닫기 버튼 */}
        <button className="photo-ticket-close" onClick={onClose} aria-label="닫기">
          ×
        </button>
      </div>

      {/* 공유 모달 */}
      {isShareModalOpen && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>공유하기</h3>
              <button className="share-modal-close" onClick={closeShareModal}>×</button>
            </div>
            <div className="share-modal-content">
              <p>이 포토티켓을 공유할 수 있는 링크입니다:</p>
              <div className="share-url-container">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="share-url-input"
                />
                <button 
                  className={`copy-btn ${isCopied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {isCopied ? '복사됨!' : '복사'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoTicket;
