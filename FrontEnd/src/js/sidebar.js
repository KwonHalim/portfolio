'use strict';

// 사이드바 초기화 함수
function initializeSidebar() {
  // sidebar variables
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  // sidebar toggle functionality for mobile
  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () { 
      // 360도 회전 애니메이션 추가
      sidebarBtn.style.animation = 'rotate360 0.6s ease-in-out';
      
      // 애니메이션 완료 후 사이드바 토글
      setTimeout(() => {
        elementToggleFunc(sidebar);
        sidebarBtn.style.animation = '';
      }, 300);
    });
  }
} 