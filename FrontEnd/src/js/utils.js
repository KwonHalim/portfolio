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

// 페이지 초기화 함수
async function initializePage() {
  // 사이드바 컴포넌트 로드
  await loadComponent('sidebar-container', './src/components/sidebar.html');
  
  // 네비게이션 바 컴포넌트 로드
  await loadComponent('navbar-container', './src/components/navbar.html');
  
  // 페이지 컴포넌트들 로드
  await loadComponent('about-container', './src/pages/about.html');
  await loadComponent('resume-container', './src/pages/resume.html');
  await loadComponent('projects-container', './src/pages/projects.html');
  await loadComponent('blog-container', './src/pages/blog.html');
  await loadComponent('contact-container', './src/pages/contact.html');
  
  // 모든 컴포넌트 로드 후 이벤트 리스너 초기화
  initializeAllEventListeners();
}

// 모든 이벤트 리스너 초기화
function initializeAllEventListeners() {
  initializeSidebar();
  initializeNavigation();
  // initializeProjects(); // projects.js에서 자체적으로 처리
  initializeChatbot();
  initializeAbout();
} 