import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MovieRecommendation from './components/MovieRecommendation';
import MovieDetail from './components/MovieDetail';
import CalendarEdit from './components/CalendarEdit';
import MyCalendar from './components/MyCalendar';
import Profile from './components/Profile';
import SearchModal from './components/SearchModal';
import PhotoTicket from './components/PhotoTicket';
import { useAuth } from './hooks/useAuth';
import { CalendarProvider } from './contexts/CalendarContext';

// 메인 앱 레이아웃 컴포넌트
function AppLayout() {
  const navigate = useNavigate();

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSearchResults = (results) => {
    console.log('검색 결과:', results);
  };

  const handleCloseSearch = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="app">
      <Sidebar 
        onNavigation={handleNavigation}
      />
      <Routes>
        <Route path="/" element={<MainContent onMovieClick={handleMovieClick} />} />
        <Route path="/search" element={<SearchModal isOpen={true} onClose={handleCloseSearch} onSearchResults={handleSearchResults} />} />
        <Route path="/recommendation" element={<MovieRecommendation onMovieClick={handleMovieClick} />} />
        <Route path="/calendar" element={<MyCalendar />} />
        <Route path="/calendar/edit" element={<CalendarEdit />} />
        <Route path="/calendar/photo-ticket" element={<PhotoTicketWrapper />} />
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

// PhotoTicket 래퍼 컴포넌트
function PhotoTicketWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('PhotoTicketWrapper 렌더링됨', { location, state: location.state });
  
  const handleClose = () => {
    navigate('/calendar');
  };

  // state에서 데이터가 없으면 캘린더로 리다이렉트
  if (!location.state || !location.state.entry || !location.state.date) {
    console.log('데이터가 없어서 캘린더로 리다이렉트');
    navigate('/calendar');
    return null;
  }

  return (
    <PhotoTicket 
      entry={location.state.entry} 
      date={new Date(location.state.date)} 
      onClose={handleClose} 
    />
  );
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
      <CalendarProvider>
        <Routes>
          {/* 모든 사용자는 바로 메인 앱으로 이동 */}
          <Route path="*" element={<AppLayout />} />
        </Routes>
      </CalendarProvider>
    </Router>
  );
}

export default App;
