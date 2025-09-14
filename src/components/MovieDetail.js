import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlay, FaStar, FaCalendar, FaClock, FaGlobe, FaTag } from 'react-icons/fa';
import { 
  getMovieBasicInfo, 
  getMovieDetails, 
  getMovieVideos, 
  getMoviePhotos,
  getCachedMovieVideos,
  getCachedMoviePhotos,
  preloadMovieData
} from '../services/movieService';
import './MovieDetail.css';

// WebP 지원 확인
const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// 최적화된 이미지 URL 생성
const getOptimizedImageUrl = (originalUrl, width = null, quality = 80) => {
  if (!originalUrl) return originalUrl;
  
  // WebP 지원 확인
  const useWebP = supportsWebP();
  
  // 이미지 최적화 파라미터 추가
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  params.append('q', quality);
  if (useWebP) params.append('f', 'webp');
  
  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}${params.toString()}`;
};

// 지연 로딩 이미지 컴포넌트 (React.memo로 최적화)
const LazyImage = React.memo(({ src, alt, className, onError, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');

  // 이미지 URL 최적화
  useEffect(() => {
    if (src) {
      setOptimizedSrc(getOptimizedImageUrl(src));
    }
  }, [src]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback((e) => {
    setError(true);
    if (onError) onError(e);
  }, [onError]);

  return (
    <div className={`lazy-image-container ${className}`} {...props}>
      {!loaded && !error && (
        <div className="image-placeholder">
          <div className="placeholder-spinner"></div>
        </div>
      )}
      {!error && optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`lazy-image ${loaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {error && (
        <div className="image-error">
          <span>이미지 로딩 실패</span>
        </div>
      )}
    </div>
  );
});

// 영화 상세 정보 캐시
const movieDetailCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10분

