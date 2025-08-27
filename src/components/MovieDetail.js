import React, { useState } from 'react';
import { FaArrowLeft, FaPlay, FaStar, FaCalendar, FaClock, FaGlobe } from 'react-icons/fa';
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
            <div className="video-section">
              <div className="video-grid">
                <div className="video-item promo">
                  <div className="video-thumbnail">
                    <div className="play-overlay">
                      <FaPlay />
                    </div>
                    <div className="video-label">프로모션 릴</div>
                  </div>
                </div>
                <div className="video-item main-trailer">
                  <div className="video-thumbnail">
                    <div className="play-overlay">
                      <FaPlay />
                    </div>
                    <div className="video-label">메인 예고편</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 영화 정보 */}
            <div className="movie-info-section">
              <div className="movie-overview">
                <div className="overview-item">
                  <span className="overview-label">개요</span>
                  <span className="overview-value">
                    {movieData.genre} ㆍ {movieData.country} ㆍ {movieData.duration}
                  </span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">개봉</span>
                  <span className="overview-value">{movieData.releaseDate}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">원작</span>
                  <span className="overview-value">{movieData.originalWork}</span>
                </div>
              </div>

              <div className="movie-synopsis">
                <h3>줄거리</h3>
                <p>{movieData.synopsis}</p>
              </div>

              {/* 평점 및 통계 */}
              <div className="movie-stats">
                <div className="stat-item">
                  <span className="stat-label">순위 누적 관객수</span>
                  <span className="stat-value">{movieData.rank} / {movieData.audienceCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">실관람객 평점</span>
                  <span className="stat-value">
                    <FaStar className="star-icon" />
                    {movieData.audienceRating}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">네티즌 평점</span>
                  <span className="stat-value">
                    <FaStar className="star-icon" />
                    {movieData.netizenRating}
                  </span>
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
                <span className="info-value">{movieData.genre}</span>
              </div>
              <div className="info-item">
                <span className="info-label">제작국</span>
                <span className="info-value">{movieData.country}</span>
              </div>
              <div className="info-item">
                <span className="info-label">상영시간</span>
                <span className="info-value">{movieData.duration}</span>
              </div>
              <div className="info-item">
                <span className="info-label">개봉일</span>
                <span className="info-value">{movieData.releaseDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">원작</span>
                <span className="info-value">{movieData.originalWork}</span>
              </div>
              <div className="info-item">
                <span className="info-label">상영등급</span>
                <span className="info-value">15세 이상 관람가</span>
              </div>
            </div>
          </div>
        );

      case '출연/제작진':
        return (
          <div className="cast-crew-section">
            <h3>출연진</h3>
            <div className="cast-list">
              <div className="cast-item">
                <div className="cast-photo-placeholder"></div>
                <div className="cast-info">
                  <span className="cast-name">주연 배우 1</span>
                  <span className="cast-role">주인공 역</span>
                </div>
              </div>
              <div className="cast-item">
                <div className="cast-photo-placeholder"></div>
                <div className="cast-info">
                  <span className="cast-name">주연 배우 2</span>
                  <span className="cast-role">조연 역</span>
                </div>
              </div>
            </div>
            
            <h3>제작진</h3>
            <div className="crew-list">
              <div className="crew-item">
                <span className="crew-role">감독</span>
                <span className="crew-name">감독 이름</span>
              </div>
              <div className="crew-item">
                <span className="crew-role">각본</span>
                <span className="crew-name">각본가 이름</span>
              </div>
              <div className="crew-item">
                <span className="crew-role">제작</span>
                <span className="crew-name">제작사 이름</span>
              </div>
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
        return (
          <div className="clips-section">
            <h3>무비 클립</h3>
            <div className="clips-grid">
              <div className="clip-item">
                <div className="clip-thumbnail">
                  <div className="play-overlay">
                    <FaPlay />
                  </div>
                </div>
                <span className="clip-title">메인 예고편</span>
              </div>
              <div className="clip-item">
                <div className="clip-thumbnail">
                  <div className="play-overlay">
                    <FaPlay />
                  </div>
                </div>
                <span className="clip-title">프로모션 영상</span>
              </div>
              <div className="clip-item">
                <div className="clip-thumbnail">
                  <div className="play-overlay">
                    <FaPlay />
                  </div>
                </div>
                <span className="clip-title">스페셜 영상</span>
              </div>
              <div className="clip-item">
                <div className="clip-thumbnail">
                  <div className="play-overlay">
                    <FaPlay />
                  </div>
                </div>
                <span className="clip-title">메이킹 영상</span>
              </div>
            </div>
          </div>
        );

      case '포토':
        return (
          <div className="photos-section">
            <h3>포토 갤러리</h3>
            <div className="photos-grid">
              <div className="photo-item">
                <div className="photo-placeholder"></div>
                <span className="photo-caption">메인 포스터</span>
              </div>
              <div className="photo-item">
                <div className="photo-placeholder"></div>
                <span className="photo-caption">스틸컷 1</span>
              </div>
              <div className="photo-item">
                <div className="photo-placeholder"></div>
                <span className="photo-caption">스틸컷 2</span>
              </div>
              <div className="photo-item">
                <div className="photo-placeholder"></div>
                <span className="photo-caption">스틸컷 3</span>
              </div>
            </div>
          </div>
        );

      case '리뷰':
        return (
          <div className="critic-reviews-section">
            <h3>평론가 리뷰</h3>
            <div className="reviews-info">
              <p>평론가 리뷰가 없습니다.</p>
              <p>백엔드 연동 후 실제 리뷰가 표시됩니다.</p>
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
