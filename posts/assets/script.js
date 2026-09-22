// TripModu 허브 페이지 상호작용 스크립트 (검색, 카테고리 필터링)
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('hubSearchInput');
  const catButtons = document.querySelectorAll('.cat-btn');
  const postCards = document.querySelectorAll('.post-card');
  const visibleCountEl = document.getElementById('visiblePostCount');

  let currentCategory = 'all';
  let searchQuery = '';

  // URL 파라미터에서 초기 카테고리 확인
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory) {
    currentCategory = initialCategory;
    catButtons.forEach(btn => {
      if (btn.getAttribute('data-category') === initialCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function filterPosts() {
    let visibleCount = 0;

    postCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.card-title')?.innerText.toLowerCase() || '';
      const cardSummary = card.querySelector('.card-summary')?.innerText.toLowerCase() || '';
      const cardText = `${cardTitle} ${cardSummary}`;

      const matchesCat = (currentCategory === 'all') || (cardCategory === currentCategory);
      const matchesSearch = !searchQuery || cardText.includes(searchQuery.toLowerCase());

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCountEl) {
      visibleCountEl.innerText = `총 ${visibleCount}개의 칼럼`;
    }
  }

  // 검색어 입력 이벤트
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      filterPosts();
    });
  }

  // 카테고리 탭 클릭 이벤트
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');

      // URL 갱신
      if (currentCategory === 'all') {
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        window.history.replaceState({}, '', `?category=${currentCategory}`);
      }

      filterPosts();
    });
  });

  // 초기 필터링 실행
  filterPosts();
});
