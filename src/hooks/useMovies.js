import { useState, useEffect, useCallback } from 'react';
import { getMovieData, syncMovies, clearMovieCache } from '../services/movieService';

export const useMovies = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [newReleases, setNewReleases] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // 통합된 영화 데이터 로딩 (단일 API 호출)
  const loadAllMovieData = useCallback(async (forceRefresh = false) => {
    try {
      const data = await getMovieData(forceRefresh);
      
      // 모든 상태를 한 번에 업데이트
      setMovieList(Array.isArray(data) ? data : []);
      setNewReleases(Array.isArray(data) ? data : []);
      setFeaturedMovie(Array.isArray(data) && data.length > 0 ? data[0] : null);
      setTotalPages(1); // 단순 배열이므로 페이지는 1개
      setCurrentPage(0);
      
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
      await loadAllMovieData();
    } catch (err) {
      console.error('영화 데이터 로딩 실패:', err);
      setError('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [loadAllMovieData]);

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
    loading,
    error,
    syncing,
    refreshMovies,
    loadFeaturedMovie,
    loadNewReleases,
    loadMovieList,
    loadAllMoviesSummary,
    syncMoviesData
  };
};
