import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaHistory } from 'react-icons/fa';
import { searchMovies, searchMovieSuggestions } from '../services/movieService';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose, onSearchResults, onMovieClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // 검색을 실행했는지 여부
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

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

  // 검색어 입력 핸들러
  const handleSearchInput = (e) => {
    const value = e.target.value;
    console.log('🔤 검색어 입력:', value);
    setSearchQuery(value);
    setSelectedSuggestionIndex(-1);
    
    // 새로운 검색어 입력 시 이전 검색 결과 초기화
    if (searchResults.length > 0) {
      setSearchResults([]);
      if (onSearchResults) {
        onSearchResults([]);
      }
    }
    
    // 검색어가 변경되면 검색 상태 초기화
    if (hasSearched) {
      setHasSearched(false);
    }
    
    // 자동완성 검색어 가져오기 (디바운싱)
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    
    if (value.trim().length > 0) {
      console.log('⏰ 자동완성 타이머 시작:', value);
      
      suggestionTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('🔍 자동완성 API 호출:', value);
          const suggestions = await searchMovieSuggestions(value, 5);
          console.log('💡 자동완성 결과:', suggestions);
          setSuggestions(suggestions);
          setShowSuggestions(true);
          console.log('✅ 자동완성 상태 업데이트:', { suggestions, showSuggestions: true });
        } catch (error) {
          console.error('❌ 자동완성 검색 실패:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300); // 300ms 디바운싱
    } else {
      console.log('🧹 검색어 비어있음 - 자동완성 숨김');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 검색 실행 핸들러
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      console.log('❌ 검색어가 비어있음');
      return;
    }

    console.log('🚀 검색 시작:', { query, searchQuery });

    // 자동완성 숨기기
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    setIsSearching(true);
    setHasSearched(true); // 검색 시작 표시
    
    // 검색 기록에 추가 (최대 7개)
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 7);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    try {
      console.log('🔍 API 호출 시작:', query);
      
      // 실제 API 호출
      const searchResponse = await searchMovies(query, 0, 20);
      console.log('📡 API 응답 원본:', searchResponse);
      
      const results = searchResponse.content || [];
      console.log('🎬 검색 결과 배열:', results);
      console.log('🎬 검색 결과 개수:', results.length);
      
      setSearchResults(results);
      console.log('✅ 검색 결과 상태 업데이트 완료');
      
      // 부모 컴포넌트에 검색 결과 전달
      if (onSearchResults) {
        console.log('📤 부모 컴포넌트에 결과 전달:', results);
        onSearchResults(results);
      }
      
    } catch (error) {
      console.error('❌ 검색 실패:', error);
      console.error('❌ 에러 상세:', error.message);
      setSearchResults([]);
      
      // 에러 시에도 부모 컴포넌트에 빈 결과 전달
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setIsSearching(false);
      console.log('🏁 검색 프로세스 완료');
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

  // 자동완성 검색어 선택 핸들러
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    handleSearch(suggestion);
  };

  // 영화 카드 클릭 핸들러
  const handleMovieCardClick = (movie) => {
    console.log('🎬 영화 카드 클릭:', movie);
    if (onMovieClick) {
      onMovieClick(movie);
    }
  };

  // 영화 카드 키보드 핸들러
  const handleMovieCardKeyDown = (e, movie) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMovieCardClick(movie);
    }
  };

  // 키보드 네비게이션 핸들러
  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    } else if (e.key === 'Enter') {
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
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);


  if (!isOpen) return null;

  return (
    <div className="netflix-search-overlay">
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
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setSelectedSuggestionIndex(-1);
                  setHasSearched(false);
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
            
            {/* 자동완성 드롭다운 */}
            {(() => {
              console.log('🎨 자동완성 렌더링 체크:', { 
                showSuggestions, 
                suggestionsLength: suggestions.length, 
                suggestions 
              });
              return showSuggestions && suggestions.length > 0;
            })() && (
              <div className="netflix-suggestions-dropdown">
                <div className="netflix-suggestions-container">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`netflix-suggestion-item ${
                        index === selectedSuggestionIndex ? 'selected' : ''
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      <FaSearch className="netflix-suggestion-icon" />
                      <span className="netflix-suggestion-text">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 검색 결과 영역 */}
      <div className="netflix-search-content">
        {(() => {
          const shouldShowResults = searchQuery && searchResults.length > 0 && !showSuggestions && !isSearching;
          console.log('🎨 검색 결과 렌더링 체크:', {
            searchQuery,
            searchResultsLength: searchResults.length,
            showSuggestions,
            isSearching,
            shouldShowResults
          });
          return shouldShowResults;
        })() && (
          <div className="netflix-search-results">
            <h2 className="netflix-search-results-title">
              "{searchQuery}"에 대한 검색 결과
            </h2>
            <div className="netflix-movie-grid">
              {searchResults.map((movie) => (
                <div 
                  key={movie.id} 
                  className="netflix-movie-card"
                  role="button"
                  tabIndex={0}
                  aria-label={`${movie.title} 상세 보기`}
                  onClick={() => handleMovieCardClick(movie)}
                  onKeyDown={(e) => handleMovieCardKeyDown(e, movie)}
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
                    <p className="netflix-movie-year">{movie.releaseDate}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && hasSearched && searchResults.length === 0 && !isSearching && !showSuggestions && (
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
        {!searchQuery && searchHistory.length > 0 && (
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
        {!searchQuery && searchHistory.length === 0 && (
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
