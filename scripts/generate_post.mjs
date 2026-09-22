import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. 순수 내장 파일 시스템을 활용한 경량 .env 파서
function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const eqIdx = trimmed.indexOf('=');
        const k = trimmed.slice(0, eqIdx).trim();
        const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
}

loadEnv(path.join(rootDir, '.env'));
loadEnv(path.join(rootDir, '..', 'car-direct.kr', '.env'));
loadEnv(path.join(rootDir, '..', 'saehanccm.com(githup 자동포스팅중)', '.env'));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ 오류: GEMINI_API_KEY 환경변수가 설정되지 않았습니다. .env 파일에 키를 입력해주세요.');
  process.exit(1);
}

// 2. 기존 포스트 목록 및 설정 로드
const postsFilePath = path.join(rootDir, 'data', 'posts.json');
let existingPosts = [];
try {
  if (fs.existsSync(postsFilePath)) {
    existingPosts = JSON.parse(fs.readFileSync(postsFilePath, 'utf-8'));
  }
} catch (e) {
  console.warn('⚠️ posts.json 읽기 실패, 신규 초기화:', e.message);
}

const topicsFilePath = path.join(rootDir, 'data', 'topics_tripmodu_seo_geo.json');
const topicsData = JSON.parse(fs.readFileSync(topicsFilePath, 'utf-8'));

const siteConfigFilePath = path.join(rootDir, 'data', 'site_config.json');
const siteConfig = JSON.parse(fs.readFileSync(siteConfigFilePath, 'utf-8'));

console.log(`📊 현재 등록된 단체여행 칼럼 수: ${existingPosts.length}개`);

// 3. 중복되지 않는 새로운 토픽 조합 무작위 선정
const existingTitles = existingPosts.map(p => p.title).join(' | ');
const existingSlugs = new Set(existingPosts.map(p => p.id));

const randomCategory = topicsData.categories[Math.floor(Math.random() * topicsData.categories.length)];
const randomSubtopic = randomCategory.subtopics[Math.floor(Math.random() * randomCategory.subtopics.length)];
const randomDestination = topicsData.destinations[Math.floor(Math.random() * topicsData.destinations.length)];
const randomGroupSize = topicsData.groupSizes[Math.floor(Math.random() * topicsData.groupSizes.length)];
const randomTheme = topicsData.tripThemes[Math.floor(Math.random() * topicsData.tripThemes.length)];
const randomTemplate = topicsData.curatedTopicTemplates[Math.floor(Math.random() * topicsData.curatedTopicTemplates.length)];

// 오늘 날짜 (KST 기준)
const now = new Date();
const kstOffset = 9 * 60; // UTC+9
const kstTime = new Date(now.getTime() + (now.getTimezoneOffset() + kstOffset) * 60000);
const yyyy = kstTime.getFullYear();
const mm = String(kstTime.getMonth() + 1).padStart(2, '0');
const dd = String(kstTime.getDate()).padStart(2, '0');
const todayIso = `${yyyy}-${mm}-${dd}`;
const todayFormatted = `${yyyy}년 ${Number(mm)}월 ${Number(dd)}일`;

