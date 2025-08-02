'use strict';

class ProjectManager {
    constructor() {
        this.currentPage = 0;
        this.currentCategory = 'all';
        this.isLoading = false;
        this.hasMoreData = true;
        this.apiBaseUrl = 'http://localhost:8080/api/projects';
        this.currentMediaIndex = 0;
        this.currentMediaPaths = [];
        this.categories = new Set();
        
        // 전역 변수로 저장
        window.projectManager = this;
        
        this.init();
    }
    
    init() {
        console.log('ProjectManager 초기화 시작');
        
        // 필수 요소들 확인
        const projectGrid = document.getElementById('projectGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const noMoreData = document.getElementById('noMoreData');
        
        console.log('projectGrid 요소:', projectGrid);
        console.log('loadingSpinner 요소:', loadingSpinner);
        console.log('noMoreData 요소:', noMoreData);
        
        if (!projectGrid) {
            console.error('projectGrid 요소를 찾을 수 없습니다!');
            return;
        }
        
        // 즉시 기본 프로젝트 표시 (API 실패 시 대비)
        this.showDefaultProjects();
        
        this.loadInitialProjects();
        this.setupInfiniteScroll();
        this.setupFilters();
        this.setupModal();
        
        console.log('ProjectManager 초기화 완료');
    }
    
    async loadProjects(reset = false) {
        if (this.isLoading || (!reset && !this.hasMoreData)) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const params = new URLSearchParams({
                page: reset ? 0 : this.currentPage,
                size: 6
            });
            
            // 카테고리가 'all'이 아닐 때만 파라미터 추가
            if (this.currentCategory !== 'all') {
                params.append('category', this.currentCategory);
            }
            
            const url = `${this.apiBaseUrl}?${params}`;
            console.log('API 요청 URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('API 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API 응답 데이터:', data);
            
            if (reset) {
                this.resetProjects();
                this.currentPage = 0;
            }
            
            // API 응답 구조에 맞게 데이터 처리
            let projects = [];
            let hasMore = true;
            
            if (data.result && data.result.content) {
                // Spring Boot Page 형태 - 실제 API 응답 구조
                projects = data.result.content;
                hasMore = !data.result.last;
                console.log('Spring Boot Page 형태로 처리됨:', projects);
            } else if (data.result && Array.isArray(data.result)) {
                // 단순 배열 형태
                projects = data.result;
                hasMore = projects.length > 0;
                console.log('단순 배열 형태로 처리됨:', projects);
            } else if (Array.isArray(data)) {
                // 직접 배열 형태
                projects = data;
                hasMore = projects.length > 0;
                console.log('직접 배열 형태로 처리됨:', projects);
            } else {
                console.error('지원하지 않는 API 응답 구조:', data);
                projects = [];
                hasMore = false;
            }
            
            if (projects && projects.length > 0) {
                console.log(`${projects.length}개의 프로젝트를 렌더링합니다:`, projects);
                
                // 프로젝트에서 카테고리 추출 (항상 실행)
                this.extractCategoriesFromProjects(projects);
                
                this.renderProjects(projects);
                this.currentPage++;
                this.hasMoreData = hasMore;
                
                if (!this.hasMoreData) {
                    this.showNoMoreData();
                }
            } else {
                console.log('프로젝트 데이터가 없습니다.');
                this.showNoMoreData();
            }
            
        } catch (error) {
            console.error('프로젝트 로딩 실패:', error);
            this.showError('프로젝트를 불러오는데 실패했습니다.');
            
            // API 실패 시 기본 데이터 표시
            if (reset) {
                this.showDefaultProjects();
            }
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }
    
    // 기본 프로젝트 데이터 표시
    showDefaultProjects() {
        console.log('기본 프로젝트 데이터 표시');
        const defaultProjects = [
            {
                id: 1,
                title: 'E-Commerce Backend',
                category: 'Toy Project',
                imagePath: 'images/ecommerce_detail_1.png'
            },
            {
                id: 2,
                title: 'Portfolio Website',
                category: 'Personal Project',
                imagePath: 'images/portfolio_detail_1.png'
            }
        ];
        
        this.renderProjects(defaultProjects);
    }
    
    renderProjects(projects) {
        const grid = document.getElementById('projectGrid');
        console.log('렌더링할 프로젝트:', projects);
        
        if (!grid) {
            console.error('projectGrid 요소를 찾을 수 없습니다!');
            return;
        }
        
        projects.forEach(project => {
            const projectElement = this.createProjectElement(project);
            grid.appendChild(projectElement);
        });
    }
    
    createProjectElement(project) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.setAttribute('data-category', project.category);
        
        // 이미지 경로 처리 - API 응답의 imagePath 사용
        // 이미지 경로가 상대 경로인 경우 서버 URL과 결합
        let imagePath = project.imagePath || './assets/images/project-1.jpg';
        if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('./')) {
            // 서버의 이미지 경로인 경우
            imagePath = `http://localhost:8080/${imagePath}`;
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
        
        // 클릭 이벤트 추가
        const link = projectItem.querySelector('a');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.showProjectDetail(project.id);
        });
        
