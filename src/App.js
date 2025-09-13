import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MovieRecommendation from './components/MovieRecommendation';
import MovieDetail from './components/MovieDetail';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import HomeScreen from './components/HomeScreen';
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
  
  // 최적화: ID만 전달하고 MovieDetail에서 직접 상세 정보 로딩
  const movie = { id: parseInt(id) };

  return <MovieDetail movie={movie} activeTab={tab || 'overview'} />;
}

function App() {
  const { isLoading, isAuthenticated } = useAuth();

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
      <Routes>
        {/* 인증되지 않은 사용자는 로그인 페이지로 */}
        {!isAuthenticated ? (
          <Route path="*" element={<HomeScreen onStart={() => window.location.reload()} />} />
        ) : (
          /* 인증된 사용자는 메인 앱으로 */
          <Route path="*" element={<AppLayout />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
