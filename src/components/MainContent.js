import React, { useState, useEffect, useCallback } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const moviesPerPage = 12; // 한 번에 보여줄 영화 수

  // 예고편 보기 버튼 클릭 핸들러
  const handleTrailerClick = async () => {
    if (!featuredMovie) return;
    
    try {
      const trailerData = await getMovieTrailer(featuredMovie.id);
      if (trailerData.trailerUrl) {
        window.open(trailerData.trailerUrl, '_blank');
      } else {
        // 예고편이 없을 경우 기본 URL 사용
        window.open(featuredMovie.trailerUrl || '#', '_blank');
      }
    } catch (err) {
      console.error('예고편 로딩 실패:', err);
      // 에러 시 기본 URL 사용
      window.open(featuredMovie.trailerUrl || '#', '_blank');
    }
  };

  // 영화 카드 클릭 핸들러
  const handleMovieClick = (movie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    }
  };

  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 스크롤이 하단에 가까워지면 더 많은 영화 로드
    if (scrollTop + windowHeight >= documentHeight - 100) {
      loadMoreMovies();
    }
  }, [loading, hasMore]);

  // 더 많은 영화 로드
  const loadMoreMovies = () => {
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const newMovies = newReleases.slice(startIndex, endIndex);

    if (newMovies.length > 0) {
      setDisplayedMovies(prev => [...prev, ...newMovies]);
      setCurrentPage(prev => prev + 1);
    } else {
      setHasMore(false);
    }
  };

  // 초기 영화 로드 및 스크롤 이벤트 리스너
  useEffect(() => {
    if (newReleases.length > 0) {
      const initialMovies = newReleases.slice(0, moviesPerPage);
      setDisplayedMovies(initialMovies);
      setCurrentPage(2);
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
                <span className="title-part-1">{featuredMovie.title.split(' ')[0]}</span>
                <span className="title-part-2">{featuredMovie.title.split(' ')[1]}</span>
              </h1>
              <p className="featured-subtitle">{featuredMovie.subtitle}</p>
              {featuredMovie.description && (
                <p className="featured-description">{featuredMovie.description}</p>
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
              className="movie-card"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="movie-poster">
                {movie.posterUrl ? (
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="movie-poster-image"
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
              <h3 className="movie-title">{movie.title}</h3>
              {movie.rating && (
                <div className="movie-rating">
                  <span className="rating-star">★</span>
                  <span className="rating-score">{movie.rating}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 로딩 인디케이터 */}
        {loading && hasMore && (
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
