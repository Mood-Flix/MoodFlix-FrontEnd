import React, { useState } from 'react';
import { syncMovies } from '../services/movieService';
import './MovieSyncButton.css';

const MovieSyncButton = ({ onSyncComplete, onSyncError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncMovies();
      setLastSyncTime(new Date());
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('영화 동기화 실패:', error);
      if (onSyncError) {
        onSyncError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSyncTime = (date) => {
    if (!date) return '';
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="movie-sync-button">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className={`sync-btn ${isLoading ? 'loading' : ''}`}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            동기화 중...
          </>
        ) : (
          <>
            <span className="sync-icon">🔄</span>
            TMDb 동기화
          </>
        )}
      </button>
      
      {lastSyncTime && (
        <div className="last-sync-info">
          마지막 동기화: {formatLastSyncTime(lastSyncTime)}
        </div>
      )}
      
      <div className="sync-description">
        TMDb에서 최신 인기 영화 정보를 가져옵니다.
        <br />
        <small>(관리자 권한 필요)</small>
      </div>
    </div>
  );
};

export default MovieSyncButton;
