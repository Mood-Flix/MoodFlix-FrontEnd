import { useState, useEffect, useCallback } from 'react';
import { getFeaturedMovies, getNewReleases, getMovieList, syncMovies } from '../services/movieService';

export const useMovies = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [newReleases, setNewReleases] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // 피처드 영화 로딩
  const loadFeaturedMovie = useCallback(async () => {
    try {
      const data = await getFeaturedMovies();
      setFeaturedMovie(data.featured);
    } catch (err) {
      console.error('피처드 영화 로딩 실패:', err);
      setError('피처드 영화를 불러오는데 실패했습니다.');
    }
  }, []);

  // 신작 영화 로딩
  const loadNewReleases = useCallback(async () => {
    try {
      const data = await getNewReleases();
      setNewReleases(data.movies || []);
    } catch (err) {
      console.error('신작 영화 로딩 실패:', err);
      setError('신작 영화를 불러오는데 실패했습니다.');
    }
  }, []);

  // 영화 목록 로딩 (단순 배열)
  const loadMovieList = useCallback(async () => {
    try {
      const data = await getMovieList();
      setMovieList(Array.isArray(data) ? data : []);
      setTotalPages(1); // 단순 배열이므로 페이지는 1개
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
      // 동기화 후 데이터 새로고침
      await loadAllMovies();
    } catch (err) {
      console.error('영화 동기화 실패:', err);
      setError('영화 동기화에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  }, []);



  // 전체 영화 목록 로딩 (요약 정보)
  const loadAllMoviesSummary = useCallback(async () => {
    try {
      const data = await getMovieList();
      setMovieList(Array.isArray(data) ? data : []);
      setTotalPages(1);
      setCurrentPage(0);
    } catch (err) {
      console.error('전체 영화 목록 로딩 실패:', err);
      setError('전체 영화 목록을 불러오는데 실패했습니다.');
    }
  }, []);

  // 모든 영화 데이터 로딩
  const loadAllMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadFeaturedMovie(),
        loadNewReleases(),
        loadMovieList()
      ]);
    } catch (err) {
      console.error('영화 데이터 로딩 실패:', err);
      setError('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [loadFeaturedMovie, loadNewReleases, loadMovieList]);

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    loadAllMovies();
  }, [loadAllMovies]);

  // 데이터 새로고침
  const refreshMovies = useCallback(() => {
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
