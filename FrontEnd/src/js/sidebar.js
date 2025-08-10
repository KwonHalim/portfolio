'use strict';

// 사이드바 초기화 함수
export function initializeSidebar() {
  // sidebar variables
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  // sidebar toggle functionality for mobile
  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () { 
      elementToggleFunc(sidebar); 
    });
  }
}

// window 객체에도 할당 (기존 코드와의 호환성을 위해)
window.initializeSidebar = initializeSidebar; 