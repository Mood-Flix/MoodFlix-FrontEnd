import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovieRecommendations } from '../services/movieService';
import { useAuth } from '../hooks/useAuth';
import UserAuthSection from './UserAuthSection';
import './MovieRecommendation.css';

const MovieRecommendation = ({ onMovieClick }) => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  // 인증 관련 상태
  const { user, isAuthenticated, error: authError, login, loginWithKakaoCode, logout, clearError } = useAuth();

  // 로그인 핸들러 (카카오 액세스 토큰)
  const handleLoginSuccess = async (kakaoAccessToken) => {
    try {
      clearError();
      await login(kakaoAccessToken);
      console.log('MovieRecommendation: 로그인 성공');
    } catch (err) {
      console.error('MovieRecommendation: 로그인 실패', err);
    }
  };

  // 카카오 인가 코드로 로그인 핸들러
  const handleKakaoCodeLogin = async (authorizationCode) => {
    try {
      clearError();
      await loginWithKakaoCode(authorizationCode);
      console.log('MovieRecommendation: 카카오 코드 로그인 성공');
    } catch (err) {
      console.error('MovieRecommendation: 카카오 코드 로그인 실패', err);
    }
  };

  const handleLoginError = (errorMessage) => {
    console.error("Kakao SDK 에러:", errorMessage);
  };

  const handleLogout = () => {
    logout();
  };



  const handleRecommendMovies = async () => {
    if (!userInput.trim()) {
      setError('오늘의 기분을 자유롭게 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRecommendations(null);

    try {
      // 사용자 입력을 백엔드로 직접 전송
      console.log('=== 영화 추천 요청 시작 ===');
      console.log('사용자 입력:', userInput.trim());
      console.log('요청 시간:', new Date().toISOString());
      
      const apiResponse = await getMovieRecommendations('', userInput.trim());
      
      console.log('=== 영화 추천 API 응답 ===');
      console.log('전체 응답:', apiResponse);
      console.log('응답 타입:', typeof apiResponse);
      console.log('응답이 배열인가?', Array.isArray(apiResponse));
      console.log('items 속성이 있는가?', 'items' in (apiResponse || {}));
      console.log('items 값:', apiResponse?.items);
      console.log('items 타입:', typeof apiResponse?.items);
      console.log('items가 배열인가?', Array.isArray(apiResponse?.items));
      console.log('items 길이:', apiResponse?.items?.length);
      
      // 백엔드 응답 구조에 맞게 items 배열 추출
      const recommendations = apiResponse?.items || [];
      console.log('추출된 추천 목록:', recommendations);
      console.log('추천 목록 길이:', recommendations.length);
      console.log('응답 버전:', apiResponse?.version);
      console.log('로그 ID:', apiResponse?.logId);
      console.log('===============================');
      
      setRecommendations(recommendations);
    } catch (err) {
      console.error('=== 영화 추천 API 호출 실패 ===');
      console.error('에러 객체:', err);
      console.error('에러 메시지:', err.message);
      console.error('에러 스택:', err.stack);
      console.error('응답 상태:', err.response?.status);
      console.error('응답 데이터:', err.response?.data);
      console.error('요청 URL:', err.config?.url);
      console.error('요청 데이터:', err.config?.data);
      console.error('요청 헤더:', err.config?.headers);
      console.error('네트워크 에러인가?', err.code === 'NETWORK_ERROR');
      console.error('타임아웃 에러인가?', err.code === 'ECONNABORTED');
      console.error('================================');
      
      // 에러 메시지를 더 구체적으로 표시
      let errorMessage = '영화 추천을 가져오는 중 오류가 발생했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        console.error('인증 실패: 토큰이 유효하지 않거나 만료되었습니다.');
      } else if (err.response?.status === 500) {
        errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        console.error('서버 내부 오류:', err.response.data);
      } else if (err.response?.status === 400) {
        errorMessage = '잘못된 요청입니다. 입력을 확인해주세요.';
        console.error('잘못된 요청:', err.response.data);
      } else if (err.response?.status === 403) {
        errorMessage = '접근 권한이 없습니다.';
        console.error('권한 없음:', err.response.data);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        console.error('서버 에러 메시지:', err.response.data.message);
      } else if (err.message) {
        errorMessage = err.message;
        console.error('클라이언트 에러 메시지:', err.message);
      } else {
        console.error('알 수 없는 에러 발생');
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserInput('');
    setRecommendations(null);
    setError('');
  };

  const handleAddToCalendar = (movie) => {
    // 영화 정보를 localStorage에 저장하고 캘린더 편집 페이지로 이동
    console.log('MovieRecommendation: 캘린더에 추가할 영화 데이터:', movie);
    localStorage.setItem('selectedMovieForCalendar', JSON.stringify(movie));
    console.log('MovieRecommendation: localStorage에 저장 완료');
    navigate('/calendar/edit');
  };

  // 추천 결과가 있을 때의 렌더링
  if (recommendations) {
    return (
      <div className="movie-recommendation">
        {/* 사용자 인증 섹션 */}
        <UserAuthSection 
          user={user}
          isAuthenticated={isAuthenticated}
          authError={authError}
          onLoginSuccess={handleLoginSuccess}
          onKakaoCodeLogin={handleKakaoCodeLogin}
          onLoginError={handleLoginError}
          onLogout={handleLogout}
          onClearError={clearError}
        />
        
        <div className="recommendation-container">
          <div className="recommendation-content">
            <div className="title-section">
              <h1 className="main-title">추천 영화</h1>
              <p className="subtitle">당신의 기분에 맞는 영화를 찾았어요!</p>
            </div>

            <div className="recommendations-list">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((item) => {
                  const movie = item.movie; // 백엔드 응답 구조: { movie: {...}, similarity: 0.93 }
                  return (
                    <div key={movie.id} className="recommend-movie-card">
                      <div className="recommend-movie-poster-container" onClick={() => onMovieClick(movie)}>
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="recommend-movie-poster"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150x225/666/fff?text=포스터+없음';
                          }}
                        />
                      </div>
                      <div className="movie-info">
                        <h3 className="recommend-movie-title" onClick={() => onMovieClick(movie)}>{movie.title}</h3>
                        <p className="movie-genre">
                          {movie.genre} • {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                        </p>
                        <p className="movie-description">
                          평점: {movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A'}
                          {item.similarity && (
                            <span className="similarity-score">
                              • 유사도: {(item.similarity * 100).toFixed(1)}%
                            </span>
                          )}
                        </p>
                        <div className="movie-actions">
                          <button 
                            className="calendar-add-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCalendar(movie);
                            }}
                          >
                            📅 캘린더에 추가
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-recommendations">
                  <p>추천할 영화를 찾지 못했습니다. 다른 기분으로 다시 시도해보세요.</p>
                </div>
              )}
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
      {/* 사용자 인증 섹션 */}
      <UserAuthSection 
        user={user}
        isAuthenticated={isAuthenticated}
        authError={authError}
        onLoginSuccess={handleLoginSuccess}
        onKakaoCodeLogin={handleKakaoCodeLogin}
        onLoginError={handleLoginError}
        onLogout={handleLogout}
        onClearError={clearError}
      />
      
      <div className="recommendation-container">
        {/* 메인 콘텐츠 */}
        <div className="recommendation-content">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="main-title">당신의 감정을 영화로</h1>
            <p className="subtitle">오늘의 기분을 자유롭게 표현해주세요</p>
          </div>

          {/* 기분 입력 섹션 */}
          <div className="mood-input-section">
            <h2 className="mood-question">지금 어떤 기분이신가요?</h2>
            <textarea
              className="mood-input"
              placeholder="오늘의 기분을 자유롭게 입력해주세요!"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
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