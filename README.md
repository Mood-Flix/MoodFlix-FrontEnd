# MoodFlix

당신의 기분에 맞는 완벽한 영화를 찾아주는 AI 기반 영화 추천 서비스입니다.

## 🚀 주요 기능

- **감정 기반 영화 추천**: 현재 기분과 감정 상태에 맞는 영화 추천
- **스트리밍 서비스 스타일 메인 페이지**: Netflix와 유사한 UI/UX
- **카카오 로그인**: 간편한 소셜 로그인으로 개인화된 서비스 이용
- **AI 분석**: 사용자의 감정과 선호도를 분석하여 맞춤형 추천
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험

## 🛠️ 기술 스택

### Frontend
- React ^19.1.1
- CSS3 (Custom Styling)
- Axios (HTTP Client)
- JWT Decode (Token Management)

### Backend Integration
- Spring Boot (Java)
- RESTful API
- JWT Authentication
- Kakao OAuth Integration

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API 기본 URL
REACT_APP_API_BASE_URL=http://localhost:8080

# 카카오 JavaScript 키 (필수)
REACT_APP_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key
```

참고: 로컬에서 `.env` 파일을 사용하며, 해당 파일은 Git에 커밋되지 않습니다.

### 3. 개발 서버 실행
```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 🎬 메인 페이지 기능

### 새로운 메인 페이지
- **피처드 영화 섹션**: 하이라이트된 영화와 예고편 보기 버튼
- **신작 영화 섹션**: 이번주 신작 영화들의 그리드 레이아웃
- **사이드바 네비게이션**: 홈, 검색, 추가, 캘린더 아이콘
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화

### 사용자 경험
- 로그인 없이도 메인 페이지 이용 가능
- 로딩 상태와 에러 처리
- 영화 포스터 이미지 및 평점 표시
- 호버 효과와 애니메이션

## 🔧 백엔드 연동

### API 엔드포인트

#### 인증 관련
- `POST /api/auth/kakao` - 카카오 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/user/profile` - 사용자 프로필 조회

#### 영화 관련 (새로 추가)
- `GET /api/movies/featured` - 피처드 영화 조회
- `GET /api/movies/new-releases` - 신작 영화 조회
- `GET /api/movies/popular` - 인기 영화 조회
- `GET /api/movies/{id}` - 영화 상세 정보 조회
- `GET /api/movies/trailer/{id}` - 영화 예고편 URL 조회

#### 영화 추천 관련
- `POST /api/movies/recommendations` - 영화 추천 요청
- `GET /api/movies/search` - 영화 검색

### 데이터 구조

#### 피처드 영화 응답 예시
```json
{
  "featured": {
    "id": 1,
    "title": "MONEY HEIST",
    "subtitle": "PART 4",
    "description": "스페인 최고의 도둑들이 은행을 터는 대담한 계획을 세운다",
    "posterUrl": "/movie-posters/money-heist.jpg",
    "trailerUrl": "https://www.youtube.com/watch?v=example",
    "rating": 4.5,
    "year": 2021,
    "genre": "액션/범죄"
  }
}
```

#### 신작 영화 응답 예시
```json
{
  "movies": [
    {
      "id": 1,
      "title": "The Mother",
      "posterUrl": "/movie-posters/the-mother.jpg",
      "rating": 4.2,
      "year": 2023
    }
  ]
}
```

### 인증 플로우

1. **카카오 로그인**: 사용자가 카카오 계정으로 로그인
2. **백엔드 연동**: 프론트엔드에서 백엔드로 카카오 액세스 토큰과 사용자 정보 전송
3. **JWT 토큰 발급**: 백엔드에서 JWT 액세스 토큰과 리프레시 토큰 발급
4. **API 요청**: 이후 모든 API 요청에 JWT 토큰을 Authorization 헤더에 포함
5. **토큰 갱신**: 액세스 토큰 만료 시 리프레시 토큰으로 갱신

### 환경 설정

백엔드 서버가 다른 포트에서 실행 중인 경우, `.env` 파일의 `REACT_APP_API_BASE_URL`을 수정하세요.

## 📱 사용법

1. **홈 화면**: MoodFlix 로고와 함께 환영 메시지 표시
2. **로그인 없이 시작**: "로그인 없이 시작하기" 버튼으로 메인 페이지 바로 이용
3. **카카오 로그인**: 카카오 계정으로 간편하게 로그인
4. **메인 페이지**: 피처드 영화와 신작 영화 둘러보기
5. **감정 선택**: 현재 기분에 맞는 감정 선택
6. **기분 설명**: 구체적인 기분 상태를 텍스트로 입력
7. **영화 추천**: AI가 분석하여 맞춤형 영화 추천

## 🔒 보안

- JWT 토큰 기반 인증
- HTTPS 통신 권장
- 토큰 자동 갱신
- 보안된 API 엔드포인트
- 토큰 저장 권장: 액세스 토큰은 메모리(또는 In-Memory 스토어), 리프레시 토큰은 HttpOnly + Secure 쿠키 사용 권장
- XSS 완화: CSP, DOMPurify, 라이브러리/의존성 업데이트, 인터셉터/로깅에서 토큰 마스킹

## 🌐 배포

### 프로덕션 빌드
```bash
npm run build
```

### 환경 변수 설정
프로덕션 환경에서는 적절한 백엔드 API URL을 설정하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**MoodFlix** - 당신의 기분에 맞는 영화를 찾아드립니다! 🎬✨
