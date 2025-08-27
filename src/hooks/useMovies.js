import { useState, useEffect, useCallback } from 'react';
import { getFeaturedMovies, getNewReleases } from '../services/movieService';

export const useMovies = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [newReleases, setNewReleases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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



  // 모든 영화 데이터 로딩
  const loadAllMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadFeaturedMovie(),
        loadNewReleases()
      ]);
    } catch (err) {
      console.error('영화 데이터 로딩 실패:', err);
      setError('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [loadFeaturedMovie, loadNewReleases]);

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
    loading,
    error,
    refreshMovies,
    loadFeaturedMovie,
    loadNewReleases
  };
};
