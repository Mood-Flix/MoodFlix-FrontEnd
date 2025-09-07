// 백엔드 응답 DTO를 프론트엔드에서 사용하는 형태로 변환하는 유틸리티

/**
 * 백엔드 MovieSummaryResponse를 프론트엔드 형식으로 변환
 * @param {Object} movieSummary - 백엔드 MovieSummaryResponse
 * @returns {Object} 프론트엔드에서 사용하는 영화 객체
 */
export const transformMovieSummary = (movieSummary) => {
  if (!movieSummary) return null;

  return {
    id: movieSummary.id,
    title: movieSummary.title,
    originalTitle: movieSummary.originalTitle,
    overview: movieSummary.overview,
    posterUrl: movieSummary.posterPath ? `https://image.tmdb.org/t/p/w500${movieSummary.posterPath}` : null,
    backdropUrl: movieSummary.backdropPath ? `https://image.tmdb.org/t/p/w780${movieSummary.backdropPath}` : null,
    releaseDate: movieSummary.releaseDate,
    year: movieSummary.releaseDate ? new Date(movieSummary.releaseDate).getFullYear() : null,
    rating: movieSummary.voteAverage,
    voteCount: movieSummary.voteCount,
    genre: movieSummary.genres ? movieSummary.genres.map(g => g.name).join(', ') : '',
    genres: movieSummary.genres || [],
    adult: movieSummary.adult,
    originalLanguage: movieSummary.originalLanguage,
    popularity: movieSummary.popularity,
    video: movieSummary.video
  };
};

/**
 * 백엔드 MovieDetailResponse를 프론트엔드 형식으로 변환
 * @param {Object} movieDetail - 백엔드 MovieDetailResponse
 * @returns {Object} 프론트엔드에서 사용하는 영화 상세 객체
 */
export const transformMovieDetail = (movieDetail) => {
  if (!movieDetail) return null;

  const base = transformMovieSummary(movieDetail);

  return {
    ...base,
    // 추가 상세 정보
    budget: movieDetail.budget,
    revenue: movieDetail.revenue,
    runtime: movieDetail.runtime,
    status: movieDetail.status,
    tagline: movieDetail.tagline,
    homepage: movieDetail.homepage,
    imdbId: movieDetail.imdbId,
    
    // 미디어 정보
    images: movieDetail.images || {
      backdrops: [],
      posters: [],
      logos: []
    },
    videos: movieDetail.videos || {
      results: []
    },
    
    // 출연진 및 제작진
    cast: movieDetail.cast || [],
    crew: movieDetail.crew || [],
    
    // 연관 작품
    similar: movieDetail.similar || [],
    recommendations: movieDetail.recommendations || [],
    
    // 리뷰
    reviews: movieDetail.reviews || [],
    
    // 국가 및 인증 정보
    countries: movieDetail.countries || [],
    certifications: movieDetail.certifications || [],
    
    // 키워드
    keywords: movieDetail.keywords || [],
    
    // 제작사
    productionCompanies: movieDetail.productionCompanies || [],
    productionCountries: movieDetail.productionCountries || [],
    
    // 언어
    spokenLanguages: movieDetail.spokenLanguages || []
  };
};

/**
 * 백엔드 페이징 응답을 프론트엔드 형식으로 변환
 * @param {Object} pageResponse - 백엔드 페이징 응답
 * @returns {Object} 프론트엔드에서 사용하는 페이징 객체
 */
export const transformPageResponse = (pageResponse) => {
  if (!pageResponse) return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 };

  return {
    content: pageResponse.content ? pageResponse.content.map(transformMovieSummary) : [],
    totalPages: pageResponse.totalPages || 0,
    totalElements: pageResponse.totalElements || 0,
    number: pageResponse.number || 0,
    size: pageResponse.size || 20,
    first: pageResponse.first || false,
    last: pageResponse.last || false,
    numberOfElements: pageResponse.numberOfElements || 0
  };
};

/**
 * TMDb 이미지 URL 생성
 * @param {string} path - 이미지 경로
 * @param {string} size - 이미지 크기 (w92, w154, w185, w342, w500, w780, original)
 * @returns {string} 완전한 이미지 URL
 */
export const getTmdbImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // 이미 완전한 URL인 경우
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * TMDb 비디오 URL 생성 (YouTube)
 * @param {string} key - YouTube 비디오 키
 * @returns {string} YouTube URL
 */
export const getTmdbVideoUrl = (key) => {
  if (!key) return null;
  return `https://www.youtube.com/watch?v=${key}`;
};

/**
 * 영화 등급 정보 추출 (한국 기준)
 * @param {Array} certifications - 인증 정보 배열
 * @returns {string} 한국 등급 또는 '미분류'
 */
export const getKoreanRating = (certifications) => {
  if (!certifications || !Array.isArray(certifications)) return '미분류';
  
  const koreanCert = certifications.find(cert => cert.iso_3166_1 === 'KR');
  return koreanCert ? koreanCert.rating : '미분류';
};

/**
 * 장르 이름 배열을 문자열로 변환
 * @param {Array} genres - 장르 배열
 * @param {number} maxCount - 최대 표시할 장르 수
 * @returns {string} 장르 문자열
 */
export const formatGenres = (genres, maxCount = 3) => {
  if (!genres || !Array.isArray(genres)) return '';
  return genres.slice(0, maxCount).map(g => g.name || g).join(', ');
};

/**
 * 출연진 정보를 간단한 형태로 변환
 * @param {Array} cast - 출연진 배열
 * @param {number} maxCount - 최대 표시할 출연진 수
 * @returns {Array} 간단한 출연진 정보
 */
export const formatCast = (cast, maxCount = 10) => {
  if (!cast || !Array.isArray(cast)) return [];
  return cast.slice(0, maxCount).map(actor => ({
    id: actor.id,
    name: actor.name,
    character: actor.character,
    profilePath: getTmdbImageUrl(actor.profilePath, 'w185')
  }));
};

/**
 * 리뷰 정보를 간단한 형태로 변환
 * @param {Array} reviews - 리뷰 배열
 * @param {number} maxCount - 최대 표시할 리뷰 수
 * @returns {Array} 간단한 리뷰 정보
 */
export const formatReviews = (reviews, maxCount = 5) => {
  if (!reviews || !Array.isArray(reviews)) return [];
  return reviews.slice(0, maxCount).map(review => ({
    id: review.id,
    author: review.author,
    content: review.content,
    rating: review.rating,
    createdAt: review.createdAt,
    url: review.url
  }));
};
