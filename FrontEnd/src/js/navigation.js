'use strict';

// 네비게이션 초기화 함수
export function initializeNavigation() {
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
        // pageChanged 이벤트 발생
        const pageChangedEvent = new CustomEvent('pageChanged', {
          detail: { page: 'projects' }
        });
        document.dispatchEvent(pageChangedEvent);
      }

      window.scrollTo(0, 0);
    });
  });
}

// window 객체에도 할당 (기존 코드와의 호환성을 위해)
window.initializeNavigation = initializeNavigation; 