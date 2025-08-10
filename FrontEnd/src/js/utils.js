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
  // initializeAbout(); // about 관련 초기화는 별도로 처리
} 

// 3D 회전 효과를 위한 함수들
function init3DEffect() {
  const serviceItems = document.querySelectorAll('.service-item');
  
  serviceItems.forEach(item => {
    item.addEventListener('mousemove', handleMouseMove);
    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);
  });
}

function handleMouseMove(e) {
  const item = e.currentTarget;
  const rect = item.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 마우스 위치를 -1에서 1 사이의 값으로 정규화
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -15;
  const rotateY = ((x - centerX) / centerX) * 20;
  
  item.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
}

function handleMouseEnter(e) {
  const item = e.currentTarget;
  item.style.transition = 'transform 0.3s ease';
}

function handleMouseLeave(e) {
  const item = e.currentTarget;
  item.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
  item.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
}

// 페이지 로드 시 3D 효과 초기화
document.addEventListener('DOMContentLoaded', function() {
  init3DEffect();
}); 