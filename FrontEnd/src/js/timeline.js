/**
 * Timeline functionality
 */

function initializeTimeline() {
  const timelineItems = document.querySelectorAll('[data-timeline-item]');
  
  timelineItems.forEach(item => {
    const header = item.querySelector('.timeline-item-header');
    const detailContent = item.querySelector('.timeline-detail-content');
    
    if (header && detailContent) {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTimelineDetail(item, header, detailContent);
      });
    }
  });
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