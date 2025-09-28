import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../hooks/useAuth';
import KakaoLogin from './KakaoLogin';
import './MainContent.css';

const MainContent = ({ onMovieClick }) => {
  const { 
    newReleases, 
    loading, 
    error, 
    hasMore,
    loadMoreMovies,
    refreshMovies 
  } = useMovies();

  // 인증 관련 상태
  const { user, isAuthenticated, isLoading: authLoading, error: authError, login, loginWithKakaoCode, logout, clearError } = useAuth();

  // 로그인 핸들러 (카카오 액세스 토큰)
  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError();
      await login(kakaoAccessToken);
      console.log('MainContent: 로그인 성공');
    } catch (err) {
      console.error('MainContent: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
      console.log('MainContent: 카카오 코드 로그인 성공');
    } catch (err) {
      console.error('MainContent: 카카오 코드 로그인 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };

  // 캐러셀을 위한 상태
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [carouselMovies, setCarouselMovies] = useState([]);

  // 무한 스크롤을 위한 상태
  const [displayedMovies, setDisplayedMovies] = useState([]);
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
  const handleMovieClick = useCallback((movie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    }
  }, [onMovieClick]);

  const handleMovieKeyDown = useCallback((e, movie) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMovieClick(movie);
    }
  }, [handleMovieClick]);

  // 더 많은 영화 로드 (새로운 API 구조 사용)
  const handleLoadMoreMovies = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore) return;
    
    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      await loadMoreMovies();
    } catch (error) {
      console.error('추가 영화 로딩 실패:', error);
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loadMoreMovies]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 스크롤이 하단에 가까워지면 더 많은 영화 로드
    if (scrollTop + windowHeight >= documentHeight - 100) {
      handleLoadMoreMovies();
    }
  }, [loading, loadingMore, hasMore, handleLoadMoreMovies]);

  // 캐러셀 데이터 초기화
  useEffect(() => {
    if (newReleases.length > 0) {
      // 캐러셀용으로 처음 5개 영화 선택
      const carouselData = newReleases.slice(0, 5);
      setCarouselMovies(carouselData);
      setCurrentCarouselIndex(0);
    }
  }, [newReleases]);

  // 초기 영화 로드 및 스크롤 이벤트 리스너
  useEffect(() => {
    if (newReleases.length > 0) {
      setDisplayedMovies(newReleases);
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
      {/* Compact User Auth Section - 우측 상단 */}
      <div className="compact-auth-section">
        {isAuthenticated ? (
          <div className="compact-user-info">
            <span className="compact-welcome">안녕하세요, {user?.name || '사용자'}님!</span>
            <button className="compact-logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className="compact-login-section">
            <KakaoLogin 
              onLoginSuccess={handleLoginSuccess} 
              onLoginError={handleLoginError}
              onKakaoCodeLogin={handleKakaoCodeLogin}
            />
            {authError && (
              <div className="compact-auth-error">
                <span>{authError}</span>
                <button onClick={clearError}>×</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Carousel Section */}
      <section 
        className="carousel-section"
        role="button"
        tabIndex={0}
        aria-label="추천 영화 캐러셀 - Enter 또는 Space로 현재 영화 상세 보기"
        onClick={() => {
          if (carouselMovies.length > 0) {
            handleMovieClick(carouselMovies[currentCarouselIndex]);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (carouselMovies.length > 0) {
              handleMovieClick(carouselMovies[currentCarouselIndex]);
            }
          }
        }}
      >
        {carouselMovies.length > 0 ? (
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
              onClick={(e) => {
                e.stopPropagation();
                prevCarouselSlide();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  prevCarouselSlide();
                }
              }}
              aria-label="이전 영화"
            >
              ‹
            </button>
            <button 
              className="carousel-nav carousel-next" 
              onClick={(e) => {
                e.stopPropagation();
                nextCarouselSlide();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  nextCarouselSlide();
                }
              }}
              aria-label="다음 영화"
            >
              ›
            </button>
            
          </div>
        ) : null}
        
        {/* 캐러셀 인디케이터 - 섹션 레벨로 이동 */}
        {carouselMovies.length > 1 && (
          <div className="carousel-indicators">
            {carouselMovies.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === currentCarouselIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentCarouselIndex(index);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentCarouselIndex(index);
                  }
                }}
                aria-label={`${index + 1}번째 영화로 이동`}
              />
            ))}
          </div>
        )}
      </section>

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
