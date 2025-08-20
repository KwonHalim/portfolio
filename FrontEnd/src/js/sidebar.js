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

  // 3D Avatar 효과 초기화
  initializeAvatar3DEffect();
  
  // 프로필 이미지 모달 초기화
  initializeProfileModal();
  
  // 깃허브 잔디밭 3D 효과 초기화
  initializeGitHubGraph3D();
  
  // 깃허브 잔디밭 모달 초기화
  initializeGitHubModal();
  
  // 프로필 이미지 동적 로드
  loadProfileImage();
}

// 3D Avatar 효과 함수
function initializeAvatar3DEffect() {
  const avatarContainer = document.querySelector('.avatar-container');

  if (avatarContainer) {
    avatarContainer.addEventListener('mousemove', function(e) {
      const rect = avatarContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 회전 효과를 더 강하게 조정
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = (x - centerX) / 8;
      const rotateX = (centerY - y) / 8;

      avatarContainer.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    avatarContainer.addEventListener('mouseout', function() {
      avatarContainer.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg)';
    });

    // 디버깅을 위한 로그
    console.log('3D Avatar effect initialized');
    console.log('Avatar container:', avatarContainer);
  } else {
    console.log('Avatar container not found');
  }
}

// 프로필 이미지 모달 기능
function initializeProfileModal() {
  const profileImage = document.querySelector('.profile-image-clickable');
  const modal = document.getElementById('profileModal');
  const modalImage = document.getElementById('modalProfileImage');

  if (profileImage && modal && modalImage) {
    // 이미지 클릭 시 모달 열기
    profileImage.addEventListener('click', function(e) {
      e.stopPropagation(); // 3D 효과 이벤트와 충돌 방지
      modalImage.src = profileImage.src;
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // 스크롤 방지
      window.activeModal = 'profileModal';
    });

    // 모달 배경 클릭 시 닫기
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // 전역 모달 상태 업데이트
        if (window.activeModal === 'profileModal') {
          window.activeModal = null;
        }
      }
    });

    console.log('Profile modal initialized');
  } else {
    console.log('Profile modal elements not found');
  }
} 

// 깃허브 잔디밭 3D 효과 초기화
function initializeGitHubGraph3D() {
  const githubGraph = document.querySelector('.github-graph');

  if (githubGraph) {
    let isHovering = false;
    
    githubGraph.addEventListener('mouseenter', function() {
      isHovering = true;
    });
    
    githubGraph.addEventListener('mousemove', function(e) {
      if (!isHovering) return;
      
      const rect = githubGraph.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 회전 효과 계산
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = (x - centerX) / 20;
      const rotateX = (centerY - y) / 20;

      githubGraph.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    githubGraph.addEventListener('mouseleave', function() {
      isHovering = false;
      githubGraph.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });

    console.log('GitHub Graph 3D effect initialized');
  } else {
    console.log('GitHub Graph not found');
  }
}

// 깃허브 잔디밭 모달 기능
function initializeGitHubModal() {
  const githubGraph = document.querySelector('.github-graph');
  const modal = document.getElementById('githubModal');
  const modalImage = document.getElementById('modalGitHubImage');

  if (githubGraph && modal && modalImage) {
    // 깃허브 잔디밭 클릭 시 모달 열기
    githubGraph.addEventListener('click', function(e) {
      e.stopPropagation(); // 3D 효과 이벤트와 충돌 방지
      modalImage.src = githubGraph.querySelector('img').src;
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // 스크롤 방지
      window.activeModal = 'githubModal';
    });

    // 모달 배경 클릭 시 닫기
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // 전역 모달 상태 업데이트
        if (window.activeModal === 'githubModal') {
          window.activeModal = null;
        }
      }
    });

    console.log('GitHub modal initialized');
  } else {
    console.log('GitHub modal elements not found');
  }
} 

// 프로필 이미지 동적 로드 함수
function loadProfileImage() {
  const profileImage = document.querySelector('.avatar-card img');
  if (!profileImage) return;

  // API에서 프로필 데이터 가져오기
  fetch(window.appConfig.getAboutApiUrl())
    .then(response => response.json())
    .then(data => {
      if (data.result && data.result.profile_path) {
        // 백엔드에서 제공하는 경로를 getApiBaseUrl과 조합
        const imageSrc = `${window.appConfig.getApiBaseUrl()}/${data.result.profile_path}`;
        profileImage.src = imageSrc;
        profileImage.alt = data.result.name || '권하림';
        
        // 이미지 로드 실패 시 아무것도 하지 않음 (깨진 상태 유지)
        profileImage.onerror = function() {
          // 이미지 로드 실패 시 아무것도 하지 않음
        };
      }
    })
    .catch(error => {
      console.log('프로필 이미지 로드 실패:', error);
      // 에러 시 기본 이미지 사용
      profileImage.src = './assets/images/my-avatar.png';
      profileImage.alt = '권하림';
    });
} 