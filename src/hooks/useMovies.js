import { useState, useEffect, useCallback } from 'react';
import { getMovieData, syncMovies, clearMovieCache } from '../services/movieService';

export const useMovies = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [newReleases, setNewReleases] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // 통합된 영화 데이터 로딩 (페이지네이션 지원)
  const loadAllMovieData = useCallback(async (page = 0, forceRefresh = false) => {
    try {
      const data = await getMovieData(page, 24, forceRefresh);
      
      // 새로운 API 구조에 맞춰 데이터 처리
      const movies = data.content || [];
      const totalPages = data.totalPages || 0;
      const totalElements = data.totalElements || 0;
      const currentPageNum = data.number || 0;
      const isLast = data.last || false;
      
      // 첫 페이지인 경우 초기화, 아니면 추가
      if (page === 0) {
        setMovieList(movies);
        setNewReleases(movies);
        setFeaturedMovie(movies.length > 0 ? movies[0] : null);
      } else {
        setMovieList(prev => [...prev, ...movies]);
        setNewReleases(prev => [...prev, ...movies]);
      }
      
      setTotalPages(totalPages);
      setCurrentPage(currentPageNum);
      setTotalElements(totalElements);
      setHasMore(!isLast);
      
    } catch (err) {
      console.error('영화 데이터 로딩 실패:', err);
      setError('영화 데이터를 불러오는데 실패했습니다.');
    }
  }, []);

  // 개별 함수들 (하위 호환성을 위해 유지)
  const loadFeaturedMovie = useCallback(async () => {
    try {
      const data = await getMovieData();
      setFeaturedMovie(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error('피처드 영화 로딩 실패:', err);
      setError('피처드 영화를 불러오는데 실패했습니다.');
    }
  }, []);

  const loadNewReleases = useCallback(async () => {
    try {
      const data = await getMovieData();
      setNewReleases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('신작 영화 로딩 실패:', err);
      setError('신작 영화를 불러오는데 실패했습니다.');
    }
  }, []);

  const loadMovieList = useCallback(async () => {
    try {
      const data = await getMovieData();
      setMovieList(Array.isArray(data) ? data : []);
      setTotalPages(1);
      setCurrentPage(0);
    } catch (err) {
      console.error('영화 목록 로딩 실패:', err);
      setError('영화 목록을 불러오는데 실패했습니다.');
    }
  }, []);

  // TMDb 영화 동기화
  const syncMoviesData = useCallback(async () => {
    setSyncing(true);
    try {
      await syncMovies();
      // 동기화 후 데이터 새로고침 (단일 호출로 최적화)
      await loadAllMovieData(true); // 강제 새로고침
    } catch (err) {
      console.error('영화 동기화 실패:', err);
      setError('영화 동기화에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  }, [loadAllMovieData]);



  // 전체 영화 목록 로딩 (요약 정보) - 통합 함수 사용
  const loadAllMoviesSummary = useCallback(async () => {
    try {
      await loadAllMovieData();
    } catch (err) {
      console.error('전체 영화 목록 로딩 실패:', err);
      setError('전체 영화 목록을 불러오는데 실패했습니다.');
    }
  }, [loadAllMovieData]);

  // 모든 영화 데이터 로딩 (최적화된 단일 호출)
  const loadAllMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loadAllMovieData(0);
    } catch (err) {
      console.error('영화 데이터 로딩 실패:', err);
      setError('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [loadAllMovieData]);

  // 더 많은 영화 로드 (무한 스크롤용)
  const loadMoreMovies = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      const nextPage = currentPage + 1;
      await loadAllMovieData(nextPage);
    } catch (err) {
      console.error('추가 영화 데이터 로딩 실패:', err);
      setError('추가 영화 데이터를 불러오는데 실패했습니다.');
    }
  }, [hasMore, loading, currentPage, loadAllMovieData]);

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    loadAllMovies();
  }, [loadAllMovies]);

  // 데이터 새로고침 (캐시 무효화)
  const refreshMovies = useCallback(() => {
    clearMovieCache();
    loadAllMovies();
  }, [loadAllMovies]);

  return {
    featuredMovie,
    newReleases,
    movieList,
    totalPages,
    currentPage,
    totalElements,
    hasMore,
    loading,
    error,
    syncing,
    refreshMovies,
    loadMoreMovies,
    loadFeaturedMovie,
    loadNewReleases,
    loadMovieList,
    loadAllMoviesSummary,
    syncMoviesData
  };
};
