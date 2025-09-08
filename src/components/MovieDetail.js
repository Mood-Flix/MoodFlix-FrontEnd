import React, { useState, useEffect } from 'react';
import { FaPlay, FaStar, FaCalendar, FaClock, FaGlobe, FaTag } from 'react-icons/fa';
import { getMovieDetails } from '../services/movieService';
import './MovieDetail.css';

const MovieDetail = ({ movie, onBack }) => {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '개요' },
    { id: 'details', label: '상세정보' },
    { id: 'videos', label: '비디오' },
    { id: 'photos', label: '포토' }
  ];

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!movie?.id) {
        setError('영화 정보가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMovieDetails(movie.id);
        setMovieData(data);
      } catch (err) {
        console.error('영화 상세 정보 로딩 실패:', err);
        setError('영화 상세 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [movie?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return '미상';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatRuntime = (runtime) => {
    if (!runtime) return '미상';
    return `${runtime}분`;
  };

  const formatBudget = (budget) => {
    if (!budget || budget === 0) return '미상';
    return `$${budget.toLocaleString()}`;
  };

  const formatRevenue = (revenue) => {
    if (!revenue || revenue === 0) return '미상';
    return `$${revenue.toLocaleString()}`;
  };

  const getYouTubeUrl = (key) => {
    return `https://www.youtube.com/watch?v=${key}`;
  };

  const renderOverview = () => {
    if (!movieData) return null;

    return (
      <div className="overview-content">
        {/* 영화 포스터와 기본 정보 */}
        <div className="movie-header">
          <div className="detail-movie-poster">
            <img 
              src={movieData.posterUrl} 
              alt={movieData.title}
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
  };

  const renderDetails = () => {
    if (!movieData) return null;

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
  };

  const renderVideos = () => {
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
  };

  const renderPhotos = () => {
    if (!movieData) return null;

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
              <img 
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
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'details':
        return renderDetails();
      case 'videos':
        return renderVideos();
      case 'photos':
        return renderPhotos();
      default:
        return renderOverview();
    }
  };

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
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="movie-detail-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;