import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MovieRecommendation from './components/MovieRecommendation';
import MovieDetail from './components/MovieDetail';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import { useAuth } from './hooks/useAuth';

// 메인 앱 레이아웃 컴포넌트
function AppLayout() {
  const navigate = useNavigate();

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="app">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<MainContent onMovieClick={handleMovieClick} />} />
        <Route path="/recommendation" element={<MovieRecommendation onMovieClick={handleMovieClick} />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movie/:id" element={<MovieDetailRedirect />} />
        <Route path="/movie/:id/:tab" element={<MovieDetailWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// 영화 상세 페이지 리다이렉트 컴포넌트
function MovieDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={`/movie/${id}/overview`} replace />;
}

// 영화 상세 페이지 래퍼 컴포넌트
function MovieDetailWrapper() {
  const { id, tab } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 영화 ID를 기반으로 영화 정보를 가져오는 로직
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError('영화 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 영화 목록에서 해당 ID의 영화를 찾기
        const { getMovieList } = await import('./services/movieService');
        const movies = await getMovieList();
        const foundMovie = movies.find(m => m.id === parseInt(id));
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('영화를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('영화 정보 로딩 실패:', err);
        setError('영화 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);


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

  return <MovieDetail movie={movie} activeTab={tab || 'overview'} />;
}

function App() {
  const { isLoading } = useAuth();

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
