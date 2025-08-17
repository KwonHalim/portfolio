'use strict';

class ProjectManager {
    constructor() {
        this.currentCategory = 'all';
        this.isLoading = false;
        this.apiBaseUrl = window.appConfig.getProjectsApiUrl();
        this.categories = new Set();
        this.categoriesRendered = false;

        // [리팩토링] 모달 관련 요소를 클래스 속성으로 관리
        this.modal = document.getElementById('projectModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalCategory = document.getElementById('modalCategory');
        this.modalImage = document.getElementById('modalImage');
        this.modalTechList = document.getElementById('modalTechList');
        this.modalDescription = document.getElementById('modalDescription');
        this.mediaContainer = document.getElementById('mediaContainer');
        this.projectLinks = document.querySelector('.project-links');
        this.closeButton = this.modal ? this.modal.querySelector('.close-modal') : null;


        // 전역 변수로 저장
        window.projectManager = this;
        
        this.init();
    }
    
    init() {
        console.log('ProjectManager 초기화 시작');
        
        const projectGrid = document.getElementById('projectGrid');
        if (!projectGrid) {
            console.error('projectGrid 요소를 찾을 수 없습니다!');
            return;
        }

        this.loadProjects(true); // 초기 로드 시 리셋
        this.setupFilters();

        // [리팩토링] 모달 이벤트 핸들러 설정 (한 번만 실행되도록 보장)
        // 전역 플래그 대신 클래스 내부 상태로 관리하는 것이 더 안전합니다.
        if (this.modal && !this.modal.dataset.handlerSetup) {
            console.log('최초로 모달 이벤트 핸들러를 설정합니다.');
            this.setupModal();
            this.modal.dataset.handlerSetup = 'true'; // 플래그를 DOM 요소에 직접 설정
        }
        
        console.log('ProjectManager 초기화 완료');
    }
    
    async loadProjects(reset = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        

        
        // 프로젝트 그리드에 로딩 메시지 추가
        const projectGrid = document.getElementById('projectGrid');
        if (projectGrid && reset) {
            const loadingMsg = document.createElement('div');
            loadingMsg.className = 'loading-message';
            loadingMsg.innerHTML = '<div class="loading-spinner"></div>로딩중입니다.';
            loadingMsg.id = 'projectsLoading';
            loadingMsg.style.gridColumn = '1 / -1';
            projectGrid.appendChild(loadingMsg);
        }
        
        try {
            let url = this.apiBaseUrl;
            if (this.currentCategory !== 'all') {
                // URL 파라미터는 URL-safe하게 인코딩해야 합니다.
                url += `?category=${encodeURIComponent(this.currentCategory)}`;
            }
            
            console.log('API 요청 URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const projects = data.result || []; // API 응답 구조에 맞게 result 필드 사용
            
            if (reset) {
                this.resetProjects();
            }

            if (projects.length > 0) {
                console.log(`${projects.length}개의 프로젝트를 렌더링합니다.`);
                // 카테고리 추출은 최초 로드 시에만 수행
                if (reset && !this.categoriesRendered) {
                    this.extractCategoriesFromProjects(projects);
                }
                this.renderProjects(projects);
            } else {
                console.log('가져온 프로젝트 데이터가 없습니다.');
                if (reset) this.showNoProjectsMessage(); // 데이터가 없을 때 메시지 표시
            }
            
        } catch (error) {
            console.error('프로젝트 로딩 실패:', error);
            // 백엔드 연결 실패 시 오류 메시지 표시
            if (reset) this.showProjectsError();
        } finally {
            this.isLoading = false;
            
            // 로딩 메시지 제거
            const loadingMsg = document.getElementById('projectsLoading');
            if (loadingMsg) loadingMsg.remove();
        }
    }
    

    
    renderProjects(projects) {
        const grid = document.getElementById('projectGrid');
        if (!grid) return;
        
        // [성능] DocumentFragment를 사용하여 DOM 조작 최소화
        const fragment = document.createDocumentFragment();
        projects.forEach((project, index) => {
            const projectElement = this.createProjectElement(project, index);
            fragment.appendChild(projectElement);
        });
        
        grid.appendChild(fragment);
    }
    
    createProjectElement(project, index) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.setAttribute('data-category', project.category);

        // API_BASE_URL을 사용하여 이미지 경로 설정 (createMediaElement와 동일한 방식)
        let imagePath;
        if (project.imagePath) {
            imagePath = `${window.appConfig.getApiBaseUrl()}/${project.imagePath}`;
        } else {
            imagePath = './assets/images/project-1.jpg'; // 기본 이미지는 로컬 경로 사용
        }

        projectItem.innerHTML = `
            <a href="#" data-project-id="${project.id}">
                <figure class="project-img">
                    <div class="project-item-icon-box">
                        <ion-icon name="eye-outline"></ion-icon>
                    </div>
                    <img src="${imagePath}" 
                         alt="${project.title}" loading="lazy"
                         onerror="this.onerror=null; this.src='./assets/images/project-1.jpg';">
                </figure>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-category">${project.category}</p>
            </a>
        `;
        
        const link = projectItem.querySelector('a');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.showProjectDetail(project.id);
        });
        