// 4. Gemini 프롬프트 구성 (SEO & GEO & 단체여행 견적 전환 최적화)
const prompt = `
당신은 공공기관, 기업 워크샵, 협회, 대가족 단체 맞춤 여행 전문 플랫폼 "${siteConfig.siteName}"의 15년 경력 공인 단체여행 수석 기획 총괄 디렉터입니다.
Google 검색, 네이버 서치어드바이저, 그리고 Perplexity, ChatGPT Search, Google AI Overviews 등 최신 생성형 AI 검색(GEO)에 최적화된 심층 단체여행 실무 칼럼 아티클을 1편 작성해주세요.

[타깃 주제 및 컨텍스트]:
- 주요 카테고리: ${randomCategory.name} (ID: ${randomCategory.id})
- 세부 주제: ${randomSubtopic}
- 주요 목적지/지역: ${randomDestination}
- 인원 규모: ${randomGroupSize}
- 여행 테마: ${randomTheme}
- 참고 템플릿: ${randomTemplate.titleTemplate} (포커스: ${randomTemplate.focus})
- 무료 견적 문의 URL: ${siteConfig.ctaUrl}
- 대표 상담 전화: ${siteConfig.ctaPhone}

[기존 발행된 글 제목 목록 (동일하거나 유사한 제목 절대 중복 금지)]:
${existingTitles || '없음 (첫 번째 칼럼)'}

[핵심 작성 가이드라인 (SEO & GEO & B2B/B2C 신뢰도 극대화)]:
1. **타이틀(title)**: 검색엔진 클릭률(CTR)과 생성형 AI의 사용자 질문에 가장 잘 부합하는 명확하고 매력적인 제목 (30~55자). 구체적인 인원, 기간, 지역, 핵심 혜택을 포함하세요 (예: "제주도 30인 기업 워크샵 2박 3일 추천 일정 및 1인당 예산표", "공공기관 해외연수 과업지시서 및 비교견적 필수 체크리스트").
2. **요약문(summary)**: 2~3문장(100~140자)으로 작성. AI 검색 엔진(Perplexity, ChatGPT 등)이 즉각 인용할 수 있는 명쾌한 결론(Direct Answer) 형태로 서술.
3. **slug(id)**: 영문 소문자, 숫자, 하이픈(-)만 사용하여 3~5단어로 구성 (예: jeju-workshop-30p-budget-guide).
4. **본문 HTML(contentHtml)**:
   - 본문 시작 부분에 반드시 <div class="geo-summary-box"><div class="geo-summary-title">💡 3줄 핵심 요약 (AI Direct Answer)</div><p class="geo-summary-desc">...</p></div> 포함
   - 각 소주제는 <h2>, 세부 항목은 <h3> 사용
   - <div class="geo-table-wrapper"><table>...</table></div> 형태로 구조화된 비교표(예: 타임테이블 일정표, 1인당 항목별 예산 비교표, 또는 일반 패키지 vs 트립모두 맞춤 단독 투어 비교표) 필수 1개 이상 포함
   - <div class="notice-box tip"><div class="notice-title">💡 단체여행 전문가 실무 팁</div><p>...</p></div> 또는 <div class="notice-box warning"><div class="notice-title">⚠️ 총무/담당자 주의사항</div><p>...</p></div> 강조 블록 1개 이상 포함
   - 본문 중간에 자연스럽게 1:1 맞춤 견적 문의 CTA 배너 배치:
     <div class="intext-cta-banner"><h4>복잡한 단체여행 준비, 전문가에게 맡기고 안심하세요</h4><p>인원수, 예산, 목적에 맞춘 1:1 전담 설계와 투명한 비교견적서를 무료로 제공해 드립니다.</p><a href="${siteConfig.ctaUrl}" class="btn-cta-large">⚡ 무료 맞춤 견적 신청하기 (전화: ${siteConfig.ctaPhone})</a></div>
   - 공공기관/기업에 필요한 행정 절차(비교견적서, 전자세금계산서, 계약이행보증보험, 여행자보험 등) 전문적인 실무 언급 포함
5. **자주 묻는 질문(faqs)**:
   - 실제 단체여행 기획자(총무팀, 인사팀, 주무관, 가족대표)가 검색창이나 AI에 질문할 법한 실전 질문 3~4개와 각 2~3문장의 명쾌한 팩트 답변
`;

// 5. 가용 모델 탐색 함수
async function getAvailableModel() {
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);
    if (listRes.ok) {
      const data = await listRes.json();
      const models = (data.models || [])
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      
      console.log('🤖 지원 모델 목록 확인:', models.slice(0, 5).join(', '));
      const priorityOrder = ['gemini-3.5-flash-lite', 'gemini-2.5-pro', 'gemini-2.5-flash'];
      for (const p of priorityOrder) {
        if (models.includes(p)) return p;
      }
      if (models.length > 0) return models[0];
    }
  } catch (e) {
    console.warn('⚠️ 모델 목록 조회 예외, 기본 모델군 시도:', e.message);
  }
  return 'gemini-2.5-flash';
}

function safeJsonParse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, match => {
      if (match === '\n') return '\\n';
      if (match === '\r') return '\\r';
      if (match === '\t') return '\\t';
      return '';
    });
    return JSON.parse(cleaned);
  }
}

