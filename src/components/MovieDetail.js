import React, { useState } from 'react';
import { FaArrowLeft, FaPlay, FaStar, FaCalendar, FaClock, FaGlobe } from 'react-icons/fa';
import { formatGenres, formatCast, formatReviews, getTmdbImageUrl, getTmdbVideoUrl, getKoreanRating } from '../utils/movieDataTransformer';
import './MovieDetail.css';

const MovieDetail = ({ movie, onBack }) => {
  const [activeTab, setActiveTab] = useState('전체');

  const tabs = [
    '전체', '기본정보', '출연/제작진', '상영일정', '관람평', '무비클립', '포토', '리뷰'
  ];

  // 탭별 콘텐츠 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case '전체':
        return (
          <>
            {/* 비디오 섹션 */}
            {movieData.videos && movieData.videos.results && movieData.videos.results.length > 0 && (
              <div className="video-section">
                <div className="video-grid">
                  {movieData.videos.results.slice(0, 2).map((video) => (
                    <div key={video.id} className="video-item">
                      <div className="video-thumbnail">
                        <div className="play-overlay" onClick={() => window.open(getTmdbVideoUrl(video.key), '_blank')}>
                          <FaPlay />
                        </div>
                        <div className="video-label">{video.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 영화 정보 */}
            <div className="movie-info-section">
              <div className="movie-overview">
                <div className="overview-item">
                  <span className="overview-label">개요</span>
                  <span className="overview-value">
                    {formatGenres(movieData.genres)} ㆍ {movieData.productionCountries?.[0]?.name || '미국'} ㆍ {movieData.runtime ? `${movieData.runtime}분` : '미상'}
                  </span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">개봉</span>
                  <span className="overview-value">{movieData.releaseDate ? new Date(movieData.releaseDate).toLocaleDateString('ko-KR') : '미상'}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">등급</span>
                  <span className="overview-value">{getKoreanRating(movieData.certifications)}</span>
                </div>
              </div>

              <div className="movie-synopsis">
                <h3>줄거리</h3>
                <p>{movieData.overview || movieData.synopsis || '줄거리 정보가 없습니다.'}</p>
              </div>

              {/* 평점 및 통계 */}
              <div className="movie-stats">
                <div className="stat-item">
                  <span className="stat-label">TMDb 평점</span>
                  <span className="stat-value">
                    <FaStar className="star-icon" />
                    {movieData.rating ? movieData.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">평점 참여자</span>
                  <span className="stat-value">{movieData.voteCount ? movieData.voteCount.toLocaleString() : '0'}명</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">인기도</span>
                  <span className="stat-value">{movieData.popularity ? movieData.popularity.toFixed(0) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </>
        );

      case '기본정보':
        return (
          <div className="basic-info-section">
            <h3>기본 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">제목</span>
                <span className="info-value">{movieData.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">원제</span>
                <span className="info-value">{movieData.originalTitle || movieData.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">장르</span>
                <span className="info-value">{formatGenres(movieData.genres)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">제작국</span>
                <span className="info-value">
                  {movieData.productionCountries?.map(country => country.name).join(', ') || '미상'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">상영시간</span>
                <span className="info-value">{movieData.runtime ? `${movieData.runtime}분` : '미상'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">개봉일</span>
                <span className="info-value">
                  {movieData.releaseDate ? new Date(movieData.releaseDate).toLocaleDateString('ko-KR') : '미상'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">상영등급</span>
                <span className="info-value">{getKoreanRating(movieData.certifications)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">예산</span>
                <span className="info-value">
                  {movieData.budget ? `$${movieData.budget.toLocaleString()}` : '미상'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">흥행수익</span>
                <span className="info-value">
                  {movieData.revenue ? `$${movieData.revenue.toLocaleString()}` : '미상'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">상태</span>
                <span className="info-value">{movieData.status || '미상'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">언어</span>
                <span className="info-value">
                  {movieData.spokenLanguages?.map(lang => lang.name).join(', ') || movieData.originalLanguage || '미상'}
                </span>
              </div>
            </div>
          </div>
        );

      case '출연/제작진':
        const castList = formatCast(movieData.cast, 10);
        const director = movieData.crew?.find(person => person.job === 'Director');
        const writer = movieData.crew?.find(person => person.job === 'Writer' || person.job === 'Screenplay');
        
        return (
          <div className="cast-crew-section">
            <h3>출연진</h3>
            <div className="cast-list">
              {castList.length > 0 ? (
                castList.map((actor) => (
                  <div key={actor.id} className="cast-item">
                    <div className="cast-photo">
                      {actor.profilePath ? (
                        <img src={actor.profilePath} alt={actor.name} />
                      ) : (
                        <div className="cast-photo-placeholder"></div>
                      )}
                    </div>
                    <div className="cast-info">
                      <span className="cast-name">{actor.name}</span>
                      <span className="cast-role">{actor.character}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>출연진 정보가 없습니다.</p>
              )}
            </div>
            
            <h3>제작진</h3>
            <div className="crew-list">
              {director && (
                <div className="crew-item">
                  <span className="crew-role">감독</span>
                  <span className="crew-name">{director.name}</span>
                </div>
              )}
              {writer && (
                <div className="crew-item">
                  <span className="crew-role">각본</span>
                  <span className="crew-name">{writer.name}</span>
                </div>
              )}
              {movieData.productionCompanies && movieData.productionCompanies.length > 0 && (
                <div className="crew-item">
                  <span className="crew-role">제작</span>
                  <span className="crew-name">{movieData.productionCompanies[0].name}</span>
                </div>
              )}
            </div>
          </div>
        );

      case '상영일정':
        return (
          <div className="schedule-section">
            <h3>상영 일정</h3>
            <div className="schedule-info">
              <p>현재 상영 중인 영화관 정보가 없습니다.</p>
              <p>백엔드 연동 후 실제 상영 일정이 표시됩니다.</p>
            </div>
          </div>
        );

      case '관람평':
        return (
          <div className="reviews-section">
            <h3>관람평</h3>
            <div className="reviews-info">
              <p>관람평이 없습니다.</p>
              <p>백엔드 연동 후 실제 관람평이 표시됩니다.</p>
            </div>
          </div>
        );

      case '무비클립':
        const videos = movieData.videos?.results || [];
        
        return (
          <div className="clips-section">
            <h3>무비 클립</h3>
            <div className="clips-grid">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <div key={video.id} className="clip-item">
                    <div className="clip-thumbnail">
                      <div className="play-overlay" onClick={() => window.open(getTmdbVideoUrl(video.key), '_blank')}>
                        <FaPlay />
                      </div>
                    </div>
                    <span className="clip-title">{video.name || video.type}</span>
                  </div>
                ))
              ) : (
                <div className="clips-info">
                  <p>비디오 클립이 없습니다.</p>
                  <p>백엔드 연동 후 실제 비디오가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        );

      case '포토':
        const images = movieData.images || {};
        const backdrops = images.backdrops || [];
        const posters = images.posters || [];
        const allImages = [...backdrops.slice(0, 4), ...posters.slice(0, 4)];
        
        return (
          <div className="photos-section">
            <h3>포토 갤러리</h3>
            <div className="photos-grid">
              {allImages.length > 0 ? (
                allImages.map((image, index) => (
                  <div key={index} className="photo-item">
                    <img 
                      src={getTmdbImageUrl(image.file_path, 'w500')} 
                      alt={`${movieData.title} 이미지 ${index + 1}`}
                      className="photo-image"
                    />
                    <span className="photo-caption">
                      {image.iso_639_1 ? `${image.iso_639_1.toUpperCase()} 포스터` : `이미지 ${index + 1}`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="photos-info">
                  <p>이미지가 없습니다.</p>
                  <p>백엔드 연동 후 실제 이미지가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        );

      case '리뷰':
        const reviewsList = formatReviews(movieData.reviews, 5);
        
        return (
          <div className="critic-reviews-section">
            <h3>TMDb 리뷰</h3>
            <div className="reviews-list">
              {reviewsList.length > 0 ? (
                reviewsList.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{review.author}</span>
                      {review.rating && (
                        <div className="review-rating">
                          <FaStar className="star-icon" />
                          {review.rating}/10
                        </div>
                      )}
                    </div>
                    <div className="review-content">
                      <p>{review.content}</p>
                    </div>
                    {review.url && (
                      <a href={review.url} target="_blank" rel="noopener noreferrer" className="review-link">
                        원문 보기
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="reviews-info">
                  <p>TMDb 리뷰가 없습니다.</p>
                  <p>백엔드 연동 후 실제 리뷰가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 영화 데이터가 없을 경우 기본 데이터 사용
  const movieData = movie || {
    id: 1,
    title: '극장판 귀멸의 칼날: 무한성편',
    originalTitle: 'Demon Slayer: Kimetsu no Yaiba the Movie: Mugen Train Arc',
    year: 2025,
    status: '상영중',
    genre: '애니메이션',
    country: '일본',
    duration: '155분',
    releaseDate: '2025.08.22.',
    originalWork: '만화',
    synopsis: '가족을 잃고 귀살대에 입단한 카마도 탄지로. 여동생 네즈코를 인간으로 되돌리고 가족의 원수를 갚기 위해 싸우는 탄지로에게 새로운 임무가 주어진다. 아가츠마 젠이츠, 하시비라 이노스케와 함께 무한열차에 탑승한 탄지로는 열차 안에서 일어나는 의문의 사건들을 조사하게 되는데...',
    rank: '1위',
    audienceCount: '186만명',
    audienceRating: '9.18',
    netizenRating: '9.23',
    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    trailer: 'https://www.youtube.com/embed/example1',
    promo: 'https://www.youtube.com/embed/example2'
  };

  return (
    <div className="movie-detail">
      <div className="movie-detail-container">
        {/* 헤더 */}
        <div className="movie-detail-header">
          <button className="back-button" onClick={onBack}>
            <FaArrowLeft />
          </button>
          <div className="movie-title-section">
            <h1 className="movie-title">{movieData.title}</h1>
            <span className="movie-status">{movieData.status}</span>
          </div>
          <div className="movie-year">{movieData.year}</div>
        </div>

        {/* 네비게이션 탭 */}
        <div className="movie-nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
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
