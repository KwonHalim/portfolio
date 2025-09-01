'use strict';

class ProjectManager {
    constructor() {
        this.currentCategory = 'all';
        this.isLoading = false;
        this.apiBaseUrl = window.appConfig.getProjectsApiUrl();
        this.categories = new Set();
        this.categoriesRendered = false;
        this.featuredProjectIds = []; // 강조할 프로젝트 ID들을 저장

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
        // ProjectManager 초기화 시작
        
        const projectGrid = document.getElementById('projectGrid');
        if (!projectGrid) {
            return;
        }

        // 캐시된 데이터가 있는지 확인
        this.checkCachedData();
        
        // pageChanged 이벤트 리스너 설정
        this.setupPageChangeListener();

        this.loadProjects(true); // 초기 로드 시 리셋
        this.setupFilters();

        // [리팩토링] 모달 이벤트 핸들러 설정 (한 번만 실행되도록 보장)
        // 전역 플래그 대신 클래스 내부 상태로 관리하는 것이 더 안전합니다.
        if (this.modal && !this.modal.dataset.handlerSetup) {
            this.setupModal();
            this.modal.dataset.handlerSetup = 'true'; // 플래그를 DOM 요소에 직접 설정
        }
        
        // ProjectManager 초기화 완료
    }
    
