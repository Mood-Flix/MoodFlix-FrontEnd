import React, { useState } from 'react';
import './PhotoTicket.css';
import { formatDate, getMoodText } from '../utils/dateUtils';

const PhotoTicket = ({ entry, date, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!entry) return null;


  // 영화 데이터가 있는지 확인
  const hasMovie = entry.selectedMovie && entry.selectedMovie.title;
  const movieData = hasMovie ? entry.selectedMovie : null;

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
      // Clipboard API 미지원 브라우저: 수동 복사 안내
      // URL 입력 필드를 선택하여 사용자가 수동으로 복사할 수 있도록 함
      const urlInput = document.querySelector('.share-url-input');
      if (urlInput) {
        urlInput.focus();
        urlInput.select();
        // 사용자에게 수동 복사 안내 메시지 표시
        alert('자동 복사가 지원되지 않습니다. URL이 선택되었으니 Ctrl+C (또는 Cmd+C)로 복사해주세요.');
      }
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
              {hasMovie ? (
                <img 
                  src={movieData.posterUrl} 
                  alt={movieData.title}
                  className="photo-ticket-poster"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450/333/fff?text=포스터+없음';
                  }}
                />
              ) : (
                <div className="photo-ticket-poster-placeholder">
                  <span>영화 포스터</span>
                </div>
              )}
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
