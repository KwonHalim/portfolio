/**
 * Timeline functionality
 */
import { TIMELINE_API_URL } from './config.js';

// 타임라인 데이터를 가져오는 함수
async function fetchTimelineData() {
  try {
    const response = await fetch(TIMELINE_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.result; // ApiResponse의 result 필드
  } catch (error) {
    console.error('타임라인 데이터를 가져오는 중 오류가 발생했습니다:', error);
    return null;
  }
}

// 타임라인 데이터를 동적으로 렌더링하는 함수
async function loadTimelineData() {
  console.log('타임라인 데이터 로드 시작...');
  const timelineData = await fetchTimelineData();
  
  console.log('받은 타임라인 데이터:', timelineData);
  
  if (timelineData) {
    // Education 섹션 업데이트
    updateEducationSection(timelineData.educations);
    
    // Experience 섹션 업데이트
    updateExperienceSection(timelineData.experiences);
    
    // 타임라인 기능 재초기화
    if (window.reinitializeTimeline) {
      window.reinitializeTimeline();
    }
  }
}

// Education 섹션 업데이트 함수
function updateEducationSection(educations) {
  if (!educations || educations.length === 0) return;
  
  const educationContainer = document.querySelector('.education-list');
  if (!educationContainer) return;
  
  educationContainer.innerHTML = educations.map(education => `
    <li class="timeline-item" data-timeline-item>
      <div class="timeline-item-header">
        <h4 class="h4 timeline-item-title">${education.school_name}</h4>
        <time>${education.start_date} - ${education.end_date || '현재'}</time>
      </div>
      <div class="timeline-item-detail">
        <p>${education.major}</p>
        <p>${education.degree || ''}</p>
        <p>${education.description || ''}</p>
      </div>
    </li>
  `).join('');
}

// Experience 섹션 업데이트 함수
function updateExperienceSection(experiences) {
  if (!experiences || experiences.length === 0) return;
  
  const experienceContainer = document.querySelector('.experience-list');
  if (!experienceContainer) return;
  
  experienceContainer.innerHTML = experiences.map(experience => `
    <li class="timeline-item" data-timeline-item>
      <div class="timeline-item-header">
        <h4 class="h4 timeline-item-title">${experience.company_name}</h4>
        <time>${experience.start_date} - ${experience.end_date || '현재'}</time>
      </div>
      <div class="timeline-item-detail">
        <p>${experience.position}</p>
        <p>${experience.description || ''}</p>
      </div>
    </li>
  `).join('');
}

// 타임라인 초기화 함수
export function initializeTimeline() {
  console.log('타임라인 초기화 시작...');
  
  // 페이지 로드 시 타임라인 데이터 로드
  loadTimelineData();
  
  // 타임라인 아이템 클릭 이벤트 리스너 설정
  setTimeout(() => {
    const timelineItems = document.querySelectorAll('[data-timeline-item]');
    timelineItems.forEach(item => {
      const header = item.querySelector('.timeline-item-header');
      const content = item.querySelector('.timeline-item-detail');
      
      if (header && content) {
        header.addEventListener('click', () => {
          toggleTimelineDetail(item, header, content);
        });
      }
    });
  }, 1000); // 데이터 로드 후 이벤트 리스너 설정
  
  console.log('타임라인 초기화 완료');
}

function toggleTimelineDetail(item, header, content) {
  const isActive = content.classList.contains('active');
  
  // Close all other timeline details
  const allTimelineItems = document.querySelectorAll('[data-timeline-item]');
  allTimelineItems.forEach(otherItem => {
    if (otherItem !== item) {
      const otherContent = otherItem.querySelector('.timeline-item-detail');
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
window.loadTimelineData = loadTimelineData;

// window 객체에도 할당 (기존 코드와의 호환성을 위해)
window.initializeTimeline = initializeTimeline; 