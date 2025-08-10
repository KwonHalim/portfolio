'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// 페이지 로드 시 컴포넌트 로드 함수
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
    
    // 컴포넌트 로드 후 이벤트 리스너 재바인딩
    if (elementId === 'sidebar-container') {
      initializeSidebar();
    } else if (elementId === 'navbar-container') {
      initializeNavigation();
    } else if (elementId === 'projects-container') {
      initializeProjects();
    } else if (elementId === 'contact-container') {
      initializeContact();
    } else if (elementId === 'about-container') {
      initializeChatbot();
    }
  } catch (error) {
    console.error('컴포넌트 로드 실패:', error);
  }
}

// 모든 이벤트 리스너 초기화 함수
export function initializeAllEventListeners() {
  console.log('이벤트 리스너 초기화 시작...');
  
  // 사이드바 토글
  const sidebarToggle = document.querySelector("[data-nav-toggler]");
  const sidebar = document.querySelector("[data-sidebar]");
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", function () { elementToggleFunc(sidebar); });
  }
  
  // 모바일 메뉴 토글
  const mobileMenuToggle = document.querySelector("[data-nav-toggler]");
  const mobileMenu = document.querySelector("[data-sidebar]");
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", function () { elementToggleFunc(mobileMenu); });
  }
  
  // 스크롤 이벤트
  const header = document.querySelector("[data-header]");
  if (header) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 100) {
        header.classList.add("active");
      } else {
        header.classList.remove("active");
      }
    });
  }
  
  // 스무스 스크롤
  const links = document.querySelectorAll("[data-nav-link]");
  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  
  // 사이드바와 네비게이션 초기화
  if (typeof window.initializeSidebar === 'function') {
    window.initializeSidebar();
  }
  if (typeof window.initializeNavigation === 'function') {
    window.initializeNavigation();
  }
  
  console.log('이벤트 리스너 초기화 완료');
}

// 컴포넌트 로드 함수들
export async function loadSidebar() {
  await loadComponent('sidebar-container', './src/components/sidebar.html');
}

export async function loadNavbar() {
  await loadComponent('navbar-container', './src/components/navbar.html');
}

export async function loadProjects() {
  await loadComponent('projects-container', './src/pages/projects.html');
}

export async function loadContact() {
  await loadComponent('contact-container', './src/pages/contact.html');
}

export async function loadAbout() {
  await loadComponent('about-container', './src/pages/about.html');
}

// 전역 함수들 (기존 코드와의 호환성을 위해)
window.elementToggleFunc = elementToggleFunc;
window.loadComponent = loadComponent; 