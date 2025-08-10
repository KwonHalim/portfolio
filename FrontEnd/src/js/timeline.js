/**
 * Timeline functionality
 */

// 타임라인 초기화 함수
export function initializeTimeline() {
  console.log('타임라인 초기화 시작...');
  
  // 페이지 로드 시 타임라인 데이터 로드
  if (typeof loadTimelineData === 'function') {
    loadTimelineData();
  } else {
    console.log('loadTimelineData 함수를 찾을 수 없습니다.');
  }
  
  console.log('타임라인 초기화 완료');
}

function toggleTimelineDetail(item, header, content) {
  const isActive = content.classList.contains('active');
  
  // Close all other timeline details
  const allTimelineItems = document.querySelectorAll('[data-timeline-item]');
  allTimelineItems.forEach(otherItem => {
    if (otherItem !== item) {
      const otherContent = otherItem.querySelector('.timeline-detail-content');
      const otherHeader = otherItem.querySelector('.timeline-item-header');
      
      if (otherContent && otherHeader) {
        otherContent.classList.remove('active');
        otherHeader.classList.remove('active');
      }
    }
  });
  
  // Toggle current timeline detail
  if (isActive) {
    content.classList.remove('active');
    header.classList.remove('active');
  } else {
    content.classList.add('active');
    header.classList.add('active');
  }
}

// 타임라인 데이터 로드 후 기능 재초기화를 위한 함수
function reinitializeTimeline() {
  // 기존 이벤트 리스너 제거 (중복 방지)
  const timelineItems = document.querySelectorAll('[data-timeline-item]');
  timelineItems.forEach(item => {
    const header = item.querySelector('.timeline-item-header');
    if (header) {
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);
    }
  });
  
  // 새로운 이벤트 리스너 바인딩
  initializeTimeline();
}

// Initialize timeline when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeTimeline();
});

// 전역 함수로 노출 (API에서 호출할 수 있도록)
window.reinitializeTimeline = reinitializeTimeline; 

// window 객체에도 할당 (기존 코드와의 호환성을 위해)
window.initializeTimeline = initializeTimeline; 