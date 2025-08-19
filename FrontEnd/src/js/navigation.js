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

// 캐시 유효시간 (3시간 = 3 * 60 * 60 * 1000 밀리초)
const CACHE_TTL = 3 * 60 * 60 * 1000;

// 디바운싱 시간 (1초)
const DEBOUNCE_DELAY = 1000;

// sessionStorage에서 캐시 복원 (브라우저 종료 시 자동 삭제)
function restoreCacheFromSession() {
  try {
    const cachedData = sessionStorage.getItem('pageCache');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const now = Date.now();
      
      // 유효한 캐시만 복원
      Object.keys(parsed).forEach(page => {
        if ((now - parsed[page].timestamp) < CACHE_TTL) {
          pageCache[page] = parsed[page];
        }
      });
    }
  } catch (error) {
    // 캐시 복원 실패 시 조용히 처리
  }
}

// sessionStorage에 캐시 저장
function saveCacheToSession() {
  try {
    sessionStorage.setItem('pageCache', JSON.stringify(pageCache));
  } catch (error) {
    // 캐시 저장 실패 시 조용히 처리
  }
}

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
  
  // sessionStorage에 저장
  saveCacheToSession();
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
  
  // 캐시가 유효하면 API 요청하지 않음
  if (isCacheValid(page)) {
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
    // 페이지: API 요청 실패
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
    // 캐시된 데이터로 즉시 표시 (애니메이션은 유지됨)
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
const RAPID_CLICK_THRESHOLD = 5000; // 5초 이내 재클릭 제한

function loadPageDataSafely(page) {
  // 해당 페이지의 요청 상태 확인
  if (pageRequestStates[page]) {
    return;
  }
  
  // 캐시가 유효하면 API 요청하지 않음
  if (isCacheValid(page)) {
    return;
  }
  
  const now = Date.now();
  
  // 같은 페이지를 2.5초 이내에 다시 클릭하면 백엔드 요청 무시 (애니메이션만 실행)
  if (lastRequestedPage === page && (now - lastRequestTime) < RAPID_CLICK_THRESHOLD) {
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
  // sessionStorage에서 캐시 복원
  restoreCacheFromSession();
  
  const navigationLinks = document.querySelectorAll("[data-nav-link]");

  // add event to all nav link
  navigationLinks.forEach((link, index) => {
    link.addEventListener("click", function () {
      const clickedPage = this.innerHTML.toLowerCase();
      
      // 클릭한 링크에 회전 애니메이션 적용
      this.style.animation = 'rotate-hor-center 0.5s cubic-bezier(0.455, 0.030, 0.515, 0.955) both';
      
      // 애니메이션 완료 후 스타일 제거
      setTimeout(() => {
        this.style.animation = '';
      }, 500);
      
      // 즉시 네비게이션 처리 (애니메이션 + 캐시 확인)
      handleNavigation(clickedPage);
      
      // 백엔드 요청 제어 (2.5초 이내 재클릭 시 무시)
      loadPageDataSafely(clickedPage);
    });
  });
  
  // 네비게이션 초기화 완료 - 캐시 시스템 활성화
} 