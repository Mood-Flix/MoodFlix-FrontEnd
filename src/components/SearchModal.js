import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaHistory } from 'react-icons/fa';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose, onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

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
      
      // 임시 검색 결과 생성 (실제 API 연동 시 제거)
      const mockResults = generateMockSearchResults(query);
      setSearchResults(mockResults);
      
      // 부모 컴포넌트에 검색 결과 전달
      if (onSearchResults) {
        onSearchResults(mockResults);
      }
      
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 임시 검색 결과 생성 함수 (실제 API 연동 시 제거)
  const generateMockSearchResults = (query) => {
    const mockMovies = [
      { id: 1, title: '미니언즈', genre: '애니메이션', posterUrl: '/emotion-happy.svg', releaseDate: '2015' },
      { id: 2, title: '슈퍼 배드 3', genre: '애니메이션', posterUrl: '/emotion-excited.svg', releaseDate: '2017' },
      { id: 3, title: '미니언즈 & 모어 1', genre: '애니메이션', posterUrl: '/emotion-peaceful.svg', releaseDate: '2019' },
      { id: 4, title: '미니언즈 & 모어 2', genre: '애니메이션', posterUrl: '/emotion-romantic.svg', releaseDate: '2021' },
      { id: 5, title: '슈퍼 배드 2', genre: '애니메이션', posterUrl: '/emotion-sad.svg', releaseDate: '2013' },
      { id: 6, title: '슈퍼 배드', genre: '애니메이션', posterUrl: '/emotion-anxious.svg', releaseDate: '2010' },
      { id: 7, title: '쿵푸팬더', genre: '애니메이션', posterUrl: '/emotion-happy.svg', releaseDate: '2008' },
      { id: 8, title: '몬스터 호텔 3', genre: '애니메이션', posterUrl: '/emotion-excited.svg', releaseDate: '2018' },
      { id: 9, title: '하늘에서 음식이 내린다면 2', genre: '애니메이션', posterUrl: '/emotion-peaceful.svg', releaseDate: '2013' },
      { id: 10, title: '라바 패밀리', genre: '애니메이션', posterUrl: '/emotion-romantic.svg', releaseDate: '2020' },
      { id: 11, title: '괴수 8호', genre: '애니메이션', posterUrl: '/emotion-sad.svg', releaseDate: '2024' },
      { id: 12, title: '케이팝 데몬헌터스', genre: '애니메이션', posterUrl: '/emotion-anxious.svg', releaseDate: '2023' }
    ];

    // 검색어와 관련된 영화 필터링
    return mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.genre.toLowerCase().includes(query.toLowerCase())
    );
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
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
            />
            {searchQuery && (
              <button 
                className="netflix-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
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
          </div>
        </div>
      </div>

      {/* 검색 결과 영역 */}
      <div className="netflix-search-content">
        {searchQuery && searchResults.length > 0 && (
          <div className="netflix-search-results">
            <h2 className="netflix-search-results-title">
              "{searchQuery}"에 대한 검색 결과
            </h2>
            <div className="netflix-movie-grid">
              {searchResults.map((movie) => (
                <div key={movie.id} className="netflix-movie-card">
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

        {searchQuery && searchResults.length === 0 && !isSearching && (
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
