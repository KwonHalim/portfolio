    'use strict';

    class ProjectManager {
        constructor() {
            this.currentCategory = 'all';
            this.isLoading = false;
            // 환경변수에서 API URL 설정 가져오기 (기본값)
            this.apiBaseUrl = 'http://localhost:8080/api/projects';
            this.currentMediaIndex = 0;
            this.currentMediaPaths = [];
            this.categories = new Set();
            
            // 전역 변수로 저장
            window.projectManager = this;
            
            this.init();
        }
        
        async init() {
            console.log('ProjectManager 초기화 시작');
            
            // 환경변수 초기화 대기
            if (window.appConfig) {
                await window.appConfig.waitForInit();
                this.apiBaseUrl = window.appConfig.getProjectsApiUrl();
                console.log('ProjectManager API URL 설정:', this.apiBaseUrl);
            }
            
            const projectGrid = document.getElementById('projectGrid');
            if (!projectGrid) {
                console.error('projectGrid 요소를 찾을 수 없습니다!');
                return;
            }
            
            // 백엔드에서 프로젝트 데이터를 먼저 로드
            this.loadInitialProjects();
            this.setupFilters();
            
            // ✅ [수정] 아래 로직으로 변경해주세요.
            // 전역 플래그를 확인하여 setupModal이 최초 한 번만 실행되도록 보장합니다.
            if (!window.isModalHandlerSetup) {
                console.log('최초로 모달 이벤트 핸들러를 설정합니다.');
                this.setupModal();
                window.isModalHandlerSetup = true; // 플래그를 true로 설정
            }
            
            console.log('ProjectManager 초기화 완료');
        }
        
        async loadProjects(reset = false) {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.showLoading();
            
            try {
                // 페이징 없이 단순하게 API 호출
                let url = this.apiBaseUrl;
                
                // 카테고리가 'all'이 아닐 때만 파라미터 추가
                if (this.currentCategory !== 'all') {
                    url += `?category=${encodeURIComponent(this.currentCategory)}`;
                }
                
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
                
                // API 응답 데이터 처리
                let projects = [];
                
                if (data.result && Array.isArray(data.result)) {
                    // result 안에 배열이 있는 경우 (현재 API 응답 구조)
                    projects = data.result;
                    console.log('result 안의 배열 형태로 처리됨:', projects);
                } else if (Array.isArray(data)) {
                    // 직접 배열 형태
                    projects = data;
                    console.log('직접 배열 형태로 처리됨:', projects);
                } else {
                    console.error('지원하지 않는 API 응답 구조:', data);
                    projects = [];
                }
                
                if (projects && projects.length > 0) {
                    console.log(`${projects.length}개의 프로젝트를 렌더링합니다:`, projects);
                    
                    // 프로젝트에서 카테고리 추출
                    this.extractCategoriesFromProjects(projects);
                    
                    // 새로 렌더링 (resetProjects는 이미 위에서 호출됨)
                    this.renderProjects(projects);
                    
                } else {
                    console.log('프로젝트 데이터가 없습니다. 기본 프로젝트를 표시합니다.');
                    this.showDefaultProjects();
                }
                
            } catch (error) {
                console.error('프로젝트 로딩 실패:', error);
                // 백엔드 연결 실패 시 기본 프로젝트 표시
                console.log('백엔드 연결 실패, 기본 프로젝트를 표시합니다.');
                this.showDefaultProjects();
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
            
            // 기존 프로젝트 완전 제거
            grid.innerHTML = '';
            
            // 새로 렌더링 (순차적으로 1, 2, 3, 4, 5, 6... 순서)
            projects.forEach((project, index) => {
                const projectElement = this.createProjectElement(project, index);
                grid.appendChild(projectElement);
            });
        }
        
        createProjectElement(project, index) {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            projectItem.setAttribute('data-category', project.category);
            
            // 이미지 경로 처리 - 보안 개선
            let imagePath = project.imagePath || './assets/images/project-1.jpg';
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('./')) {
                // 상대 경로인 경우 기본 이미지 사용
                imagePath = './assets/images/project-1.jpg';
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
            
            // 9방향 슬라이드 인 애니메이션 적용
            this.applyAnimationToProject(projectItem, index);
            
            // 애니메이션 완료 후 animated 클래스 추가 (애니메이션 이벤트 리스너 사용)
            const handleAnimationEnd = () => {
                if (projectItem && projectItem.parentNode) {
                    projectItem.classList.add('animated');
                    projectItem.setAttribute('data-animated', 'true');
                    // 인라인 스타일 제거
                    projectItem.style.removeProperty('opacity');
                    projectItem.style.removeProperty('transform');
                    projectItem.style.removeProperty('animation');
                    // 이벤트 리스너 제거
                    projectItem.removeEventListener('animationend', handleAnimationEnd);
                }
            };
            
            projectItem.addEventListener('animationend', handleAnimationEnd);
            
            return projectItem;
        }
        
        // 이 함수는 새로 렌더링되는 프로젝트 아이템과 그 인덱스를 파라미터로 받습니다.
        applyAnimationToProject(projectElement, index) {
            
            // 1. 열(Column) 위치 계산 (0: 왼쪽, 1: 가운데, 2: 오른쪽)
            const column = index % 3;

            // 2. 행(Row) 위치 계산
            const row = Math.floor(index / 3);
            
            let animationName = 'slide-in-fwd-center'; // 기본값은 중앙

            // 3. 위치에 따라 애니메이션 이름 결정 (순차적으로 1, 2, 3, 4, 5, 6...)
            if (row === 0) {
                // 첫 번째 행: 위에서 슬라이드 인
                if (column === 0) animationName = 'slide-in-fwd-tl';       // 1번 위치
                else if (column === 1) animationName = 'slide-in-fwd-top'; // 2번 위치
                else animationName = 'slide-in-fwd-tr';                    // 3번 위치
            } else if (row === 1) {
                // 두 번째 행: 좌우에서 슬라이드 인
                if (column === 0) animationName = 'slide-in-fwd-left';     // 4번 위치
                else if (column === 1) animationName = 'slide-in-fwd-center'; // 5번 위치
                else animationName = 'slide-in-fwd-right';                 // 6번 위치
            } else if (row === 2) {
                // 세 번째 행: 아래에서 슬라이드 인
                if (column === 0) animationName = 'slide-in-fwd-bl';       // 7번 위치
                else if (column === 1) animationName = 'slide-in-fwd-bottom'; // 8번 위치
                else animationName = 'slide-in-fwd-br';                    // 9번 위치
            } else {
                // 그 이후 행들: 기본 중앙 애니메이션
                animationName = 'slide-in-fwd-center';
            }

            // 4. 애니메이션 지연 시간 계산 (순차적 등장 효과)
            const randomDelay = 0.1 + Math.random() * 0.5; // 0.1~0.6초 랜덤 지연

            // 5. 결정된 애니메이션 이름과 지연 시간을 적용
            projectElement.style.animation = `${animationName} 0.3s ease-out ${randomDelay}s`;
            
            console.log(`프로젝트 ${index + 1} (행: ${row + 1}, 열: ${column + 1})에 ${animationName} 애니메이션 적용 (지연: ${randomDelay.toFixed(3)}s)`);
        }
        
        // 프로젝트 아이템의 인덱스를 가져오는 함수
        getProjectIndex(projectElement) {
            const projectGrid = document.getElementById('projectGrid');
            if (!projectGrid) return 0;
            
            const projectItems = projectGrid.querySelectorAll('.project-item');
            for (let i = 0; i < projectItems.length; i++) {
                if (projectItems[i] === projectElement) {
                    return i;
                }
            }
            return projectItems.length; // 새로운 아이템의 경우 마지막 인덱스
        }
        
        // 전체 프로젝트 개수를 가져오는 함수
        getTotalProjectCount() {
            const projectGrid = document.getElementById('projectGrid');
            if (!projectGrid) return 0;
            
            return projectGrid.querySelectorAll('.project-item').length;
        }
        
        // 모달 닫기 (애니메이션 없이)
        closeModal(modal) {
            modal.style.display = 'none';
            modal.classList.remove('modal-open', 'modal-close');
        }
        
        async showProjectDetail(projectId) {
            try {
                console.log(`프로젝트 상세 정보 로딩: ${projectId}`);
                const projectDetailUrl = window.appConfig ? window.appConfig.getProjectDetailApiUrl(projectId) : `${this.apiBaseUrl}/${projectId}`;
                const response = await fetch(projectDetailUrl);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('프로젝트 상세 정보:', data);
                
                if (data.result) {
                    const project = data.result;
                    this.updateModal(project);
                    const modal = document.getElementById('projectModal');
                    console.log('모달 요소 (열기 시):', modal);
                                    if (modal) {
                    modal.style.display = 'block';
                    
                    // 모달 열기 애니메이션 적용
                    modal.classList.remove('modal-close');
                    modal.classList.add('modal-open');
                    
                    console.log('모달이 열렸습니다');
                    console.log('모달 display 속성:', modal.style.display);
                    
                    // 모달이 열릴 때 닫기 버튼에 이벤트 리스너 추가
                    const closeButton = modal.querySelector('.close-modal');
                    if (closeButton) {
                        // 기존 이벤트 리스너 제거 (중복 방지)
                        closeButton.removeEventListener('click', this.closeModalHandler);
                        
                        // 새로운 이벤트 리스너 추가
                        this.closeModalHandler = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🎯 닫기 버튼 직접 클릭 감지!');
                            this.closeModal(modal);
                            console.log('✅ 모달 닫기 완료');
                        };
                        
                        closeButton.addEventListener('click', this.closeModalHandler);
                        console.log('닫기 버튼 이벤트 리스너 추가됨');
                    }
                    
                    // 모달 배경 클릭 시 닫기 기능 추가
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            console.log('🎯 모달 배경 클릭 감지!');
                            this.closeModal(modal);
                            console.log('✅ 모달 닫기 완료');
                        }
                    });
                } else {
                    console.error('projectModal 요소를 찾을 수 없음 (열기 시)');
                }
                } else {
                    throw new Error('프로젝트 정보를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('프로젝트 상세 정보 로딩 실패:', error);
                // 백엔드 연결 실패 시 조용히 실패
            }
        }
        
        updateModal(project) {
            // 프로젝트 헤더 정보 업데이트
            document.getElementById('modalTitle').textContent = project.title;
            document.getElementById('modalCategory').textContent = project.category;
            
            // 기술 스택 렌더링
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
            
            // 프로젝트 메인 설명 업데이트
            const modalDescription = document.getElementById('modalDescription');
            if (modalDescription) {
                modalDescription.innerHTML = project.description || '프로젝트에 대한 상세한 설명이 없습니다.';
            }
            
            // 미디어 컨테이너 초기화
            const mediaContainer = document.getElementById('mediaContainer');
            mediaContainer.innerHTML = '';
            
            // API 응답 구조에 맞게 images 배열 처리
            let images = [];
            if (project.images && Array.isArray(project.images)) {
                images = project.images;
            } else if (project.imagePath) {
                // 기존 imagePath가 있는 경우 호환성 유지
                if (Array.isArray(project.imagePath)) {
                    images = project.imagePath.map(path => ({ imagePath: path, description: '' }));
                } else {
                    images = [{ imagePath: project.imagePath, description: '' }];
                }
            } else {
                images = [{ imagePath: './assets/images/project-1.jpg', description: '기본 이미지' }];
            }
            
            // 모든 이미지를 생성
            images.forEach((image, index) => {
                const isVideo = image.imagePath.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                
                // 미디어 이미지/비디오 섹션
                const mediaImage = document.createElement('div');
                mediaImage.className = 'media-image';
                
                if (isVideo) {
                    // 영상인 경우
                    const video = document.createElement('video');
                    video.controls = true;
                    video.preload = 'metadata';
                    video.crossOrigin = 'anonymous';
                    
                    let videoPath = image.imagePath;
                    if (videoPath && !videoPath.startsWith('http') && !videoPath.startsWith('./')) {
                        const baseUrl = window.appConfig ? window.appConfig.getApiUrl() : 'http://localhost:8080';
                        videoPath = `${baseUrl}/${videoPath}`;
                    }
                    
                    video.src = videoPath;
                    video.onerror = function() {
                        this.style.display = 'none';
                    };
                    
                    mediaImage.appendChild(video);
                } else {
                    // 이미지인 경우
                    const img = document.createElement('img');
                    img.alt = `Project Image ${index + 1}`;
                    
                    let imagePath = image.imagePath;
                    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('./')) {
                        const baseUrl = window.appConfig ? window.appConfig.getApiUrl() : 'http://localhost:8080';
                        imagePath = `${baseUrl}/${imagePath}`;
                    }
                    
                    img.src = imagePath;
                    img.onerror = function() {
                        this.onerror = null;
                        this.src = './assets/images/project-1.jpg';
                    };
                    
                    mediaImage.appendChild(img);
                }
                
                // 리사이즈 핸들 추가
                this.addResizeHandles(mediaImage);
                
                // 설명 섹션
                const mediaDescription = document.createElement('div');
                mediaDescription.className = 'media-description';
                
                const descriptionText = document.createElement('p');
                // API에서 받은 설명이 있으면 사용, 없으면 기본 설명
                if (image.description) {
                    descriptionText.innerHTML = image.description;
                } else {
                    descriptionText.textContent = '이 이미지에 대한 상세한 설명이 없습니다.';
                }
                
                mediaDescription.appendChild(descriptionText);
                
                // 미디어 아이템에 이미지와 설명 추가
                mediaItem.appendChild(mediaImage);
                mediaItem.appendChild(mediaDescription);
                
                mediaContainer.appendChild(mediaItem);
            });
            
            // 프로젝트 링크 설정
            const projectLinks = document.querySelector('.project-links');
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
        
        // 리사이즈 기능 추가 함수
        addResizeHandles(mediaImage) {
            // 미디어 이미지에 직접 리사이즈 이벤트 리스너 추가
            this.setupResizeListener(mediaImage);
        }
        
        // 리사이즈 이벤트 리스너 설정
        setupResizeListener(mediaImage) {
            let isResizing = false;
            let startX, startY, startWidth, startHeight;
            let resizeDirection = '';
            
            const startResize = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const rect = mediaImage.getBoundingClientRect();
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                
                // 클릭 위치에 따라 리사이즈 방향 결정
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                const width = rect.width;
                const height = rect.height;
                
                // 테두리 영역 감지 (40px로 확장)
                const borderSize = 50;
                
                let direction = '';
                
                // 모서리 영역
                if (x < borderSize && y < borderSize) direction = 'nw';
                else if (x > width - borderSize && y < borderSize) direction = 'ne';
                else if (x < borderSize && y > height - borderSize) direction = 'sw';
                else if (x > width - borderSize && y > height - borderSize) direction = 'se';
                // 가장자리 영역
                else if (y < borderSize) direction = 'n';
                else if (y > height - borderSize) direction = 's';
                else if (x < borderSize) direction = 'w';
                else if (x > width - borderSize) direction = 'e';
                else return; // 테두리 영역이 아니면 리사이즈하지 않음
                
                isResizing = true;
                resizeDirection = direction;
                mediaImage.classList.add('resizing');
                
                startX = clientX;
                startY = clientY;
                startWidth = width;
                startHeight = height;
                
                // 마우스와 터치 이벤트 모두 추가
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
                document.addEventListener('touchmove', resize, { passive: false });
                document.addEventListener('touchend', stopResize);
            };
            
            const resize = (e) => {
                if (!isResizing) return;
                
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                
                const deltaX = clientX - startX;
                const deltaY = clientY - startY;
                
                let newWidth = startWidth;
                let newHeight = startHeight;
                
                // 방향에 따라 크기 조절
                switch (resizeDirection) {
                    case 'e':
                        newWidth = startWidth + deltaX;
                        break;
                    case 'w':
                        newWidth = startWidth - deltaX;
                        break;
                    case 's':
                        newHeight = startHeight + deltaY;
                        break;
                    case 'n':
                        newHeight = startHeight - deltaY;
                        break;
                    case 'se':
                        newWidth = startWidth + deltaX;
                        newHeight = startHeight + deltaY;
                        break;
                    case 'sw':
                        newWidth = startWidth - deltaX;
                        newHeight = startHeight + deltaY;
                        break;
                    case 'ne':
                        newWidth = startWidth + deltaX;
                        newHeight = startHeight - deltaY;
                        break;
                    case 'nw':
                        newWidth = startWidth - deltaX;
                        newHeight = startHeight - deltaY;
                        break;
                }
                
                // 최소 크기 제한
                const minSize = 100;
                newWidth = Math.max(newWidth, minSize);
                newHeight = Math.max(newHeight, minSize);
                
                // 미디어 요소 크기 조절
                const mediaElement = mediaImage.querySelector('img, video');
                if (mediaElement) {
                    mediaElement.style.width = newWidth + 'px';
                    mediaElement.style.height = newHeight + 'px';
                    mediaElement.style.maxWidth = 'none';
                    mediaElement.style.maxHeight = 'none';
                }
            };
            
            const stopResize = () => {
                isResizing = false;
                resizeDirection = '';
                mediaImage.classList.remove('resizing');
                
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
                document.removeEventListener('touchmove', resize);
                document.removeEventListener('touchend', stopResize);
            };
            
            // 마우스와 터치 이벤트 모두 추가
            mediaImage.addEventListener('mousedown', startResize);
            mediaImage.addEventListener('touchstart', startResize, { passive: false });
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
            this.loadProjects(); // 카테고리 변경 시 새로 로드
        }
        
            setupModal() {
            console.log('모달 설정 시작');

            // 기존 이벤트 리스너 제거 (중복 방지)
            document.removeEventListener('click', this.handleModalClick);
            document.removeEventListener('keydown', this.handleModalKeydown);

            // 이벤트 핸들러를 클래스 메서드로 정의
            this.handleModalClick = (event) => {
                const modal = document.getElementById('projectModal');
                console.log('클릭 이벤트 발생:', event.target);
                console.log('클릭된 요소 클래스:', event.target.className);
                console.log('모달 상태:', modal ? modal.style.display : 'null');

                // 모달이 화면에 보이지 않으면 아무것도 하지 않습니다.
                if (!modal || modal.style.display !== 'block') {
                    console.log('모달이 닫혀있거나 존재하지 않음');
                    return;
                }

                // 1. 닫기 버튼(또는 그 안의 아이콘)을 클릭했는지 확인합니다.
                if (event.target.closest('.close-modal')) {
                    event.preventDefault(); // a 태그 등의 기본 동작 방지
                    event.stopPropagation(); // 이벤트 전파 중단
                    console.log('🎯 닫기 버튼 클릭 감지!');
                    modal.style.display = 'none';
                    console.log('✅ 모달 닫기 완료');
                    return;
                }
                // 2. 모달의 어두운 배경 부분을 클릭했는지 확인합니다.
                else if (event.target === modal) {
                    console.log('🎯 모달 바깥 영역 클릭 감지!');
                    modal.style.display = 'none';
                    console.log('✅ 모달 닫기 완료');
                    return;
                }
                // 3. 모달 콘텐츠 영역을 클릭했는지 확인 (닫지 않음)
                else if (event.target.closest('.modal-content')) {
                    console.log('모달 콘텐츠 영역 클릭 - 닫지 않음');
                    return;
                }
            };

            this.handleModalKeydown = (event) => {
                const modal = document.getElementById('projectModal');
                if (event.key === 'Escape' && modal && modal.style.display === 'block') {
                    console.log('🎯 ESC 키 감지!');
                    modal.style.display = 'none';
                    console.log('✅ 모달 닫기 완료');
                }
            };

            // 이벤트 리스너 등록
            document.addEventListener('click', this.handleModalClick);
            document.addEventListener('keydown', this.handleModalKeydown);

            // 닫기 버튼에 직접 이벤트 리스너 추가
            const closeButton = document.querySelector('.close-modal');
            if (closeButton) {
                closeButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const modal = document.getElementById('projectModal');
                    if (modal) {
                        console.log('🎯 닫기 버튼 직접 클릭 감지!');
                        modal.style.display = 'none';
                        console.log('✅ 모달 닫기 완료');
                    }
                });
            }

            console.log('모달 이벤트 리스너 설정 완료.');
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
            this.loadProjects();
        }
        
        showLoading() {
            const loadingSpinner = document.getElementById('loadingSpinner');
            if (loadingSpinner) loadingSpinner.style.display = 'block';
        }
        
        hideLoading() {
            const loadingSpinner = document.getElementById('loadingSpinner');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
        

        

        
        resetProjects() {
            const projectGrid = document.getElementById('projectGrid');
            
            if (projectGrid) {
                // 기존 요소들의 애니메이션 상태 완전 초기화
                const existingItems = projectGrid.querySelectorAll('.project-item');
                existingItems.forEach(item => {
                    item.classList.remove('animated');
                    item.classList.remove('active');
                    item.removeAttribute('data-animated');
                    item.style.animation = '';
                    item.style.opacity = '';
                    item.style.transform = '';
                });
                projectGrid.innerHTML = '';
            }
            this.hasMoreData = true;
        }
        

    }

    // 초기화