// 6. Gemini 호출 및 포스트 생성
async function generateArticle() {
  console.log('🔍 Gemini 최적 모델 탐색 중...');
  const bestModel = await getAvailableModel();
  console.log(`✨ 선택된 AI 모델: ${bestModel}`);

  const candidateModels = [bestModel, 'gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-pro'];
  const uniqueModels = [...new Set(candidateModels)];

  let rawText = null;
  let lastError = null;

  for (const model of uniqueModels) {
    try {
      console.log(`📡 [${model}] 단체여행 전문 칼럼 생성 요청 전송...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING", description: "영문 소문자와 하이픈으로 구성된 고유 slug" },
                title: { type: "STRING", description: "SEO 및 클릭률에 최적화된 기사 제목" },
                summary: { type: "STRING", description: "2~3문장의 핵심 요약 (AI Direct Answer용)" },
                keywords: { type: "STRING", description: "콤마로 구분된 핵심 키워드 5~7개" },
                category: { type: "STRING", description: "workshop, public, association, family, guide 중 하나" },
                categoryName: { type: "STRING", description: "카테고리 한글명" },
                destination: { type: "STRING", description: "관련 목적지 또는 '전국/국외'" },
                groupSize: { type: "STRING", description: "관련 인원 규모" },
                contentHtml: { type: "STRING", description: "h2, h3, 비교표, 요약박스, 팁/주의박스, 배너가 포함된 본문 HTML" },
                faqs: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      question: { type: "STRING", description: "자주 묻는 질문" },
                      answer: { type: "STRING", description: "명확한 팩트 답변" }
                    },
                    required: ["question", "answer"]
                  }
                }
              },
              required: ["id", "title", "summary", "keywords", "category", "categoryName", "destination", "groupSize", "contentHtml", "faqs"]
            }
          }
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.warn(`⚠️ [${model}] 응답 에러 (${response.status}): ${errBody.slice(0, 150)}...`);
        lastError = new Error(`Status ${response.status}: ${errBody}`);
        continue;
      }

      const data = await response.json();
      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        console.log(`✅ [${model}] 칼럼 콘텐츠 생성 성공!`);
        break;
      }
    } catch (err) {
      console.warn(`⚠️ [${model}] 호출 실패:`, err.message);
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error('모든 Gemini 모델 호출에 실패했습니다.');
  }

  const postData = safeJsonParse(rawText);

  // slug 정제 및 중복 방지
  let slug = (postData.id || `group-travel-guide-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (existingSlugs.has(slug)) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }
  postData.id = slug;
  postData.date = todayIso;
  postData.formattedDate = todayFormatted;

  console.log(`🎉 생성 완료: [${postData.categoryName} | ${postData.destination}] ${postData.title}`);

  // 7. Schema.org FAQ 및 Article JSON-LD 생성
  const faqSchemaItems = (postData.faqs || []).map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }));

  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": postData.title,
      "description": postData.summary,
      "keywords": postData.keywords,
      "datePublished": `${todayIso}T08:30:00+09:00`,
      "dateModified": `${todayIso}T08:30:00+09:00`,
      "author": {
        "@type": "Organization",
        "name": siteConfig.companyInfo?.companyName || "트립모두",
        "url": siteConfig.siteUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": siteConfig.brandShort || "트립모두",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteConfig.siteUrl}/images/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${siteConfig.siteUrl}/posts/${slug}/`
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqSchemaItems
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "트립모두",
          "item": `${siteConfig.siteUrl}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "단체여행 칼럼",
          "item": `${siteConfig.siteUrl}/posts/`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": postData.categoryName,
          "item": `${siteConfig.siteUrl}/posts/?category=${postData.category}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": postData.title,
          "item": `${siteConfig.siteUrl}/posts/${slug}/`
        }
      ]
    }
  ];

  // FAQ HTML 렌더링
  const faqHtml = (postData.faqs || []).map(item => `
    <div class="faq-item">
      <div class="faq-question">❓ ${item.question}</div>
      <div class="faq-answer">${item.answer}</div>
    </div>
  `).join('');

  // 8. 개별 아티클 정적 HTML 파일 생성
  const postDir = path.join(rootDir, 'posts', slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }

  const htmlContent = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${postData.title} | ${siteConfig.brandShort}</title>
  <meta name="description" content="${postData.summary}" />
  <meta name="keywords" content="${postData.keywords}" />
  <link rel="canonical" href="${siteConfig.siteUrl}/posts/${slug}/" />

  <!-- 오픈그래프 (SNS / 카카오톡 공유) -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${siteConfig.siteUrl}/posts/${slug}/" />
  <meta property="og:title" content="${postData.title}" />
  <meta property="og:description" content="${postData.summary}" />
  <meta property="og:image" content="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" />

  <!-- 웹폰트 및 스타일시트 -->
  <link rel="stylesheet" href="/posts/assets/style.css" />

  <!-- Schema.org 구조화 데이터 (Article, FAQPage, BreadcrumbList) -->
  <script type="application/ld+json">
  ${JSON.stringify(jsonLdData, null, 2)}
  </script>
