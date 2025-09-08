import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMovies } from '../hooks/useMovies';
import './MainContent.css';

const MainContent = ({ onMovieClick }) => {
  const { 
    featuredMovie, 
    newReleases, 
    loading, 
    error, 
    refreshMovies 
  } = useMovies();

  // 캐러셀을 위한 상태
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [carouselMovies, setCarouselMovies] = useState([]);

  // 무한 스크롤을 위한 상태
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const moviesPerPage = 12; // 한 번에 보여줄 영화 수
  const isLoadingMoreRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);


  // 캐러셀 관련 함수들
  const nextCarouselSlide = useCallback(() => {
    setCurrentCarouselIndex(prev => 
      prev === carouselMovies.length - 1 ? 0 : prev + 1
    );
  }, [carouselMovies.length]);

  const prevCarouselSlide = useCallback(() => {
    setCurrentCarouselIndex(prev => 
      prev === 0 ? carouselMovies.length - 1 : prev - 1
    );
  }, [carouselMovies.length]);

  // 영화 카드 클릭 핸들러
  const handleMovieClick = (movie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    }
  };

  const handleMovieKeyDown = useCallback((e, movie) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMovieClick(movie);
    }
  }, []);

  // 더 많은 영화 로드
  const loadMoreMovies = useCallback(() => {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    setDisplayedMovies(prev => {
      const startIndex = prev.length;
      const endIndex = startIndex + moviesPerPage;
      const newMovies = newReleases.slice(startIndex, endIndex);
      if (newMovies.length === 0) {
        setHasMore(false);
        isLoadingMoreRef.current = false;
        setLoadingMore(false);
        return prev;
      }
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
      return [...prev, ...newMovies];
    });
  }, [newReleases, moviesPerPage]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 스크롤이 하단에 가까워지면 더 많은 영화 로드
    if (scrollTop + windowHeight >= documentHeight - 100) {
      loadMoreMovies();
    }
  }, [loading, loadingMore, hasMore, loadMoreMovies]);

  // 캐러셀 데이터 초기화
  useEffect(() => {
    if (newReleases.length > 0) {
      // 캐러셀용으로 처음 5개 영화 선택
      const carouselData = newReleases.slice(0, 5);
      setCarouselMovies(carouselData);
    }
  }, [newReleases]);

  // 초기 영화 로드 및 스크롤 이벤트 리스너
  useEffect(() => {
    if (newReleases.length > 0) {
      const initialMovies = newReleases.slice(0, moviesPerPage);
      setDisplayedMovies(initialMovies);
      setHasMore(newReleases.length > moviesPerPage);
    }
  }, [newReleases]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 자동 슬라이드 기능
  useEffect(() => {
    if (carouselMovies.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentCarouselIndex(prev => 
        prev === carouselMovies.length - 1 ? 0 : prev + 1
      );
    }, 5000); // 5초마다 자동 슬라이드

    return () => clearInterval(interval);
  }, [carouselMovies.length]);

  // 로딩 상태
  if (loading) {
    return (
      <main className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>영화 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <main className="main-content">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={refreshMovies} className="retry-button">
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      {/* Carousel Section */}
      {carouselMovies.length > 0 && (
        <section className="carousel-section">
          <div className="carousel-container">
            <div className="carousel-slides-wrapper">
              {carouselMovies.map((movie, index) => (
                <div 
                  key={movie.id}
                  className={`carousel-slide ${index === currentCarouselIndex ? 'active' : ''}`}
                  style={{
                    transform: `translateX(${(index - currentCarouselIndex) * 100}%)`,
                    opacity: index === currentCarouselIndex ? 1 : 0
                  }}
                >
                  <div className="carousel-content">
                    <div className="carousel-poster">
                      {movie.posterUrl ? (
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title}
                          className="carousel-poster-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="carousel-poster-placeholder" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                        <span className="carousel-poster-text">{movie.title}</span>
                      </div>
                    </div>
                    <div className="carousel-text">
                      <h1 className="carousel-title">
                        {(() => {
                          const t = movie.title || '';
                          const i = t.indexOf(' ');
                          const first = i !== -1 ? t.slice(0, i) : t;
                          const rest = i !== -1 ? t.slice(i + 1) : '';
                          return (
                            <>
                              <span className="title-part-1">{first}</span>
                              {rest && <span className="title-part-2">{rest}</span>}
                            </>
                          );
                        })()}
                      </h1>
                      <p className="carousel-subtitle">{movie.genre}</p>
                      {movie.releaseDate && (
                        <p className="carousel-description">개봉일: {movie.releaseDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 캐러셀 네비게이션 */}
            <button 
              className="carousel-nav carousel-prev" 
              onClick={prevCarouselSlide}
              aria-label="이전 영화"
            >
              ‹
            </button>
            <button 
              className="carousel-nav carousel-next" 
              onClick={nextCarouselSlide}
              aria-label="다음 영화"
            >
              ›
            </button>
            
            {/* 캐러셀 인디케이터 */}
            <div className="carousel-indicators">
              {carouselMovies.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === currentCarouselIndex ? 'active' : ''}`}
                  onClick={() => setCurrentCarouselIndex(index)}
                  aria-label={`${index + 1}번째 영화로 이동`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Releases Section */}
      <section className="new-releases-section">
        <h2 className="section-title">영화</h2>
        <div className="movie-grid">
          {displayedMovies.map((movie) => (
            <div 
              key={movie.id} 
              className="main-movie-card"
              role="button"
              tabIndex={0}
              aria-label={`${movie.title} 상세 보기`}
              onClick={() => handleMovieClick(movie)}
              onKeyDown={(e) => handleMovieKeyDown(e, movie)}
            >
              <div className="main-movie-poster">
                {movie.posterUrl ? (
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="main-movie-poster-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="poster-placeholder" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                  <span className="poster-text">{movie.title}</span>
                </div>
              </div>
              <h3 className="main-movie-title">{movie.title}</h3>
            </div>
          ))}
        </div>
        
        {/* 로딩 인디케이터 */}
        {loadingMore && hasMore && (
          <div className="loading-more">
            <div className="loading-spinner-small"></div>
            <p>더 많은 영화를 불러오는 중...</p>
          </div>
        )}
        
        {/* 더 이상 영화가 없을 때 */}
        {!hasMore && displayedMovies.length > 0 && (
          <div className="no-more-movies">
            <p>모든 영화를 불러왔습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default MainContent;