        // 애니메이션 적용
        this.applyAnimationToProject(projectItem, index);
        
        return projectItem;
    }

    applyAnimationToProject(projectElement, index) {
        const column = index % 3;
        const row = Math.floor(index / 3);
        
        let animationName;
        if (row === 0) animationName = ['slide-in-fwd-tl', 'slide-in-fwd-top', 'slide-in-fwd-tr'][column];
        else if (row === 1) animationName = ['slide-in-fwd-left', 'slide-in-fwd-center', 'slide-in-fwd-right'][column];
        else if (row === 2) animationName = ['slide-in-fwd-bl', 'slide-in-fwd-bottom', 'slide-in-fwd-br'][column];
        else animationName = 'slide-in-fwd-center';

        const randomDelay = 0.1 + Math.random() * 0.4;
        
        // 초기 상태 설정 (애니메이션 시작 전)
        projectElement.style.opacity = '0';
        projectElement.style.transform = 'translateZ(-200px)';
        
        // 애니메이션 적용
        projectElement.style.animation = `${animationName} 0.4s ease-out ${randomDelay}s forwards`;

        projectElement.addEventListener('animationend', () => {
            // 애니메이션 완료 후 최종 상태 보장
            projectElement.style.opacity = '1';
            projectElement.style.transform = 'translateZ(0) translateY(0) translateX(0)';
            projectElement.style.animation = ''; // 애니메이션 스타일 제거
        }, { once: true });
    }

    // 애니메이션 재실행 함수
    replayProjectAnimations() {
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach((item, index) => {
            // 기존 애니메이션 제거
            item.style.animation = '';
            item.style.opacity = '0';
            item.style.transform = 'translateZ(-200px)';
            
            // 애니메이션 다시 적용
            setTimeout(() => {
                this.applyAnimationToProject(item, index);
            }, 50); // 약간의 지연 후 애니메이션 시작
        });
    }

    resetProjects() {
        const projectGrid = document.getElementById('projectGrid');
        if (projectGrid) {
            projectGrid.innerHTML = '';
        }
    }
    
    // [리팩토링] 모달 열기/닫기 로직 개선
    openModal() {
        if (!this.modal) return;
        this.modal.style.display = 'block';
        // 기존 애니메이션 클래스 제거
        this.modal.classList.remove('modal-close');
        // 애니메이션을 위해 약간의 지연 후 클래스 추가
        setTimeout(() => {
            this.modal.classList.add('modal-open');
        }, 10);
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('modal-open');
        this.modal.classList.add('modal-close');
        
        // 애니메이션이 끝난 후 display: none 처리
        this.modal.addEventListener('animationend', () => {
            this.modal.style.display = 'none';
            this.modal.classList.remove('modal-close');
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }, { once: true });
    }
    
    async showProjectDetail(projectId) {
        if (!projectId) return;
        
        try {
            const projectDetailUrl = window.appConfig.getProjectDetailApiUrl(projectId);
            const response = await fetch(projectDetailUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.result) {
                this.updateModal(data.result);
                this.openModal();
            } else {
                throw new Error('프로젝트 정보를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('프로젝트 상세 정보 로딩 실패:', error);
            alert('프로젝트 상세 정보를 불러오는 데 실패했습니다.');
        }
    }
    
    updateModal(project) {
        if (!this.modal) return;

        // 모달 상태 초기화
        this.modal.classList.remove('modal-open', 'modal-close');

        this.modalTitle.textContent = project.title || '제목 없음';
        this.modalCategory.textContent = project.category || '카테고리 없음';
        this.modalDescription.innerHTML = project.description || '상세 설명이 없습니다.';
        
        // 기술 스택
        this.modalTechList.innerHTML = '';
        if (project.technologies && project.technologies.length > 0) {
            project.technologies.forEach(tech => {
                const li = document.createElement('li');
                li.textContent = tech;
                this.modalTechList.appendChild(li);
            });
        }

        // 미디어(이미지/비디오)
        this.mediaContainer.innerHTML = '';
        const mediaItems = project.images || [];
        if (mediaItems.length > 0) {
            mediaItems.forEach(item => {
                const mediaElement = this.createMediaElement(item);
                this.mediaContainer.appendChild(mediaElement);
            });
        }

        // 프로젝트 링크
        this.projectLinks.innerHTML = '';
        if (project.githubUrl) {
            // [보안] noopener, noreferrer 추가
            this.projectLinks.appendChild(this.createLink('modalGithub', project.githubUrl, 'logo-github', 'View Source', true));
        }
        if (project.demoUrl) {
            // [보안] noopener, noreferrer 추가
            this.projectLinks.appendChild(this.createLink('modalDemo', project.demoUrl, 'open-outline', 'Live Demo', true));
        }
    }

    createMediaElement(media) {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        let mediaHtml;
        const path = media.imagePath || '';
        const fullPath = path ? `${window.appConfig.getApiBaseUrl()}/${path}` : '';
        const isVideo = path.toLowerCase().match(/\.(mp4|webm|mov)$/);

        if (isVideo) {
            mediaHtml = `<video src="${fullPath}" controls preload="metadata"></video>`;
        } else {
            mediaHtml = `<img src="${fullPath}" alt="${media.description || 'Project Media'}" loading="lazy" onerror="this.onerror=null; this.src='./assets/images/project-1.jpg';">`;
        }

        mediaItem.innerHTML = `
            <div class="media-image">${mediaHtml}</div>
            <div class="media-description"><p>${media.description || ''}</p></div>
        `;
        return mediaItem;
    }

    createLink(id, url, icon, text, isExternal = false) {
        const link = document.createElement('a');
        link.id = id;
        link.href = url;
        link.className = 'form-btn';
        if (isExternal) {
            link.target = '_blank';
            // [보안] 외부 링크는 rel="noopener noreferrer"를 추가하여 보안 강화
            link.rel = 'noopener noreferrer';
        }
        link.innerHTML = `<ion-icon name="${icon}"></ion-icon><span>${text}</span>`;
        return link;
    }
        
    // [리팩토링] 모달 이벤트 핸들러 설정 단순화
    setupModal() {
        if (!this.modal) return;

        // 닫기 버튼 클릭 시
        this.closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal();
        });

        // 모달 바깥 영역 클릭 시
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // ESC 키 누를 시
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    setupFilters() {
        const filterList = document.querySelector('.filter-list');
        if (!filterList) return;

        filterList.addEventListener('click', (e) => {
            const button = e.target.closest('[data-filter]');
            if (!button) return;

            // 이미 활성화된 버튼이면 애니메이션만 다시 실행
            if (button.classList.contains('active')) {
                console.log('같은 카테고리 선택, 애니메이션 재실행:', button.dataset.filter);
                this.replayProjectAnimations();
                return;
            }
            
            // 활성 버튼 변경 - 안전하게 처리
            const activeButton = filterList.querySelector('[data-filter].active');
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            button.classList.add('active');
            
            this.currentCategory = button.dataset.filter;
            console.log('카테고리 변경:', this.currentCategory);
            this.loadProjects(true); // 카테고리 변경 시 프로젝트 목록 리셋 후 새로 로드
        });
    }
    
    extractCategoriesFromProjects(projects) {
        // 기존 카테고리 초기화
        this.categories.clear();
        
        projects.forEach(project => {
            if (project.category) {
                this.categories.add(project.category);
            }
        });
        
        // 카테고리 렌더링은 최초 한 번만 수행 (이미 렌더링된 경우 제외)
        if (!this.categoriesRendered) {
            this.renderCategories();
            this.categoriesRendered = true;
        }
    }
    
    renderCategories() {
        const filterList = document.querySelector('.filter-list');
        if (!filterList) return;

        // 'All' 버튼을 제외한 동적으로 생성된 카테고리 버튼들만 제거
        const dynamicItems = filterList.querySelectorAll('.filter-item[data-dynamic="true"]');
        dynamicItems.forEach(item => item.remove());
        
        // 카테고리가 없으면 렌더링하지 않음
        if (this.categories.size === 0) return;
        
        const fragment = document.createDocumentFragment();
        Array.from(this.categories).sort().forEach(category => {
            const filterItem = document.createElement('li');
            filterItem.className = 'filter-item';
            filterItem.setAttribute('data-dynamic', 'true'); // 동적으로 생성된 항목임을 표시
            filterItem.innerHTML = `<button data-filter="${category}">${category}</button>`;
            fragment.appendChild(filterItem);
        });

        filterList.appendChild(fragment);
    }
    

    
    // 프로젝트 애니메이션 재실행
    replayProjectAnimations() {
        const projectItems = document.querySelectorAll('.project-item');
        if (projectItems.length === 0) return;
        
        console.log(`${projectItems.length}개 프로젝트 애니메이션 재실행`);
        
        projectItems.forEach((item, index) => {
            // 기존 애니메이션 스타일 제거
            item.style.animation = '';
            item.style.opacity = '0';
            item.style.transform = 'translateZ(-200px)';
            
            // 각 프로젝트마다 다른 시간에 애니메이션 시작 (원래 랜덤 지연 효과 유지)
            this.applyAnimationToProject(item, index);
        });
    }

    showNoProjectsMessage() {
        console.log('프로젝트 데이터가 없습니다.');
        const projectGrid = document.getElementById('projectGrid');
        if (!projectGrid) return;
        
        projectGrid.innerHTML = `
            <div class="no-projects-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">등록된 프로젝트가 없습니다</div>
                <div style="font-size: 0.9rem;">새로운 프로젝트를 추가해주세요.</div>
            </div>
        `;
    }
    
    showProjectsError() {
        console.log('백엔드 연결 실패, 오류 메시지를 표시합니다.');
        const projectGrid = document.getElementById('projectGrid');
        if (!projectGrid) return;
        
        projectGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1;">
                오류로 정보를 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.
            </div>
        `;
    }
}

// 페이지 로드 및 변경에 따른 ProjectManager 인스턴스 관리
document.addEventListener('DOMContentLoaded', () => {
    // 'projects' 페이지가 기본 활성 페이지일 경우에만 인스턴스 생성
    const projectPage = document.querySelector('[data-page="projects"]');
    if (projectPage && projectPage.classList.contains('active')) {
        if (!window.projectManager) {
            window.projectManager = new ProjectManager();
        }
    }
});

// 네비게이션으로 페이지가 변경될 때의 이벤트 리스너
document.addEventListener('pageChanged', (e) => {
    if (e.detail.page === 'projects') {
        if (!window.projectManager) {
            // 인스턴스가 없으면 새로 생성
            window.projectManager = new ProjectManager();
        } else {
            // 인스턴스가 있으면 프로젝트 목록을 새로고침
            window.projectManager.loadProjects(true);
        }
    }
});