</head>

<body>
  <!-- 상단 네비게이션 헤더 -->
  <header class="site-header">
    <div class="header-container">
      <a href="/" class="brand-logo" title="트립모두 메인으로 이동">
        <span class="logo-text">TripModu</span>
        <span class="brand-badge">단체여행 전문</span>
        <span class="brand-sub">실무 칼럼</span>
      </a>
      <div class="header-actions">
        <ul class="header-nav-links">
          <li><a href="/#about" class="nav-link">서비스 소개</a></li>
          <li><a href="/#features" class="nav-link">특장점</a></li>
          <li><a href="/posts/" class="nav-link active" style="color: var(--accent); font-weight: 700;">단체여행 칼럼</a></li>
          <li><a href="/#inquiry" class="nav-link">견적 문의</a></li>
        </ul>
        <a href="${siteConfig.ctaUrl}" class="btn-cta-header">
          <span>⚡ 무료 맞춤 견적</span>
        </a>
      </div>
    </div>
  </header>

  <!-- 아티클 본문 영역 -->
  <article class="article-container">
    <!-- 빵부스러기 네비게이션 -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">홈</a> &gt;
      <a href="/posts/">단체여행 칼럼</a> &gt;
      <a href="/posts/?category=${postData.category}">${postData.categoryName}</a> &gt;
      <span>${postData.destination}</span>
    </nav>

    <!-- 글 헤더 -->
    <header class="article-header">
      <div class="article-meta-tags">
        <span class="badge-cat">${postData.categoryName}</span>
        <span class="badge-tag">📍 ${postData.destination}</span>
        <span class="badge-tag">👥 ${postData.groupSize}</span>
      </div>
      <h1 class="article-title">${postData.title}</h1>
      <div class="article-meta-info">
        <span>✍️ 트립모두 단체여행 기획본부</span>
        <span>📅 ${postData.formattedDate}</span>
        <span>⏱️ 소요시간 약 4분</span>
      </div>
    </header>

    <!-- 아티클 본문 -->
    <section class="article-body">
      ${postData.contentHtml}

      <!-- GEO FAQ 섹션 -->
      <div class="geo-faq-section">
        <h3 class="geo-faq-title">❓ 자주 묻는 질문 (FAQ)</h3>
        <div class="faq-list">
          ${faqHtml}
        </div>
      </div>

      <!-- 본문 하단 전환 CTA 배너 -->
      <div class="cta-banner-box">
        <h3>복잡한 단체여행 준비, 트립모두와 함께라면 쉽고 안전합니다</h3>
        <p>인원수, 예산, 일정에 꼭 맞춘 전담 1:1 맞춤 견적과 세부 일정표를 무료로 받아보세요.</p>
        <div class="cta-buttons">
          <a href="${siteConfig.ctaUrl}" class="btn-cta-quote">
            <span>⚡ 무료 맞춤 견적 신청하기</span>
          </a>
          <a href="/posts/" class="btn-cta-sub">
            <span>다른 단체여행 팁 보기</span>
          </a>
        </div>
      </div>

      <!-- 신뢰도 및 행정 고지 박스 -->
      <div class="compliance-box">
        <p>※ (주)트립가자 트립모두는 관광진흥법에 따라 등록된 공인 종합관광사업자(관광사업등록번호: 제2022-37호)입니다.</p>
        <p>※ 공공기관 및 기업 고객을 위한 계약이행보증보험 발행, 전자세금계산서, 투명한 비교견적서 서류 처리를 완벽하게 지원합니다.</p>
        <p>※ 단체 전문 상담 센터: <strong>1533-8054</strong> (평일 10:00 ~ 17:00 / 이메일: tripgaja@naver.com)</p>
      </div>
    </section>
  </article>

  <!-- 푸터 -->
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-top">
        <div>
          <div class="footer-brand">TripModu (트립모두)</div>
          <p style="margin-top: 6px; color: #cbd5e1;">(주)트립가자 | 대표: 김승규 | 사업자등록번호: 530-81-02492</p>
          <p style="margin-top: 4px;">관광사업등록번호: 제2022-37호 | 통신판매업신고: 제2022-서울강남-02972호</p>
          <p style="margin-top: 4px;">주소: 서울시 강남구 테헤란로 116, 10층 1069호 (역삼동, 동경빌딩)</p>
        </div>
        <div style="text-align: right;">
          <div style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 4px;">단체 전문 상담 센터</div>
          <div class="footer-phone">1533-8054</div>
          <p style="margin-top: 4px; font-size: 0.85rem;">평일 10:00 ~ 17:00 (이메일: tripgaja@naver.com)</p>
        </div>
      </div>
      <p class="footer-legal">© 2025-2026 TripModu. All rights reserved. 본 칼럼 콘텐츠는 단체여행 기획자의 올바른 의사결정을 돕기 위해 공인된 관광사업자 (주)트립가자에서 제작 및 관리합니다.</p>
    </div>
  </footer>

  <!-- 모바일 하단 고정 견적문의 바 -->
  <aside class="mobile-sticky-bar">
    <a href="${siteConfig.ctaUrl}" class="mobile-quote-btn">
      <span>⚡ 단체 맞춤여행 무료 견적 신청하기</span>
    </a>
  </aside>

  <script src="/posts/assets/script.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(postDir, 'index.html'), htmlContent, 'utf-8');
  console.log(`💾 HTML 파일 저장 완료: posts/${slug}/index.html`);

  // 9. data/posts.json 업데이트
  const updatedPosts = [
    {
      id: postData.id,
      title: postData.title,
      summary: postData.summary,
      category: postData.category,
      categoryName: postData.categoryName,
      destination: postData.destination,
      groupSize: postData.groupSize,
      keywords: postData.keywords,
      date: postData.date,
      formattedDate: postData.formattedDate,
      url: `/posts/${slug}/`
    },
    ...existingPosts.filter(p => p.id !== postData.id)
  ];
  fs.writeFileSync(postsFilePath, JSON.stringify(updatedPosts, null, 2), 'utf-8');
  console.log(`💾 data/posts.json 갱신 완료 (총 ${updatedPosts.length}개)`);

  // 10. posts/index.html 카드 그리드 정적 재렌더링
  updateHubPage(updatedPosts);

  // 11. sitemap.xml 자동 업데이트
  updateSitemap(updatedPosts);

  console.log('🏁 모든 포스팅 파이프라인 작업이 완료되었습니다.');
}

