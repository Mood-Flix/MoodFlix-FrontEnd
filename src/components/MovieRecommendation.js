import React, { useState } from 'react';
import { getMovieRecommendations } from '../services/movieService';
import { HappyIcon, SadIcon, ExcitedIcon, PeacefulIcon, RomanticIcon, AnxiousIcon } from './EmotionIcons';
import UserAuthSection from './UserAuthSection';
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
      // 실제 API 호출
      const apiResponse = await getMovieRecommendations(selectedMood, customMood);
      setRecommendations(apiResponse);
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
        <UserAuthSection />
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
      <UserAuthSection />
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
