import React, { useState } from 'react';
import { getMovieRecommendations } from '../services/movieService';
import { HappyIcon, SadIcon, ExcitedIcon, PeacefulIcon, RomanticIcon, AnxiousIcon } from './EmotionIcons';
import './MovieRecommendation.css';

const MovieRecommendation = ({ onMovieClick }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [customMood, setCustomMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const moodOptions = [
    { id: 'happy', label: '행복해요', icon: HappyIcon, color: '#FFD700' },
    { id: 'sad', label: '슬퍼요', icon: SadIcon, color: '#87CEEB' },
    { id: 'excited', label: '신나요', icon: ExcitedIcon, color: '#FF6B6B' },
    { id: 'peaceful', label: '평온해요', icon: PeacefulIcon, color: '#98FB98' },
    { id: 'romantic', label: '로맨틱해요', icon: RomanticIcon, color: '#FF69B4' },
    { id: 'anxious', label: '불안해요', icon: AnxiousIcon, color: '#DDA0DD' }
  ];

  const handleMoodSelect = (moodId) => {
    setSelectedMood(selectedMood === moodId ? '' : moodId);
    setRecommendations(null);
    setError('');
  };


  const handleRecommendMovies = async () => {
    if (!selectedMood && !customMood.trim()) {
      setError('기분을 선택하거나 설명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRecommendations(null);

    try {
      // 실제 API 호출 시도
      try {
        const apiResponse = await getMovieRecommendations(selectedMood, customMood);
        setRecommendations(apiResponse);
        return;
      } catch (apiError) {
        console.warn('API 호출 실패, 모의 데이터 사용:', apiError);
        // API 실패 시 모의 데이터로 fallback
      }
      
      // 모의 데이터 (API 실패 시 사용)
      const mockRecommendations = [
        {
          id: 1,
          title: '인터스텔라',
          genre: 'SF/드라마',
          year: 2014,
          description: '우주를 배경으로 한 감동적인 드라마로, 시간과 사랑에 대한 깊이 있는 메시지를 담고 있습니다.',
          poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
          status: '상영종료',
          country: '미국',
          duration: '169분',
          releaseDate: '2014.11.06.',
          originalWork: '오리지널',
          synopsis: '지구의 마지막 희망을 찾아 우주로 떠나는 탐사대의 이야기. 시간과 공간을 넘나드는 거대한 모험을 통해 인간의 본질과 사랑의 의미를 탐구한다.',
          rank: '1위',
          audienceCount: '1034만명',
          audienceRating: '9.12',
          netizenRating: '8.95'
        },
        {
          id: 2,
          title: '라라랜드',
          genre: '뮤지컬/로맨스',
          year: 2016,
          description: '음악과 사랑이 만나는 아름다운 이야기로, 꿈과 현실 사이의 균형을 다룹니다.',
          poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
          status: '상영종료',
          country: '미국',
          duration: '128분',
          releaseDate: '2016.12.07.',
          originalWork: '오리지널',
          synopsis: '배우가 되고 싶은 미아와 재즈 피아니스트가 되고 싶은 세바스찬의 로맨틱한 이야기. LA의 아름다운 배경에서 펼쳐지는 음악과 춤, 사랑의 향연.',
          rank: '2위',
          audienceCount: '356만명',
          audienceRating: '8.87',
          netizenRating: '8.76'
        },
        {
          id: 3,
          title: '토이스토리4',
          genre: '애니메이션/가족',
          year: 2019,
          description: '장난감들의 새로운 모험을 그린 따뜻하고 재미있는 애니메이션입니다.',
          poster: 'https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg',
          status: '상영종료',
          country: '미국',
          duration: '100분',
          releaseDate: '2019.06.20.',
          originalWork: '오리지널',
          synopsis: '우디와 친구들이 새로운 모험을 떠나는 이야기. 장난감들의 우정과 성장을 그린 따뜻한 가족 애니메이션.',
          rank: '3위',
          audienceCount: '289만명',
          audienceRating: '8.45',
          netizenRating: '8.32'
        },
        {
          id: 4,
          title: '스파이더맨: 노 웨이 홈',
          genre: '액션/어드벤처',
          year: 2021,
          description: '멀티버스가 열리며 페터 파커의 운명이 바뀌는 스릴 넘치는 액션 영화입니다.',
          poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
          status: '상영종료',
          country: '미국',
          duration: '148분',
          releaseDate: '2021.12.15.',
          originalWork: '만화',
          synopsis: '멀티버스가 열리며 세 명의 스파이더맨이 만나는 이야기. 페터 파커의 운명을 바꾸는 거대한 모험이 시작된다.',
          rank: '4위',
          audienceCount: '802만명',
          audienceRating: '9.01',
          netizenRating: '8.89'
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (err) {
      setError('영화 추천을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('추천 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedMood('');
    setCustomMood('');
    setRecommendations(null);
    setError('');
  };

  // 추천 결과가 있을 때의 렌더링
  if (recommendations) {
    return (
      <div className="movie-recommendation">
        <div className="recommendation-container">
          <div className="recommendation-content">
            <div className="title-section">
              <h1 className="main-title">추천 영화</h1>
              <p className="subtitle">당신의 기분에 맞는 영화를 찾았어요!</p>
            </div>

            <div className="recommendations-list">
              {recommendations.map((movie) => (
                <div key={movie.id} className="recommend-movie-card" onClick={() => onMovieClick(movie)}>
                  <div className="recommend-movie-poster-container">
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="recommend-movie-poster"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x225/666/fff?text=포스터+없음';
                      }}
                    />
                  </div>
                  <div className="movie-info">
                    <h3 className="recommend-movie-title">{movie.title}</h3>
                    <p className="movie-genre">{movie.genre} • {movie.year}</p>
                    <p className="movie-description">{movie.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="recommend-button-section">
              <button className="recommend-button" onClick={handleReset}>
                다시 추천받기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-recommendation">
      <div className="recommendation-container">
        {/* 메인 콘텐츠 */}
        <div className="recommendation-content">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="main-title">당신의 감정을 영화로</h1>
            <p className="subtitle">오늘의 기분에 맞는 완벽한 영화를 찾아보세요</p>
          </div>

          {/* 기분 선택 섹션 */}
          <div className="mood-selection-section">
            <h2 className="mood-question">지금 기분이 어떠신가요?</h2>
            
            <div className="mood-buttons-container">
              {/* 상단 3개 버튼 */}
              <div className="mood-buttons-row">
                {moodOptions.slice(0, 3).map((mood) => {
                  const IconComponent = mood.icon;
                  return (
                    <button
                      key={mood.id}
                      className={`mood-button ${selectedMood === mood.id ? 'selected' : ''}`}
                      onClick={() => handleMoodSelect(mood.id)}
                      style={{
                        borderColor: selectedMood === mood.id ? mood.color : 'transparent'
                      }}
                    >
                      <IconComponent className="mood-icon" />
                      <span className="mood-label">{mood.label}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* 하단 3개 버튼 */}
              <div className="mood-buttons-row">
                {moodOptions.slice(3, 6).map((mood) => {
                  const IconComponent = mood.icon;
                  return (
                    <button
                      key={mood.id}
                      className={`mood-button ${selectedMood === mood.id ? 'selected' : ''}`}
                      onClick={() => handleMoodSelect(mood.id)}
                      style={{
                        borderColor: selectedMood === mood.id ? mood.color : 'transparent'
                      }}
                    >
                      <IconComponent className="mood-icon" />
                      <span className="mood-label">{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 추가 기분 입력 섹션 */}
          <div className="custom-mood-section">
            <textarea
              className="custom-mood-input"
              placeholder="더 자세히 오늘의 기분을 알려주세요...&#10;예: 오늘 너무 기분이 좋아 행복해"
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* 영화 추천 버튼 */}
          <div className="recommend-button-section">
            <button 
              className="recommend-button"
              onClick={handleRecommendMovies}
              disabled={isLoading}
            >
              {isLoading ? '추천 중...' : '영화 추천받기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieRecommendation;