const MovieDetail = ({ movie, activeTab: propActiveTab }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(propActiveTab || 'overview');
  
  // 점진적 로딩을 위한 상태 관리
  const [loadingStates, setLoadingStates] = useState({
    overview: false,
    details: false,
    videos: false,
    photos: false
  });

  const tabs = [
    { id: 'overview', label: '개요' },
    { id: 'details', label: '상세정보' },
    { id: 'videos', label: '비디오' },
    { id: 'photos', label: '포토' }
  ];

  // 탭 변경 핸들러 (useCallback으로 최적화)
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (id) {
      navigate(`/movie/${id}/${tabId}`);
    }
  }, [id, navigate]);

  // propActiveTab이 변경될 때 activeTab 상태 업데이트
  useEffect(() => {
    if (propActiveTab && propActiveTab !== activeTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab, activeTab]);

  // 기본 영화 정보만 로딩 (개요 탭용)
  const loadBasicMovieInfo = useCallback(async () => {
    if (!movie?.id) {
      setError('영화 정보가 없습니다.');
      setLoading(false);
      return;
    }

    // 캐시 확인
    const cacheKey = `movie_basic_${movie.id}`;
    const cached = movieDetailCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setMovieData(cached.data);
      setLoading(false);
      // 캐시된 데이터가 있으면 추가 데이터도 로딩 시작
      loadAdditionalData();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 기본 정보만 먼저 로딩
      const basicData = await getMovieBasicInfo(movie.id);
      
      // 캐시에 저장
      movieDetailCache.set(cacheKey, {
        data: basicData,
        timestamp: Date.now()
      });
      
      setMovieData(basicData);
      setLoading(false);
      
      // 기본 정보 로딩 완료 후 추가 데이터 로딩 시작
      loadAdditionalData();
    } catch (err) {
      console.error('영화 기본 정보 로딩 실패:', err);
      setError('영화 기본 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [movie?.id]);

  // 추가 데이터 로딩 (상세정보, 비디오, 포토) - 캐시 우선
  const loadAdditionalData = useCallback(async () => {
    if (!movie?.id) return;

    // 1. 상세정보 로딩 (즉시 완료)
    setLoadingStates(prev => ({ ...prev, details: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, details: false }));
    }, 10);

    // 2. 비디오 로딩 (캐시 우선)
    setLoadingStates(prev => ({ ...prev, videos: true }));
    const cachedVideos = getCachedMovieVideos(movie.id);
    if (cachedVideos) {
      // 캐시된 데이터가 있으면 즉시 적용
      setMovieData(prev => ({
        ...prev,
        videos: cachedVideos.videos || []
      }));
      setLoadingStates(prev => ({ ...prev, videos: false }));
    } else {
      // 캐시가 없으면 API 호출
      getMovieVideos(movie.id)
        .then(videoData => {
          setMovieData(prev => ({
            ...prev,
            videos: videoData.videos || []
          }));
        })
        .catch(err => {
          console.error('비디오 로딩 실패:', err);
        })
        .finally(() => {
          setLoadingStates(prev => ({ ...prev, videos: false }));
        });
    }

    // 3. 포토 로딩 (캐시 우선)
    setLoadingStates(prev => ({ ...prev, photos: true }));
    const cachedPhotos = getCachedMoviePhotos(movie.id);
    if (cachedPhotos) {
      // 캐시된 데이터가 있으면 즉시 적용
      setMovieData(prev => ({
        ...prev,
        posters: cachedPhotos.posters || [],
        backdrops: cachedPhotos.backdrops || []
      }));
      setLoadingStates(prev => ({ ...prev, photos: false }));
    } else {
      // 캐시가 없으면 API 호출
      getMoviePhotos(movie.id)
        .then(photoData => {
          setMovieData(prev => ({
            ...prev,
            posters: photoData.posters || [],
            backdrops: photoData.backdrops || []
          }));
        })
        .catch(err => {
          console.error('포토 로딩 실패:', err);
        })
        .finally(() => {
          setLoadingStates(prev => ({ ...prev, photos: false }));
        });
    }
  }, [movie?.id]);

  // 전체 영화 상세 정보 로딩 (상세정보 탭용)
  const loadFullMovieDetails = useCallback(async () => {
    if (!movie?.id || loadingStates.details) return;

    try {
      setLoadingStates(prev => ({ ...prev, details: true }));
      
      const fullData = await getMovieDetails(movie.id);
      
      setMovieData(prev => ({
        ...prev,
        ...fullData
      }));
    } catch (err) {
      console.error('전체 영화 상세 정보 로딩 실패:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, details: false }));
    }
  }, [movie?.id, loadingStates.details]);

  useEffect(() => {
    loadBasicMovieInfo();
  }, [loadBasicMovieInfo]);

  // 이미지 프리로딩
  const preloadImages = useCallback((imageUrls) => {
    imageUrls.forEach(url => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, []);

  // 포스터 이미지 프리로딩
  useEffect(() => {
    if (movieData?.posterUrl) {
      preloadImages([movieData.posterUrl]);
    }
  }, [movieData?.posterUrl, preloadImages]);

  // 포토 이미지들 프리로딩
  useEffect(() => {
    if (movieData?.posters || movieData?.backdrops) {
      const allImages = [
        ...(movieData.posters || []),
        ...(movieData.backdrops || [])
      ];
      if (allImages.length > 0) {
        const imageUrls = allImages.slice(0, 12).map(img => img.url);
        preloadImages(imageUrls);
      }
    }
  }, [movieData?.posters, movieData?.backdrops, preloadImages]);

  // 포맷팅 함수들 (useCallback으로 최적화)
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '미상';
    return new Date(dateString).toLocaleDateString('ko-KR');
  }, []);

  const formatRuntime = useCallback((runtime) => {
    if (!runtime) return '미상';
    return `${runtime}분`;
  }, []);

  const formatBudget = useCallback((budget) => {
    if (!budget || budget === 0) return '미상';
    return `$${budget.toLocaleString()}`;
  }, []);

  const formatRevenue = useCallback((revenue) => {
    if (!revenue || revenue === 0) return '미상';
    return `$${revenue.toLocaleString()}`;
  }, []);


  const renderOverview = useMemo(() => {
    if (!movieData) return null;

    return (
      <div className="overview-content">
        {/* 영화 포스터와 기본 정보 */}
        <div className="movie-header">
          <div className="detail-movie-poster">
            <LazyImage 
              src={movieData.posterUrl} 
              alt={movieData.title}
              className="movie-poster-image"
              onError={(e) => {
                e.target.src = '/logo.svg';
              }}
            />
          </div>
          <div className="movie-basic-info">
            <h1 className="detail-movie-title">{movieData.title}</h1>
            {movieData.originalTitle && movieData.originalTitle !== movieData.title && (
              <p className="original-title">{movieData.originalTitle}</p>
            )}
            
            <div className="movie-meta">
              <div className="meta-item">
                <FaCalendar className="meta-icon" />
                <span>{formatDate(movieData.releaseDate)}</span>
              </div>
              <div className="meta-item">
                <FaClock className="meta-icon" />
                <span>{formatRuntime(movieData.runtime)}</span>
              </div>
              <div className="meta-item">
                <FaGlobe className="meta-icon" />
                <span>{movieData.countryName || '미상'}</span>
              </div>
              {movieData.certification && (
                <div className="meta-item">
                  <span className="certification">{movieData.certification}</span>
                </div>
              )}
            </div>

            <div className="movie-genres">
              {movieData.genres && movieData.genres.map((genre, index) => (
                <span key={index} className="genre-tag">
                  <FaTag className="tag-icon" />
                  {genre}
                </span>
              ))}
            </div>

            <div className="movie-rating">
              <div className="rating-item">
                <FaStar className="star-icon" />
                <span className="rating-score">{movieData.voteAverage?.toFixed(1) || 'N/A'}</span>
                <span className="rating-count">({movieData.voteCount || 0}명)</span>
              </div>
              <div className="rating-item">
                <span className="popularity">인기도: {movieData.popularity?.toFixed(0) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 줄거리 */}
        {movieData.overview && (
          <div className="movie-overview">
            <h3>줄거리</h3>
            <p>{movieData.overview}</p>
          </div>
        )}

        {/* 키워드 */}
        {movieData.keywords && movieData.keywords.length > 0 && (
          <div className="movie-keywords">
            <h3>키워드</h3>
            <div className="keywords-list">
              {movieData.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [movieData, formatDate, formatRuntime]);

  const renderDetails = useMemo(() => {
    if (!movieData) return null;

    if (loadingStates.details) {
      return (
        <div className="details-content">
          <div className="loading-skeleton">
            <div className="skeleton-grid">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="skeleton-detail-item">
                  <div className="skeleton-label"></div>
                  <div className="skeleton-value"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 상세정보가 없으면 전체 데이터를 로딩
    if (!movieData.budget && !movieData.revenue && !movieData.status) {
      // 상세정보 로딩 시작
      if (!loadingStates.details) {
        loadFullMovieDetails();
      }
      return (
        <div className="details-content">
          <div className="loading-skeleton">
            <div className="skeleton-grid">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="skeleton-detail-item">
                  <div className="skeleton-label"></div>
                  <div className="skeleton-value"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="details-content">
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">제목</span>
            <span className="detail-value">{movieData.title}</span>
          </div>
          {movieData.originalTitle && movieData.originalTitle !== movieData.title && (
            <div className="detail-item">
              <span className="detail-label">원제</span>
              <span className="detail-value">{movieData.originalTitle}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">장르</span>
            <span className="detail-value">{movieData.genres?.join(', ') || '미상'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">개봉일</span>
            <span className="detail-value">{formatDate(movieData.releaseDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">상영시간</span>
            <span className="detail-value">{formatRuntime(movieData.runtime)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">제작국</span>
            <span className="detail-value">{movieData.countryName || '미상'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">상영등급</span>
            <span className="detail-value">{movieData.certification || '미상'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">상태</span>
            <span className="detail-value">{movieData.status || '미상'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">예산</span>
            <span className="detail-value">{formatBudget(movieData.budget)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">흥행수익</span>
            <span className="detail-value">{formatRevenue(movieData.revenue)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">평점</span>
            <span className="detail-value">
              <FaStar className="star-icon" />
              {movieData.voteAverage?.toFixed(1) || 'N/A'} ({movieData.voteCount || 0}명)
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">인기도</span>
            <span className="detail-value">{movieData.popularity?.toFixed(0) || 'N/A'}</span>
          </div>
        </div>
      </div>
    );
  }, [movieData, formatDate, formatRuntime, formatBudget, formatRevenue, loadingStates.details, loadFullMovieDetails]);

  const renderVideos = useMemo(() => {
    if (loadingStates.videos) {
      return (
        <div className="videos-content">
          <div className="loading-skeleton">
            <div className="skeleton-videos-grid">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="skeleton-video-item">
                  <div className="skeleton-video-thumbnail"></div>
                  <div className="skeleton-video-info">
                    <div className="skeleton-video-title"></div>
                    <div className="skeleton-video-site"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!movieData?.videos || movieData.videos.length === 0) {
      return (
        <div className="no-content">
          <p>비디오가 없습니다.</p>
        </div>
      );
    }

    const handleVideoClick = (video) => {
      let url = '';
      
      if (video.site === 'YouTube') {
        url = `https://www.youtube.com/watch?v=${video.key}`;
      } else if (video.url) {
        url = video.url;
      } else {
        console.warn('비디오 URL을 찾을 수 없습니다:', video);
        return;
      }
      
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (win) {
        win.opener = null;
      }
    };

    const handleVideoKeyDown = (e, video) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleVideoClick(video);
      }
    };

    return (
      <div className="videos-content">
        <div className="videos-grid">
          {movieData.videos.map((video, index) => (
            <div key={video.key ?? index} className="video-item">
              <div className="video-thumbnail">
                <div 
                  className="play-overlay"
                  role="button"
                  tabIndex={0}
                  aria-label={`${video.name} 재생`}
                  onClick={() => handleVideoClick(video)}
                  onKeyDown={(e) => handleVideoKeyDown(e, video)}
                >
                  <FaPlay />
                </div>
                <div className="video-label">{video.type}</div>
              </div>
              <div className="video-info">
                <h4 className="video-title">{video.name}</h4>
                <p className="video-site">{video.site}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [movieData, loadingStates.videos]);

  const renderPhotos = useMemo(() => {
    if (!movieData) return null;

    if (loadingStates.photos) {
      return (
        <div className="photos-content">
          <div className="loading-skeleton">
            <div className="skeleton-photos-grid">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="skeleton-photo-item">
                  <div className="skeleton-photo-image"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const allImages = [
      ...(movieData.posters || []),
      ...(movieData.backdrops || [])
    ];

    if (allImages.length === 0) {
      return (
        <div className="no-content">
          <p>이미지가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="photos-content">
        <div className="photos-grid">
          {allImages.slice(0, 12).map((image, index) => (
            <div key={index} className="photo-item">
              <LazyImage 
                src={image.url} 
                alt={`${movieData.title} 이미지 ${index + 1}`}
                className="photo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }, [movieData, loadingStates.photos]);

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return renderOverview;
      case 'details':
        return renderDetails;
      case 'videos':
        return renderVideos;
      case 'photos':
        return renderPhotos;
      default:
        return renderOverview;
    }
  }, [activeTab, renderOverview, renderDetails, renderVideos, renderPhotos]);

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>영화 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-detail">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!movieData) {
    return (
      <div className="movie-detail">
        <div className="error-container">
          <p className="error-message">영화 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      <div className="movie-detail-container">
        {/* 헤더 */}
        <div className="movie-detail-header">
        </div>

        {/* 네비게이션 탭 */}
        <div className="movie-nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              {loadingStates[tab.id] && (
                <span className="tab-loading-indicator">
                  <div className="mini-spinner"></div>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="movie-detail-content">
          {renderTabContent}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MovieDetail);