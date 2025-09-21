import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaHistory } from 'react-icons/fa';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // 모달이 열릴 때 검색창에 포커스
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 검색어 입력 핸들러
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  // 검색 실행 핸들러
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    // 검색 기록에 추가
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    try {
      // TODO: 백엔드 API 연동
      console.log('검색어:', query);
      
      // 임시로 1초 대기 (실제 API 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 기록 클릭 핸들러
  const handleHistoryClick = (historyItem) => {
    setSearchQuery(historyItem);
    handleSearch(historyItem);
  };

  // 검색 기록 삭제 핸들러
  const handleDeleteHistory = (index) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // 검색 기록 전체 삭제
  const handleClearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Enter 키로 검색 실행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색 기록 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('검색 기록 로드 실패:', error);
      }
    }
  }, []);

  // 모달 외부 클릭으로 닫기
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="search-modal-backdrop" 
      ref={modalRef}
      onClick={handleBackdropClick}
    >
      <div className="search-modal">
        <div className="search-modal-header">
          <h2 className="search-modal-title">영화 검색</h2>
          <button 
            className="search-modal-close"
            onClick={onClose}
            aria-label="검색창 닫기"
          >
            <FaTimes />
          </button>
        </div>

        <div className="search-modal-content">
          {/* 검색 입력 영역 */}
          <div className="search-input-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-input-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="영화 제목, 배우, 감독을 검색하세요..."
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
              />
              {isSearching && (
                <div className="search-loading">
                  <div className="search-spinner"></div>
                </div>
              )}
            </div>
            <button 
              className="search-button"
              onClick={() => handleSearch()}
              disabled={!searchQuery.trim() || isSearching}
            >
              검색
            </button>
          </div>

          {/* 검색 결과 영역 (현재는 빈 상태) */}
          {searchQuery && (
            <div className="search-results">
              <div className="search-results-placeholder">
                <p>검색 결과가 여기에 표시됩니다.</p>
                <p className="search-placeholder-note">
                  백엔드 API 연동 후 실제 검색 결과가 표시됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 검색 기록 영역 */}
          {!searchQuery && searchHistory.length > 0 && (
            <div className="search-history">
              <div className="search-history-header">
                <h3 className="search-history-title">
                  <FaHistory className="search-history-icon" />
                  최근 검색어
                </h3>
                <button 
                  className="search-history-clear"
                  onClick={handleClearAllHistory}
                >
                  전체 삭제
                </button>
              </div>
              <div className="search-history-list">
                {searchHistory.map((item, index) => (
                  <div key={index} className="search-history-item">
                    <button 
                      className="search-history-text"
                      onClick={() => handleHistoryClick(item)}
                    >
                      {item}
                    </button>
                    <button 
                      className="search-history-delete"
                      onClick={() => handleDeleteHistory(index)}
                      aria-label={`${item} 검색 기록 삭제`}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 검색어가 없고 검색 기록도 없을 때 */}
          {!searchQuery && searchHistory.length === 0 && (
            <div className="search-empty">
              <FaSearch className="search-empty-icon" />
              <p className="search-empty-text">영화를 검색해보세요</p>
              <p className="search-empty-subtext">
                제목, 배우, 감독으로 검색할 수 있습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