    async loadProjects(reset = false) {
        if (this.isLoading) return;
        
        // 카테고리별 캐시된 데이터 확인
        const cachedData = this.checkCachedDataForCategory(this.currentCategory);
        if (cachedData) {
            this.renderProjectsFromCache(cachedData);
            return;
        }
        
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
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const projects = data.result || []; // API 응답 구조에 맞게 result 필드 사용
            
            // 카테고리별 데이터를 캐시에 저장
            this.saveToCacheForCategory(this.currentCategory, data);
            
            if (reset) {
                this.resetProjects();
            }

            if (projects.length > 0) {
                // 카테고리 추출은 최초 로드 시에만 수행
                if (reset && !this.categoriesRendered) {
                    this.extractCategoriesFromProjects(projects);
                }
                // emphasized가 true인 프로젝트들의 ID를 저장 (참고용)
                if (reset && this.currentCategory === 'all' && this.featuredProjectIds.length === 0) {
                    this.featuredProjectIds = projects
                        .filter(project => project.emphasized === true)
                        .map(project => project.id);
                }
                this.renderProjects(projects);
            } else {
                this.showNoProjectsMessage(); // 데이터가 없을 때 메시지 표시
            }
            
        } catch (error) {
            this.showProjectsError();
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
            const projectElement = this.createProjectElement(project, index, projects.length);
            fragment.appendChild(projectElement);
        });
        
        grid.appendChild(fragment);
    }
    
    createProjectElement(project, index, totalProjects) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        
        // emphasized가 true인 프로젝트에 강조 효과 추가
        if (project.emphasized === true) {
            projectItem.classList.add('featured');
        }
        
        projectItem.setAttribute('data-category', project.category);
        projectItem.setAttribute('data-total-projects', totalProjects);

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
        this.applyAnimationToProject(projectItem, index, totalProjects);
        
        return projectItem;
    }

    applyAnimationToProject(projectElement, index, totalProjects) {
        const column = index % 3;
        const row = Math.floor(index / 3);
        
        let animationName;
        let randomDelay = 0.1 + Math.random() * 0.6;
        
        // 첫 번째 줄 (맨 위)
        if (row === 0) {
            animationName = ['slide-in-fwd-tl', 'slide-in-fwd-top', 'slide-in-fwd-tr'][column];
        }
        // 마지막 줄 (맨 아래) - 전체 프로젝트 개수를 확인하여 마지막 줄 판단
        else if (this.isLastRow(index, totalProjects)) {
            animationName = ['slide-in-fwd-bl', 'slide-in-fwd-bottom', 'slide-in-fwd-br'][column];
        }
        // 중간 줄들 (2번째 줄부터 마지막 줄 전까지)
        else {
            animationName = ['slide-in-fwd-left', 'slide-in-fwd-center', 'slide-in-fwd-right'][column];
            // 중간 줄들은 순차적으로 나타나도록 지연 시간 조정
            randomDelay = 0.1 + (row * 0.1) + (Math.random() * 0.2);
        }
        
        
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
    
    // 마지막 줄인지 확인하는 헬퍼 함수
    isLastRow(index, totalProjects) {
        const projectsPerRow = 3;
        const currentRow = Math.floor(index / projectsPerRow);
        const lastRow = Math.floor((totalProjects - 1) / projectsPerRow);
        
        const isLast = currentRow === lastRow;
        
        return isLast;
    }

    // 애니메이션 재실행 함수
    replayProjectAnimations() {
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach((item, index) => {
            // 기존 애니메이션 제거
            item.style.animation = '';
            item.style.opacity = '0';
            item.style.transform = 'translateZ(-200px)';
            
            // 전체 프로젝트 개수 가져오기
            const totalProjects = parseInt(item.getAttribute('data-total-projects')) || projectItems.length;
            
            // 애니메이션 다시 적용
            setTimeout(() => {
                this.applyAnimationToProject(item, index, totalProjects);
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
        
        // 캐시된 프로젝트 상세 정보 확인
        const cachedDetail = this.getCachedProjectDetail(projectId);
        if (cachedDetail) {
            this.updateModal(cachedDetail);
            this.openModal();
            return;
        }
        
        try {
            const projectDetailUrl = window.appConfig.getProjectDetailApiUrl(projectId);
            const response = await fetch(projectDetailUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.result) {
                // 프로젝트 상세 정보를 캐시에 저장
                this.cacheProjectDetail(projectId, data.result);
                
                this.updateModal(data.result);
                this.openModal();
            } else {
                throw new Error('프로젝트 정보를 찾을 수 없습니다.');
            }
        } catch (error) {
            alert('프로젝트 상세 정보를 불러오는 데 실패했습니다.');
        }
    }
    
    updateModal(project) {
        if (!this.modal) return;

        // 모달 상태 초기화
        this.modal.classList.remove('modal-open', 'modal-close');

        this.modalTitle.textContent = project.title || '제목 없음';
        this.modalCategory.textContent = project.category || '카테고리 없음';

        // description에 마크업이 포함되어 있다면 그대로 innerHTML에 할당
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
            // 이미지에 클릭 이벤트를 위한 클래스와 스타일 추가
            mediaHtml = `<img src="${fullPath}" alt="${media.description || 'Project Media'}" loading="lazy" class="project-media-image" style="cursor: pointer;" onerror="this.onerror=null; this.src='./assets/images/project-1.jpg';">`;
        }

        mediaItem.innerHTML = `
            <div class="media-image">${mediaHtml}</div>
            <div class="media-description"><p>${media.description || ''}</p></div>
        `;

        // 이미지 클릭 시 모달 열기 이벤트 추가
        if (!isVideo) {
            const imgElement = mediaItem.querySelector('.project-media-image');
            if (imgElement) {
                imgElement.addEventListener('click', () => {
                    this.openProjectImageModal(fullPath, media.description || '');
                });
            }
        }

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

        // 프로젝트 이미지 모달 이벤트 핸들러 설정
        this.setupProjectImageModal();
    }

    // 프로젝트 이미지 모달 이벤트 핸들러 설정
    setupProjectImageModal() {
        const projectImageModal = document.getElementById('projectImageModal');

        if (projectImageModal) {
            // 모달 배경 클릭 시 닫기
            projectImageModal.addEventListener('click', (e) => {
                if (e.target === projectImageModal) {
                    this.closeProjectImageModal();
                }
            });

            // 프로젝트 이미지 모달 전용 ESC 키 이벤트
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && projectImageModal.style.display === 'block') {
                    this.closeProjectImageModal();
                    e.stopPropagation();
                }
            });
        }
    }

    // 프로젝트 이미지 모달 열기
    openProjectImageModal(imageSrc, description) {
        const modal = document.getElementById('projectImageModal');
        const modalImage = document.getElementById('modalProjectImage');
        const modalDescription = document.getElementById('modalProjectImageDescription');

        if (modal && modalImage && modalDescription) {
            modalImage.src = imageSrc;
            modalDescription.textContent = description;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // 프로젝트 이미지 모달 닫기
    closeProjectImageModal() {
        const modal = document.getElementById('projectImageModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    setupFilters() {
        const filterList = document.querySelector('.filter-list');
        if (!filterList) return;

        filterList.addEventListener('click', (e) => {
            const button = e.target.closest('[data-filter]');
            if (!button) return;

            // 클릭한 버튼에 회전 애니메이션 적용
            button.style.animation = 'rotate-center 0.6s ease-in-out both';
            
            // 애니메이션 완료 후 스타일 제거
            setTimeout(() => {
                button.style.animation = '';
            }, 600);

            // 이미 활성화된 버튼이면 애니메이션만 다시 실행
            if (button.classList.contains('active')) {
                this.replayProjectAnimations();
                return;
            }
            
            // 활성 버튼 변경 - 안전하게 처리
            const activeButton = filterList.querySelector('[data-filter].active');
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            button.classList.add('active');
            
            const newCategory = button.dataset.filter;
            
            // 카테고리 변경 시 캐시 확인
            this.currentCategory = newCategory;
            
            // 해당 카테고리의 캐시된 데이터가 있는지 확인
            const cachedData = this.checkCachedDataForCategory(newCategory);
            if (cachedData) {
                this.renderProjectsFromCache(cachedData);
            } else {
                this.loadProjects(true); // 카테고리 변경 시 프로젝트 목록 리셋 후 새로 로드
            }
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
        
        projectItems.forEach((item, index) => {
            // 기존 애니메이션 스타일 제거
            item.style.animation = '';
            item.style.opacity = '0';
            item.style.transform = 'translateZ(-200px)';
            
            // 전체 프로젝트 개수 가져오기
            const totalProjects = parseInt(item.getAttribute('data-total-projects')) || projectItems.length;
            
            // 각 프로젝트마다 다른 시간에 애니메이션 시작 (원래 랜덤 지연 효과 유지)
            this.applyAnimationToProject(item, index, totalProjects);
        });
    }

    showNoProjectsMessage() {
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
        const projectGrid = document.getElementById('projectGrid');
        if (!projectGrid) return;
        
        projectGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1;">
                오류로 정보를 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.
            </div>
        `;
    }
    
    // 캐시된 데이터로 프로젝트 렌더링 (애니메이션 포함, API 요청 없음)
    renderProjectsFromCache(data) {
        const projects = data.result || data;
        if (projects && projects.length > 0) {
            this.resetProjects();
            this.extractCategoriesFromProjects(projects);
            // emphasized가 true인 프로젝트들의 ID를 저장 (참고용)
            if (this.currentCategory === 'all' && this.featuredProjectIds.length === 0) {
                this.featuredProjectIds = projects
                    .filter(project => project.emphasized === true)
                    .map(project => project.id);
            }
            this.renderProjects(projects);
        }
    }
    
    // 캐시된 데이터 확인
    checkCachedData() {
        try {
            const cachedData = sessionStorage.getItem('pageCache');
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                if (parsed.projects && parsed.projects.data) {
                    this.renderProjectsFromCache(parsed.projects.data);
                }
            }
        } catch (error) {
            // 캐시된 데이터 확인 실패
        }
    }
    
    // 카테고리별 캐시 키 생성
    getCacheKey(category = 'all') {
        return `projects_${category}`;
    }
    
    // 카테고리별 캐시된 데이터 확인
    checkCachedDataForCategory(category = 'all') {
        try {
            const cachedData = sessionStorage.getItem('pageCache');
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                const cacheKey = this.getCacheKey(category);
                
                if (parsed[cacheKey] && parsed[cacheKey].data) {
                    const age = Date.now() - parsed[cacheKey].timestamp;
                    const isValid = age < (3 * 60 * 60 * 1000); // 3시간
                    
                    if (isValid) {
                        return parsed[cacheKey].data;
                    } else {
                        // 만료된 캐시 삭제
                        delete parsed[cacheKey];
                        sessionStorage.setItem('pageCache', JSON.stringify(parsed));
                    }
                } else {
                    return null;
                }
            }
        } catch (error) {
            // 카테고리별 캐시된 데이터 확인 실패
        }
        return null;
    }
    
    // 카테고리별 데이터를 캐시에 저장
    saveToCacheForCategory(category = 'all', data) {
        try {
            const cachedData = sessionStorage.getItem('pageCache');
            let parsed = {};
            
            if (cachedData) {
                parsed = JSON.parse(cachedData);
            }
            
            const cacheKey = this.getCacheKey(category);
            parsed[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };
            
            sessionStorage.setItem('pageCache', JSON.stringify(parsed));
        } catch (error) {
            // 카테고리별 데이터 캐시 저장 실패
        }
    }
    
    // 캐시된 데이터로 프로젝트 렌더링
    renderProjectsFromCache(data) {
        const projects = data.result || data;
        if (projects && projects.length > 0) {
            this.resetProjects();
            this.extractCategoriesFromProjects(projects);
            // emphasized가 true인 프로젝트들의 ID를 저장 (참고용)
            if (this.currentCategory === 'all' && this.featuredProjectIds.length === 0) {
                this.featuredProjectIds = projects
                    .filter(project => project.emphasized === true)
                    .map(project => project.id);
            }
            this.renderProjects(projects);
        }
    }
    
    // pageChanged 이벤트 리스너 설정
    setupPageChangeListener() {
        document.addEventListener('pageChanged', (event) => {
            const { page, data, loading } = event.detail;
            
            if (page === 'projects') {
                if (loading) {
                    // 로딩 상태 표시
                    this.showLoadingState();
                } else if (data) {
                    // 현재 카테고리에 맞는 데이터인지 확인
                    // navigation.js에서 전달된 데이터는 'all' 카테고리 데이터일 가능성이 높음
                    if (this.currentCategory === 'all') {
                        this.renderProjectsFromCache(data);
                    } else {
                        // 다른 카테고리인 경우 해당 카테고리의 캐시 확인
                        const cachedData = this.checkCachedDataForCategory(this.currentCategory);
                        if (cachedData) {
                            this.renderProjectsFromCache(cachedData);
                        } else {
                            // 캐시가 없으면 API 요청
                            this.loadProjects(true);
                        }
                    }
                }
            }
        });
    }
    
    // 로딩 상태 표시
    showLoadingState() {
        const projectGrid = document.getElementById('projectGrid');
        if (projectGrid) {
            this.resetProjects();
            const loadingMsg = document.createElement('div');
            loadingMsg.className = 'loading-message';
            loadingMsg.innerHTML = '<div class="loading-spinner"></div>로딩중입니다.';
            loadingMsg.id = 'projectsLoading';
            loadingMsg.style.gridColumn = '1 / -1';
            projectGrid.appendChild(loadingMsg);
        }
    }

    // 프로젝트 상세 정보 캐시에서 가져오기
    getCachedProjectDetail(projectId) {
        try {
            const cachedData = sessionStorage.getItem('projectDetailCache');
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                const cacheKey = `project_${projectId}`;
                
                if (parsed[cacheKey]) {
                    const cache = parsed[cacheKey];
                    const now = Date.now();
                    const CACHE_TTL = 3 * 60 * 60 * 1000; // 3시간
                    
                    // 캐시가 유효한지 확인
                    if ((now - cache.timestamp) < CACHE_TTL) {
                        return cache.data;
                    } else {
                        // 만료된 캐시 삭제
                        delete parsed[cacheKey];
                        sessionStorage.setItem('projectDetailCache', JSON.stringify(parsed));
                    }
                }
            }
        } catch (error) {
            // 프로젝트 상세 정보 캐시 확인 실패
        }
        return null;
    }
    
    // 프로젝트 상세 정보 캐시에 저장
    cacheProjectDetail(projectId, data) {
        try {
            const cacheKey = `project_${projectId}`;
            let cachedData = {};
            
            // 기존 캐시 데이터 가져오기
            const existingCache = sessionStorage.getItem('projectDetailCache');
            if (existingCache) {
                cachedData = JSON.parse(existingCache);
            }
            
            // 새로운 데이터 캐시에 저장
            cachedData[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };
            
            // sessionStorage에 저장
            sessionStorage.setItem('projectDetailCache', JSON.stringify(cachedData));
            
        } catch (error) {
            // 프로젝트 상세 정보 캐시 저장 실패
        }
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
            // 캐시된 데이터가 있으면 즉시 사용 (애니메이션 포함)
            if (e.detail.data) {
                window.projectManager.renderProjectsFromCache(e.detail.data);
            } else if (e.detail.loading) {
                // 로딩 상태 표시
                window.projectManager.showLoadingState();
            } else {
                // 기존 방식으로 새로고침
                window.projectManager.loadProjects(true);
            }
        }
    }
});