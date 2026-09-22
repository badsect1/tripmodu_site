# 트립모두 (tripmodu.kr) SEO & GEO 단체여행 자동 포스팅 시스템

**트립모두([tripmodu.kr](https://tripmodu.kr))**를 위한 **Google/네이버 검색(SEO) 및 생성형 AI 검색(ChatGPT Search, Perplexity, Google AI Overviews 등 GEO) 최적화 무인 자동 포스팅 & GitHub 배포 시스템**입니다.

---

## 🌟 핵심 기능 및 장점

1. **최신 생성형 AI 모델 기반 단체여행 전문 칼럼**:
   - Google Gemini AI를 활용하여 공공기관 연수, 기업 워크샵, 협회 세미나, 대가족 단독 투어 맞춤 가이드를 매일 자동 집필합니다.
2. **차세대 AI 검색(GEO) 완벽 대응**:
   - **3줄 Direct Answer 요약 박스**: ChatGPT, Perplexity 등 AI 검색 엔진이 즉시 인용할 수 있는 핵심 요약 제공
   - **구조화된 비교표**: 인원별/일정별 1인당 예상 경비표, 일반 패키지 vs 단독 맞춤 투어 비교표
   - **전문가 실무 팁/주의사항**: 대형버스 동선, 세미나실 구비 조건, 공공기관 계약이행보증보험/과업지시서 실무 팁
   - **사용자 질의형 FAQ**: 구글 리치 스니펫과 AI 질의에 부합하는 질문-답변
3. **전환율(Conversion) 극대화**:
   - 각 글마다 [무료 맞춤 견적 신청하기](https://tripmodu.kr/#inquiry) 및 단체 전문 상담 센터(`1533-8054`) 전화 안내
   - 모바일 하단 플로팅 고정 견적문의 바 탑재
4. **GitHub Actions 무인 자동화**:
   - 컴퓨터를 켜두지 않아도 매일 오전 8시 30분(KST)에 클라우드가 자동으로 새 글을 작성하고 Git 커밋 & 푸시 (호스팅어 SFTP 배포 연동 지원)

---

## 📁 디렉토리 및 파일 구조

```
tripmodu/
├── index.html                        # 메인 랜딩페이지 (상단 '단체여행 칼럼' 메뉴 탑재)
├── posts/                            # 생성된 단체여행 칼럼 허브 및 개별 포스트 HTML
│   ├── index.html                    # 칼럼 허브 목록 (실시간 검색 및 5대 카테고리 필터)
│   └── assets/                       # 트립모두 브랜드 모던 반응형 CSS 및 인터랙션 JS
├── data/
│   ├── posts.json                    # 발행된 전체 포스트 메타데이터 DB
│   ├── topics_tripmodu_seo_geo.json  # 5대 카테고리 × 인원 규모 × 목적지 Matrix
│   └── site_config.json              # 사이트명, 대표번호(1533-8054), 카테고리 설정
├── scripts/
│   ├── generate_post.mjs             # Gemini AI 기반 자동 포스팅 엔진
│   ├── upload_to_hostinger.py        # 호스팅어 SFTP 자동 배포 스크립트
│   └── run_daily.bat                 # 윈도우 원클릭 실행 파일
├── .github/workflows/
│   └── daily-post.yml                # 매일 아침 08:30 무인 자동 발행 & 배포 워크플로우
├── robots.txt                        # GPTBot, PerplexityBot 등 AI 크롤러 친화적 robots.txt
├── sitemap.xml                       # 새 글 발행 시 실시간 자동 갱신되는 사이트맵
└── package.json                      # npm 실행 스크립트
```

---

## 🚀 로컬 실행 방법

### 1. 새 글 1편 작성
```bash
npm run post
```
또는 `scripts/run_daily.bat`을 더블 클릭하여 실행할 수 있습니다.

### 2. 호스팅어 서버 배포 (필요시)
```bash
npm run deploy
```

---

## ☁️ GitHub Actions 클라우드 무인 자동화 설정

컴퓨터를 켜두지 않아도 **매일 오전 8시 30분(KST)** 에 GitHub 클라우드가 자동으로 새 글을 작성하고 저장소에 저장합니다.

### 1. Git 저장소 초기화 및 GitHub 원격 저장소 연결
```bash
git init
git add .
git commit -m "Initial commit: tripmodu auto posting system"
git branch -M main
git remote add origin https://github.com/사용자계정/tripmodu.git
git push -u origin main
```

### 2. GitHub 저장소 Secrets 등록
GitHub 저장소 > **Settings** > **Secrets and variables** > **Actions** 에서 다음 항목을 추가합니다:

| Secret 이름 | 값 설명 | 예시 |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key (필수) | `AQ.Ab8...` |
| `FTP_SERVER` | 호스팅어 서버 IP (선택 배포용) | `145.79.25.99` |
| `FTP_USERNAME` | 호스팅어 계정 ID (선택 배포용) | `u687833262` |
| `FTP_PASSWORD` | 호스팅어 비밀번호 (선택 배포용) | `Mega9317!@` |

---

## 🔗 주요 확인 URL

- 메인 사이트: [https://tripmodu.kr/](https://tripmodu.kr/)
- 단체여행 정보마당 허브: [https://tripmodu.kr/posts/](https://tripmodu.kr/posts/)
- 무료 견적 신청: [https://tripmodu.kr/#inquiry](https://tripmodu.kr/#inquiry)
- 사이트맵: [https://tripmodu.kr/sitemap.xml](https://tripmodu.kr/sitemap.xml)
- 로봇 설정: [https://tripmodu.kr/robots.txt](https://tripmodu.kr/robots.txt)
- 단체 전문 상담 센터: **1533-8054**
