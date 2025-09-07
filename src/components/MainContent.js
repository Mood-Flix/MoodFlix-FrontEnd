import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMovies } from '../hooks/useMovies';
import { getMovieTrailer } from '../services/movieService';
import './MainContent.css';

const MainContent = ({ onMovieClick }) => {
  const { 
    featuredMovie, 
    newReleases, 
    loading, 
    error, 
    refreshMovies 
  } = useMovies();

  // 무한 스크롤을 위한 상태
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const moviesPerPage = 12; // 한 번에 보여줄 영화 수
  const isLoadingMoreRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // URL 안전성 검증 함수
  const isSafeHttpUrl = (url) => {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // 예고편 보기 버튼 클릭 핸들러
  const handleTrailerClick = async () => {
    if (!featuredMovie) return;
    
    try {
      const trailerData = await getMovieTrailer(featuredMovie.id);
      const url = trailerData.trailerUrl || featuredMovie.trailerUrl;
      if (url) {
        if (isSafeHttpUrl(url)) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          console.warn('Unsafe trailer URL blocked:', url);
          alert('안전하지 않은 예고편 링크가 감지되어 열지 않았습니다.');
        }
      } else {
        console.warn('예고편 URL 없음');
        // TODO: 토스트/알림 컴포넌트로 안내 메시지 표시
        alert('이 영화의 예고편을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('예고편 로딩 실패:', err);
      const fallback = featuredMovie.trailerUrl;
      if (fallback) {
        if (isSafeHttpUrl(fallback)) {
          window.open(fallback, '_blank', 'noopener,noreferrer');
        } else {
          console.warn('Unsafe fallback URL blocked:', fallback);
        }
      } else {
        alert('예고편을 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

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
      {/* Featured Movie Section */}
      {featuredMovie && (
        <section className="featured-section">
          <div className="featured-content">
            <div className="featured-text">
              <h1 className="featured-title">
                {(() => {
                  const t = featuredMovie.title || '';
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
              <p className="featured-subtitle">{featuredMovie.genre}</p>
              {featuredMovie.releaseDate && (
                <p className="featured-description">개봉일: {featuredMovie.releaseDate}</p>
              )}
              <button 
                className="trailer-button"
                onClick={handleTrailerClick}
              >
                예고편 보기
              </button>
            </div>
          </div>
        </section>
      )}

      {/* New Releases Section */}
      <section className="new-releases-section">
        <h2 className="section-title">이번주 신작</h2>
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
              {movie.voteAverage && (
                <div className="movie-rating">
                  <span className="rating-star">★</span>
                  <span className="rating-score">{movie.voteAverage.toFixed(1)}</span>
                </div>
              )}
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