        return projectItem;
    }
    
    async showProjectDetail(projectId) {
        try {
            console.log(`프로젝트 상세 정보 로딩: ${projectId}`);
            const response = await fetch(`${this.apiBaseUrl}/${projectId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('프로젝트 상세 정보:', data);
            
            if (data.result) {
                const project = data.result;
                this.updateModal(project);
                document.getElementById('projectModal').style.display = 'block';
            } else {
                throw new Error('프로젝트 정보를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('프로젝트 상세 정보 로딩 실패:', error);
            this.showError('프로젝트 상세 정보를 불러오는데 실패했습니다.');
        }
    }
    
    updateModal(project) {
        document.getElementById('modalTitle').textContent = project.title;
        document.getElementById('modalCategory').textContent = project.category;
        
        // 미디어 처리 - 모든 미디어를 표시
        const mediaContainer = document.getElementById('mediaContainer');
        mediaContainer.innerHTML = '';
        
        // imagePath가 배열인지 확인
        let mediaPaths = [];
        if (Array.isArray(project.imagePath)) {
            mediaPaths = project.imagePath;
        } else if (project.imagePath) {
            mediaPaths = [project.imagePath];
        } else {
            mediaPaths = ['./assets/images/project-1.jpg'];
        }
        
        // 모든 미디어를 생성
        mediaPaths.forEach((mediaPath, index) => {
            const isVideo = mediaPath.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            
            if (isVideo) {
                // 영상인 경우
                const video = document.createElement('video');
                video.controls = true;
                video.className = 'modal-video';
                video.preload = 'metadata';
                video.crossOrigin = 'anonymous';
                // controlsList 제거하여 모든 컨트롤 허용
                video.style.pointerEvents = 'auto';
                video.style.userSelect = 'auto';
                video.style.zIndex = '1000';
                
                let videoPath = mediaPath;
                if (videoPath && !videoPath.startsWith('http') && !videoPath.startsWith('./')) {
                    videoPath = `http://localhost:8080/${videoPath}`;
                }
                
                video.src = videoPath;
                video.onerror = function() {
                    this.style.display = 'none';
                };
                
                // 영상 로드 완료 후 스킵 가능하도록 설정
                video.onloadedmetadata = function() {
                    this.currentTime = 0;
                    this.controls = true;
                    this.style.pointerEvents = 'auto';
                    this.style.userSelect = 'auto';
                };
                
                // 영상 로드 완료 후 컨트롤 활성화
                video.oncanplay = function() {
                    this.controls = true;
                    this.style.pointerEvents = 'auto';
                    this.style.userSelect = 'auto';
                };
                
                mediaItem.appendChild(video);
            } else {
                // 이미지인 경우
                const img = document.createElement('img');
                img.className = 'modal-img';
                img.alt = `Project Image ${index + 1}`;
                
                let imagePath = mediaPath;
                if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('./')) {
                    imagePath = `http://localhost:8080/${imagePath}`;
                }
                
                img.src = imagePath;
                img.onerror = function() {
                    this.onerror = null;
                    this.src = './assets/images/project-1.jpg';
                };
                
                mediaItem.appendChild(img);
            }
            
            mediaContainer.appendChild(mediaItem);
        });
        
        document.getElementById('modalDescription').innerHTML = project.description || '상세 설명이 없습니다.';
        
        // 기술 스택 렌더링 - API 응답의 technologies 필드 사용
        const techList = document.getElementById('modalTechList');
        techList.innerHTML = '';
        if (project.technologies && project.technologies.length > 0) {
            project.technologies.forEach(tech => {
                const li = document.createElement('li');
                li.textContent = tech;
                techList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = '기술 스택 정보가 없습니다.';
            techList.appendChild(li);
        }
        
        // 링크 설정 - API 응답의 githubUrl, demoUrl 필드 사용
        const projectLinks = document.querySelector('.project-links');
        
        // 기존 링크 버튼들 제거
        projectLinks.innerHTML = '';
        
        // GitHub 링크가 있으면 버튼 생성
        if (project.githubUrl) {
            const githubLink = document.createElement('a');
            githubLink.id = 'modalGithub';
            githubLink.href = project.githubUrl;
            githubLink.target = '_blank';
            githubLink.className = 'form-btn';
            githubLink.innerHTML = `
                <ion-icon name="logo-github"></ion-icon>
                <span>View Source</span>
            `;
            projectLinks.appendChild(githubLink);
        }
        
        // Demo 링크가 있으면 버튼 생성
        if (project.demoUrl) {
            const demoLink = document.createElement('a');
            demoLink.id = 'modalDemo';
            demoLink.href = project.demoUrl;
            demoLink.target = '_blank';
            demoLink.className = 'form-btn';
            demoLink.innerHTML = `
                <ion-icon name="open-outline"></ion-icon>
                <span>Live Demo</span>
            `;
            projectLinks.appendChild(demoLink);
        }
    }
    
    setupInfiniteScroll() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMoreData) {
                    this.loadProjects();
                }
            });
        }, options);
        
        // 로딩 스피너를 관찰
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            observer.observe(loadingSpinner);
        }
    }
    
    setupFilters() {
        // 기존 이벤트 리스너 제거 (중복 방지)
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.removeEventListener('click', this.filterClickHandler);
        });
        
        // 새로운 이벤트 리스너 추가
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', this.filterClickHandler.bind(this));
        });
    }
    
    filterClickHandler(e) {
        // 활성 버튼 변경
        document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentCategory = e.target.dataset.filter;
        console.log('카테고리 변경:', this.currentCategory);
        this.loadProjects(true); // reset = true
    }
    
    setupModal() {
        // 모달 닫기 버튼
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('projectModal').style.display = 'none';
            });
        }
        
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('projectModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // ✨ 새로 추가할 코드 ✨
        // modal-content 내부의 클릭이 바깥으로 전파되는 것을 막음
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
    }
    
    extractCategoriesFromProjects(projects) {
        // 프로젝트에서 카테고리 추출하여 Set에 추가
        projects.forEach(project => {
            if (project.category) {
                this.categories.add(project.category);
            }
        });
        
        console.log('추출된 카테고리들:', Array.from(this.categories));
        
        // 카테고리 필터가 없을 때만 생성
        if (!this.hasCategoryFilters()) {
            this.renderCategories();
        }
    }
    
    // 카테고리 필터가 이미 존재하는지 확인하는 함수
    hasCategoryFilters() {
        const filterList = document.getElementById('filterList');
        if (!filterList) return false;
        
        // All 버튼을 제외한 카테고리 버튼이 있는지 확인
        const categoryButtons = filterList.querySelectorAll('.filter-item:not(:first-child)');
        return categoryButtons.length > 0;
    }
    
    renderCategories() {
        const filterList = document.getElementById('filterList');
        if (!filterList) {
            console.error('filterList 요소를 찾을 수 없습니다!');
            return;
        }
        
        // 카테고리 필터가 이미 존재한다면 생성하지 않음
        if (this.hasCategoryFilters()) {
            console.log('카테고리 필터가 이미 존재합니다. 건너뜁니다.');
            return;
        }
        
        // 기존 카테고리 버튼들 제거 (All 버튼 제외)
        const existingButtons = filterList.querySelectorAll('.filter-item:not(:first-child)');
        existingButtons.forEach(button => button.remove());
        
        // 새로운 카테고리 버튼들 생성
        Array.from(this.categories).forEach(category => {
            const filterItem = document.createElement('li');
            filterItem.className = 'filter-item';
            
            const button = document.createElement('button');
            button.setAttribute('data-filter', category);
            button.textContent = category;
            
            filterItem.appendChild(button);
            filterList.appendChild(filterItem);
        });
        
        // 필터 이벤트 리스너 다시 설정
        this.setupFilters();
        
        console.log(`${this.categories.size}개의 카테고리 필터를 생성했습니다:`, Array.from(this.categories));
    }
    
    loadInitialProjects() {
        console.log('초기 프로젝트 로딩 시작');
        this.loadProjects(true);
    }
    
    showLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const noMoreData = document.getElementById('noMoreData');
        
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (noMoreData) noMoreData.style.display = 'none';
    }
    
    hideLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
    
    showNoMoreData() {
        const noMoreData = document.getElementById('noMoreData');
        if (noMoreData) noMoreData.style.display = 'block';
    }
    
    showError(message) {
        console.error(message);
        // 간단한 에러 메시지 표시
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ff4444; color: white; padding: 1rem; border-radius: 5px; z-index: 1000;';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    resetProjects() {
        const projectGrid = document.getElementById('projectGrid');
        const noMoreData = document.getElementById('noMoreData');
        
        if (projectGrid) projectGrid.innerHTML = '';
        if (noMoreData) noMoreData.style.display = 'none';
        this.hasMoreData = true;
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('ProjectManager DOM 로드됨');
    
    // 프로젝트 페이지가 로드될 때만 초기화
    const projectPage = document.querySelector('[data-page="projects"]');
    if (projectPage) {
        console.log('프로젝트 페이지 발견, ProjectManager 초기화');
        window.projectManager = new ProjectManager();
    } else {
        console.log('프로젝트 페이지를 찾을 수 없음');
    }
});

// 페이지 변경 시 프로젝트 로드
document.addEventListener('pageChanged', (event) => {
    if (event.detail.page === 'projects') {
        console.log('프로젝트 페이지로 변경됨');
        // 이미 초기화되어 있다면 다시 로드
        if (window.projectManager) {
            window.projectManager.loadProjects(true);
        } else {
            window.projectManager = new ProjectManager();
        }
    }
});

// 네비게이션 클릭 시에도 초기화
document.addEventListener('click', (event) => {
    if (event.target.matches('[data-nav-link]') && event.target.getAttribute('data-nav-link') === 'projects') {
        console.log('프로젝트 네비게이션 클릭됨');
        setTimeout(() => {
            if (!window.projectManager) {
                window.projectManager = new ProjectManager();
            } else {
                window.projectManager.loadProjects(true);
            }
        }, 100);
    }
}); 