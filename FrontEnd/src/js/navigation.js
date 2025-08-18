'use strict';

// 캐시 및 디바운싱 관련 변수
let pageCache = {};
let debounceTimer = null;
let isNavigating = false;

// 페이지별 요청 상태 관리
let pageRequestStates = {
  'projects': false,
  'blog': false,
  'about': false,
  'contact': false,
  'resume': false
};

// 캐시 유효시간 (30초)
const CACHE_TTL = 30000;

// 디바운싱 시간 (1초)
const DEBOUNCE_DELAY = 1000;

// 캐시 유효성 확인
function isCacheValid(page) {
  const cache = pageCache[page];
  if (!cache) return false;
  
  const now = Date.now();
  return (now - cache.timestamp) < CACHE_TTL;
}

// 캐시 저장
function saveToCache(page, data) {
  pageCache[page] = {
    data: data,
    timestamp: Date.now()
  };
}

// 디바운싱 함수
function debounce(func, delay) {
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 페이지 데이터 로드 (백그라운드) - 상태 기반 제어 적용
async function loadPageData(page) {
  // 해당 페이지의 요청 상태 확인
  if (pageRequestStates[page]) {
    return;
  }
  
  // 요청 시작 - 상태 설정
  pageRequestStates[page] = true;
  
  try {
    // 여기서 실제 API 호출을 수행
    // 예: 프로젝트 데이터, 블로그 데이터 등
    let apiUrl;
    if (page === 'about') {
      apiUrl = window.appConfig.getAboutApiUrl();
    } else if (page === 'timeline') {
      apiUrl = window.appConfig.getTimelineApiUrl();
    } else {
      apiUrl = `${window.appConfig.getApiBaseUrl()}/api/${page}`;
    }
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // 캐시 업데이트
    saveToCache(page, data);
    
    // 데이터가 변경되었는지 확인하고 필요시 화면 업데이트
    updatePageIfNeeded(page, data);
    
  } catch (error) {
    // 에러 로그는 유지 (디버깅 필요시)
  } finally {
    // 요청 완료 - 상태 해제 (성공/실패 상관없이)
    pageRequestStates[page] = false;
  }
}

// 필요시에만 페이지 업데이트
function updatePageIfNeeded(page, newData) {
  const currentData = pageCache[page]?.data;
  
  // 데이터가 변경되었는지 확인 (간단한 비교)
  if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
    // 페이지가 현재 활성화되어 있다면 업데이트
    const activePage = document.querySelector('[data-page].active');
    if (activePage && activePage.dataset.page === page) {
      // 페이지별 업데이트 로직
      if (page === 'projects') {
        const pageChangedEvent = new CustomEvent('pageChanged', {
          detail: { page: 'projects', data: newData }
        });
        document.dispatchEvent(pageChangedEvent);
      }
      // 다른 페이지들에 대한 업데이트 로직 추가 가능
    }
  }
}

// 네비게이션 처리 함수
function handleNavigation(clickedPage) {
  if (isNavigating) {
    return;
  }
  
  isNavigating = true;
  
  // 페이지 전환 애니메이션 시작
  const pages = document.querySelectorAll("[data-page]");
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  
  // 활성 페이지 변경
  pages.forEach(page => {
    if (page.dataset.page === clickedPage) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });

  // 네비게이션 링크 활성화
  navigationLinks.forEach(navLink => {
    if (navLink.innerHTML.toLowerCase() === clickedPage) {
      navLink.classList.add("active");
    } else {
      navLink.classList.remove("active");
    }
  });

  // 캐시 확인 및 즉시 표시
  if (isCacheValid(clickedPage)) {
    // 캐시된 데이터로 즉시 표시
    if (clickedPage === 'projects') {
      const pageChangedEvent = new CustomEvent('pageChanged', {
        detail: { page: 'projects', data: pageCache[clickedPage].data }
      });
      document.dispatchEvent(pageChangedEvent);
    }
  } else {
    // 캐시가 없으면 로딩 표시 (필요시)
    if (clickedPage === 'projects') {
      const pageChangedEvent = new CustomEvent('pageChanged', {
        detail: { page: 'projects', loading: true }
      });
      document.dispatchEvent(pageChangedEvent);
    }
  }

  // 스크롤 맨 위로
  window.scrollTo(0, 0);
  
  // 네비게이션 완료
  setTimeout(() => {
    isNavigating = false;
  }, 100);
}

// 안전한 데이터 로드 함수 (상태 기반 제어 + 디바운싱)
let lastRequestedPage = null;
let lastRequestTime = 0;

function loadPageDataSafely(page) {
  // 해당 페이지의 요청 상태 확인
  if (pageRequestStates[page]) {
    return;
  }
  
  const now = Date.now();
  
  // 같은 페이지를 4초 이내에 다시 클릭하면 무시
  if (lastRequestedPage === page && (now - lastRequestTime) < 4000) {
    return;
  }
  
  // 다른 페이지를 1초 이내에 클릭하면 디바운싱 적용
  if (lastRequestedPage !== page && (now - lastRequestTime) < 1000) {
    debouncedLoadData(page);
    return;
  }
  
  // 요청 실행
  lastRequestedPage = page;
  lastRequestTime = now;
  loadPageData(page);
}

// 디바운싱된 데이터 로드 함수
const debouncedLoadData = debounce(loadPageData, DEBOUNCE_DELAY);

// 네비게이션 초기화 함수
function initializeNavigation() {
  const navigationLinks = document.querySelectorAll("[data-nav-link]");

  // add event to all nav link
  navigationLinks.forEach((link, index) => {
    link.addEventListener("click", function () {
      const clickedPage = this.innerHTML.toLowerCase();
      
      // 즉시 네비게이션 처리 (캐시 확인 포함)
      handleNavigation(clickedPage);
      
      // 안전한 백그라운드 데이터 로드 (상태 기반 제어 + 디바운싱)
      loadPageDataSafely(clickedPage);
    });
  });
} 