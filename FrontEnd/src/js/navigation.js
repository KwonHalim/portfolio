'use strict';

// 네비게이션 초기화 함수
function initializeNavigation() {
  // page navigation variables
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  // add event to all nav link
  navigationLinks.forEach((link, index) => {
    link.addEventListener("click", function () {
      const clickedPage = this.innerHTML.toLowerCase();
      
      pages.forEach(page => {
        if (page.dataset.page === clickedPage) {
          page.classList.add("active");
        } else {
          page.classList.remove("active");
        }
      });

      navigationLinks.forEach(navLink => {
        if (navLink === this) {
          navLink.classList.add("active");
        } else {
          navLink.classList.remove("active");
        }
      });

      // 프로젝트 페이지로 이동할 때 ProjectManager 초기화
      if (clickedPage === 'projects') {
        console.log('프로젝트 페이지로 이동됨');
        setTimeout(() => {
          if (!window.projectManager) {
            console.log('ProjectManager 새로 초기화');
            window.projectManager = new ProjectManager();
          } else {
            console.log('기존 ProjectManager 사용');
            window.projectManager.loadProjects(true);
          }
        }, 100);
      }

      window.scrollTo(0, 0);
    });
  });
} 