// ProjectManager 인스턴스를 전역에서 관리합니다.
// 이렇게 하면 여러 이벤트에서 동일한 인스턴스를 참조할 수 있습니다.
    if (typeof window.projectManager === 'undefined') {
        window.projectManager = null;
    }

    // 페이지가 처음 로드될 때 실행됩니다.
    document.addEventListener('DOMContentLoaded', () => {
        console.log('ProjectManager DOM 로드됨');
        
        // 'projects' 페이지가 기본 페이지일 경우에만 인스턴스를 생성합니다.
        const projectPage = document.querySelector('article.projects[data-page="projects"]');
        if (projectPage && projectPage.classList.contains('active')) {
            if (!window.projectManager) {
                console.log('프로젝트 페이지 발견, ProjectManager 인스턴스를 생성합니다.');
                window.projectManager = new ProjectManager();
            }
        } else {
            console.log('현재 페이지는 프로젝트 페이지가 아니므로 초기화를 건너뜁니다.');
        }
    });

    // 네비게이션으로 페이지가 변경될 때 실행됩니다.
    // (사용자 정의 이벤트로 보이며, navigation.js에서 발생시키는 것으로 추정됩니다.)
    document.addEventListener('pageChanged', (event) => {
        if (event.detail.page === 'projects') {
            console.log('프로젝트 페이지로 변경됨');
            // 인스턴스가 아직 생성되지 않았다면 새로 생성하고,
            // 이미 존재한다면 프로젝트 목록만 다시 로드합니다.
            if (!window.projectManager) {
                console.log('ProjectManager 인스턴스를 새로 생성합니다.');
                window.projectManager = new ProjectManager();
            } else {
                console.log('기존 인스턴스를 사용하여 프로젝트를 새로고침합니다.');
                // 페이지 전환 시 모든 애니메이션 상태 초기화
                const projectGrid = document.getElementById('projectGrid');
                if (projectGrid) {
                    const existingItems = projectGrid.querySelectorAll('.project-item');
                    existingItems.forEach(item => {
                        item.classList.remove('animated');
                        item.classList.remove('active');
                        item.removeAttribute('data-animated');
                        item.style.animation = '';
                        item.style.opacity = '';
                        item.style.transform = '';
                    });
                }
                window.projectManager.loadProjects(true);
            }
        }
    });

    // 전역 모달 닫기 함수
    window.closeProjectModal = function() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            console.log('🎯 전역 닫기 함수 호출!');
            if (window.projectManager) {
                window.projectManager.closeModal(modal);
            } else {
                modal.style.display = 'none';
            }
            console.log('✅ 모달 닫기 완료');
        }
    };

    // 네비게이션 링크 클릭 이벤트는 pageChanged 이벤트를 발생시키므로
    // 여기에서 중복으로 인스턴스를 생성할 필요가 없습니다.
    // 만약 navigation.js에서 'pageChanged' 이벤트를 사용하지 않는다면,
    // 위의 'pageChanged' 리스너 코드를 이 아래로 옮겨야 합니다.
    document.addEventListener('click', (event) => {
        if (event.target.matches('[data-nav-link]') && event.target.getAttribute('data-nav-link') === 'projects') {
            console.log('프로젝트 네비게이션 클릭됨 (페이지 전환은 pageChanged 이벤트가 처리)');
        }
    });