// 허브 페이지(posts/index.html)에 최신 카드 리스트 반영
function updateHubPage(posts) {
  const hubPath = path.join(rootDir, 'posts', 'index.html');
  if (!fs.existsSync(hubPath)) return;

  let hubHtml = fs.readFileSync(hubPath, 'utf-8');

  const cardsHtml = posts.map(p => `
      <article class="post-card" data-category="${p.category}">
        <div class="card-top">
          <span class="badge-cat">${p.categoryName}</span>
          <span class="badge-tag">📍 ${p.destination || '국내/해외'}</span>
          <span class="card-date">${p.date}</span>
        </div>
        <h3 class="card-title">
          <a href="/posts/${p.id}/">${p.title}</a>
        </h3>
        <p class="card-summary">${p.summary}</p>
        <div class="card-footer">
          <a href="/posts/${p.id}/">실무 가이드 읽기 <span class="arrow">→</span></a>
        </div>
      </article>
  `).join('\n');

  const startMarker = '<!-- POSTS_CONTAINER_START -->';
  const endMarker = '<!-- POSTS_CONTAINER_END -->';

  const startIndex = hubHtml.indexOf(startMarker);
  const endIndex = hubHtml.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    const newHubHtml = hubHtml.slice(0, startIndex + startMarker.length) +
      '\n' + cardsHtml + '\n      ' +
      hubHtml.slice(endIndex);
    fs.writeFileSync(hubPath, newHubHtml, 'utf-8');
    console.log(`💾 posts/index.html 허브 카드 리스트 갱신 완료 (${posts.length}개 카드)`);
  }
}

// sitemap.xml 자동 갱신
function updateSitemap(posts) {
  const sitemapPath = path.join(rootDir, 'sitemap.xml');
  const baseUrl = siteConfig.siteUrl || 'https://tripmodu.kr';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 메인 홈페이지 -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 단체여행 칼럼 허브 -->
  <url>
    <loc>${baseUrl}/posts/</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

  posts.forEach(p => {
    xml += `  <url>
    <loc>${baseUrl}/posts/${p.id}/</loc>
    <lastmod>${p.date || todayIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  });

  xml += `</urlset>\n`;
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  console.log(`💾 sitemap.xml 갱신 완료 (총 ${posts.length + 2}개 URL 등록)`);
}

generateArticle().catch(err => {
  console.error('❌ 포스트 생성 중 오류 발생:', err);
  process.exit(1);
});
