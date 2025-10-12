import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaTimes, FaHistory } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { searchMovies } from '../services/movieService';
import UserAuthSection from './UserAuthSection';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose, onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // 인증 관련 상태
  const { user, isAuthenticated, error: authError, login, loginWithKakaoCode, logout, clearError } = useAuth();

  // 로그인 핸들러 (카카오 액세스 토큰)
  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError();
      await login(kakaoAccessToken);
      console.log('SearchModal: 로그인 성공');
    } catch (err) {
      console.error('SearchModal: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
      console.log('SearchModal: 카카오 코드 로그인 성공');
    } catch (err) {
      console.error('SearchModal: 카카오 코드 로그인 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  // 페이지 로드 시 검색창에 포커스
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // ESC 키로 페이지 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 디바운싱된 검색 함수
  const debouncedSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setSearchResults([]);
      setIsLoadingSuggestions(false);
      if (onSearchResults) {
        onSearchResults([]);
      }
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      const suggestions = await searchMovies(query, 0, 10);
      const suggestionResults = suggestions.content || [];
      
      // 연관 검색어가 있으면 제안 표시, 없으면 아무것도 표시하지 않음
      if (suggestionResults.length > 0) {
        setSearchSuggestions(suggestionResults);
        setShowSuggestions(true);
        // 검색 제안이 표시될 때는 기존 검색 결과를 숨김
        setSearchResults([]);
        if (onSearchResults) {
          onSearchResults([]);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        // 연관 검색어가 없을 때는 검색 결과를 초기화하지 않음
      }
    } catch (error) {
      console.error('검색 제안 로드 실패:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [onSearchResults]);

  // 검색어 입력 핸들러 (디바운싱 적용)
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsTyping(true);
    
    // 기존 타이머 클리어
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 500ms 후에 검색 실행
    debounceTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      debouncedSearch(value);
    }, 500);
  };

  // 검색 실행 핸들러 (백엔드 API 연동)
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    
    // 검색 기록에 추가
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    try {
      console.log('검색어:', query);
      
      // 백엔드 API 호출
      const response = await searchMovies(query, 0, 20);
      const results = response.content || [];
      
      // 검색 결과가 실제로 없는 경우에만 빈 배열로 설정
      if (results.length === 0) {
        setSearchResults([]);
        if (onSearchResults) {
          onSearchResults([]);
        }
      } else {
        setSearchResults(results);
        if (onSearchResults) {
          onSearchResults(results);
        }
      }
      
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 제안 클릭 핸들러
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    handleSearch(suggestion.title);
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
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);


  if (!isOpen) return null;

  return (
    <div className="netflix-search-overlay">
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
      
      {/* 넷플릭스 스타일 검색 헤더 */}
      <div className="netflix-search-header">
        <div className="netflix-search-container">
          <div className="netflix-search-input-wrapper">
            <FaSearch className="netflix-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="netflix-search-input"
              placeholder="제목"
              aria-label="영화 제목 검색"
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
            />
            {searchQuery && (
              <button 
                className="netflix-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                  setIsTyping(false);
                  if (onSearchResults) {
                    onSearchResults([]);
                  }
                }}
                aria-label="검색어 지우기"
              >
                <FaTimes />
              </button>
            )}
            {isSearching && (
              <div className="netflix-search-loading">
                <div className="netflix-search-spinner"></div>
              </div>
            )}
            
            {/* 검색 제안 드롭다운 */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="netflix-search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <div 
                    key={suggestion.id || index}
                    className="netflix-search-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <FaSearch className="netflix-search-suggestion-icon" />
                    <span className="netflix-search-suggestion-text">{suggestion.title}</span>
                    {suggestion.releaseDate && (
                      <span className="netflix-search-suggestion-year">
                        ({new Date(suggestion.releaseDate).getFullYear()})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 검색 결과 영역 */}
      <div className="netflix-search-content">
        {searchQuery && searchResults.length > 0 && !isLoadingSuggestions && !isTyping && (
          <div className="netflix-search-results">
            <h2 className="netflix-search-results-title">
              "{searchQuery}"에 대한 검색 결과
            </h2>
            <div className="netflix-movie-grid">
              {searchResults.map((movie) => (
                <div 
                  key={movie.id} 
                  className="netflix-movie-card"
                  onClick={() => {
                    // 영화 상세 페이지로 이동
                    window.location.href = `/movie/${movie.id}`;
                  }}
                >
                  <div className="netflix-movie-poster">
                    {movie.posterUrl ? (
                      <img 
                        src={movie.posterUrl} 
                        alt={movie.title}
                        className="netflix-movie-poster-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="netflix-poster-placeholder" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                      <span className="netflix-poster-text">{movie.title}</span>
                    </div>
                  </div>
                  <h3 className="netflix-movie-title">{movie.title}</h3>
                  <p className="netflix-movie-genre">{movie.genre}</p>
                  {movie.releaseDate && (
                    <p className="netflix-movie-year">{new Date(movie.releaseDate).getFullYear()}</p>
                  )}
                  {movie.voteAverage && (
                    <p className="netflix-movie-rating">⭐ {movie.voteAverage.toFixed(1)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !isSearching && !showSuggestions && !isLoadingSuggestions && !isTyping && (
          <div className="netflix-no-results">
            <FaSearch className="netflix-no-results-icon" />
            <h2 className="netflix-no-results-title">
              "{searchQuery}"에 대한 결과를 찾을 수 없습니다
            </h2>
            <p className="netflix-no-results-text">
              다른 검색어를 시도해보세요
            </p>
          </div>
        )}

        {/* 검색 기록 영역 */}
        {!searchQuery && searchHistory.length > 0 && !isLoadingSuggestions && !isTyping && (
          <div className="netflix-search-history">
            <div className="netflix-search-history-header">
              <h3 className="netflix-search-history-title">
                <FaHistory className="netflix-search-history-icon" />
                최근 검색어
              </h3>
              <button 
                className="netflix-search-history-clear"
                onClick={handleClearAllHistory}
              >
                전체 삭제
              </button>
            </div>
            <div className="netflix-search-history-list">
              {searchHistory.map((item, index) => (
                <div key={index} className="netflix-search-history-item">
                  <button 
                    className="netflix-search-history-text"
                    onClick={() => handleHistoryClick(item)}
                  >
                    {item}
                  </button>
                  <button 
                    className="netflix-search-history-delete"
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
        {!searchQuery && searchHistory.length === 0 && !isLoadingSuggestions && !isTyping && (
          <div className="netflix-search-empty">
            <FaSearch className="netflix-search-empty-icon" />
            <h2 className="netflix-search-empty-title">영화를 검색해보세요</h2>
            <p className="netflix-search-empty-text">
              제목으로 검색할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
