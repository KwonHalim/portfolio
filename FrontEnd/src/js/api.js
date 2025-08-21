'use strict';

// API 기본 URL 설정
const API_BASE_URL = `${window.appConfig.getApiBaseUrl()}/api`;

/**
 * [리팩토링] API 요청을 위한 헬퍼 함수
 * @param {string} url - 요청할 URL
 * @param {object} options - fetch 함수에 전달할 옵션
 * @returns {Promise<any>} - API 응답의 result 필드
 */
async function fetchApi(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            // 서버에서 받은 에러 메시지를 포함하여 에러를 throw합니다.
            const errorData = await response.json().catch(() => ({})); // JSON 파싱 실패 시 빈 객체 반환
            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.result; // 공통적으로 result 필드를 반환합니다.

    } catch (error) {
        // API 요청 중 오류가 발생했습니다
    }
}

/**
 * 프로필 정보를 가져오는 함수
 */
async function fetchProfileData() {
    return fetchApi(`${API_BASE_URL}/about/KwonHalim`);
}

/**
 * 타임라인 정보를 가져오는 함수
 */
async function fetchTimelineData() {
    return fetchApi(`${API_BASE_URL}/timeline/KwonHalim`);
}

/**
 * 페이지 로드 시 프로필 데이터를 적용하는 함수
 */
async function loadProfileData() {
    
    // Sidebar에 로딩 메시지 추가 (기존 내용 숨기기)
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // 기존 내용 숨기기
        const sidebarInfo = sidebar.querySelector('.sidebar-info');
        const sidebarInfoMore = sidebar.querySelector('.sidebar-info_more');
        if (sidebarInfo) sidebarInfo.style.display = 'none';
        if (sidebarInfoMore) sidebarInfoMore.style.display = 'none';
        
        const sidebarLoading = document.createElement('div');
        sidebarLoading.className = 'loading-message';
        sidebarLoading.innerHTML = '<div class="loading-spinner"></div>로딩중입니다.';
        sidebarLoading.id = 'sidebarLoading';
        sidebar.appendChild(sidebarLoading);
    }
    
    // About Me 섹션에 로딩 메시지 추가
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        const aboutLoading = document.createElement('div');
        aboutLoading.className = 'loading-message';
        aboutLoading.innerHTML = '<div class="loading-spinner"></div>로딩중입니다.';
        aboutLoading.id = 'aboutLoading';
        aboutText.appendChild(aboutLoading);
    }
    
    // Tech Stack 섹션에 로딩 메시지 추가
    const serviceList = document.querySelector('.service-list');
    if (serviceList) {
        const techLoading = document.createElement('div');
        techLoading.className = 'loading-message';
        techLoading.innerHTML = '<div class="loading-spinner"></div>로딩중입니다.';
        techLoading.id = 'techLoading';
        serviceList.appendChild(techLoading);
    }
    
    try {
        const profileData = await fetchProfileData();

        if (profileData) {
            // 페이지 제목 업데이트
            document.title = `${profileData.job_type} - ${profileData.name}`;

            // 사이드바 정보 업데이트
            const nameElement = document.querySelector('.name');
            if (nameElement) {
                nameElement.textContent = profileData.name;
                nameElement.title = profileData.name;
            }

            const jobElement = document.querySelector('.job');
            if (jobElement) {
                jobElement.textContent = profileData.job_type;
            }

            // 프로필 이미지 업데이트
            const profileImage = document.getElementById('profileImage');
            if (profileImage && profileData.profile_path) {
                // 백엔드에서 제공하는 경로를 getApiBaseUrl과 조합
                const imageSrc = `${window.appConfig.getApiBaseUrl()}/${profileData.profile_path}`;
                profileImage.src = imageSrc;
                profileImage.alt = profileData.name;
                
                // 이미지 로드 실패 시 아무것도 하지 않음 (깨진 상태 유지)
                profileImage.onerror = function() {
                    // 이미지 로드 실패 시 아무것도 하지 않음
                };
            }

            // About 섹션 제목 업데이트
            const articleTitle = document.querySelector('.about .article-title');
            if (articleTitle) {
                articleTitle.textContent = profileData.title;
            }

            // About 텍스트 업데이트 (introduction 사용)
            if (aboutText && profileData.introduction) {
                // About Me 로딩 메시지 제거
                const aboutLoading = document.getElementById('aboutLoading');
                if (aboutLoading) {
                    aboutLoading.remove();
                }
                
                // [보안] textContent를 사용하여 안전하게 텍스트를 설정합니다.
                // 만약 HTML을 의도적으로 사용해야 한다면, 서버에서 오는 값을 신뢰할 수 있어야 합니다.
                const p = document.createElement('p');
                p.textContent = profileData.introduction;
                aboutText.innerHTML = ''; // 기존 내용 초기화
                aboutText.appendChild(p);
            } else {
            }

            // Tech Stack 업데이트
            updateTechStack(profileData.techInfos);

            // 연락처 정보 업데이트
            updateContactInfo(profileData);
            
            // 모든 로딩 메시지 제거
            removeLoadingMessages();
            
            // 사이드바와 테크스택의 기존 내용 다시 표시
            restoreSectionContents();
        }
    } catch (error) {
        // 각 섹션별로 오류 메시지 표시
        showSectionErrors();
    }
}

/**
 * Tech Stack 섹션을 동적으로 업데이트하는 함수
 * @param {Array} techInfos - 기술 스택 정보 배열
 */
function updateTechStack(techInfos) {
    const serviceList = document.querySelector('.service-list');
    if (!serviceList) {
        return;
    }

    // Tech Stack 로딩 메시지 제거
    const techLoading = document.getElementById('techLoading');
    if (techLoading) {
        techLoading.remove();
    }

    // 기존 내용을 비우고 새로운 내용으로 교체
    serviceList.innerHTML = '';

    if (techInfos && techInfos.length > 0) {
        // type을 기준으로 그룹화
        const groupedTech = {};
        techInfos.forEach(techInfo => {
            const { type = 'Other', stack = '', description = '', icon_path = './assets/images/icon-design.svg' } = techInfo;
            
            if (!groupedTech[type]) {
                groupedTech[type] = [];
            }
            groupedTech[type].push({ stack, description, icon_path });
        });

        // 각 그룹별로 렌더링
        Object.entries(groupedTech).forEach(([type, techItems]) => {
            // 그룹 제목 추가 (전체 너비 차지)
            const groupTitle = document.createElement('h4');
            groupTitle.className = 'tech-group-title';
            groupTitle.textContent = type;
            serviceList.appendChild(groupTitle);

            // 그룹 내 기술 스택 아이템들 렌더링
            techItems.forEach(techInfo => {
                const { stack, description, icon_path } = techInfo;

                const serviceItem = document.createElement('li');
                serviceItem.className = 'service-item';

                // API 경로에서 이미지 로드
                let imageSrc = icon_path;
                if (icon_path && !icon_path.startsWith('./assets/') && !icon_path.startsWith('http')) {
                    // API 경로가 제공된 경우
                    imageSrc = `${window.appConfig.getApiBaseUrl()}/${icon_path}`;
                }

                // [보안] innerHTML 사용 시 변수 값에 주의해야 하지만, 여기서는 제어된 값이므로 유지합니다.
                // 더 안전하게 하려면 모든 요소를 createElement로 생성하고 appendChild로 추가하는 것이 좋습니다.
                serviceItem.innerHTML = `
                    <div class="service-icon-box">
                        <img src="${imageSrc}" alt="${stack} icon" width="40" onerror="this.src='./assets/images/icon-design.svg';">
                    </div>
                    <div class="service-content-box">
                        <h4 class="h4 service-item-title">${stack}</h4>
                        <p class="service-item-text">
                            ${description}
                        </p>
                    </div>
                `;
                serviceList.appendChild(serviceItem);
            });
        });
    }
}

/**
 * 연락처 정보를 업데이트하는 함수
 * @param {object} profileData - 프로필 데이터
 */
function updateContactInfo(profileData) {
    // 이메일 업데이트
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink && profileData.email) {
        emailLink.href = `mailto:${profileData.email}`;
        emailLink.textContent = profileData.email;
    }

    // GitHub 링크 업데이트
    const githubLink = document.querySelector('a[href*="github.com"]');
    if (githubLink && profileData.github_url) {
        githubLink.href = profileData.github_url;
        // GitHub 사용자 이름이 제공되면 표시, 아니면 URL 마지막 부분을 사용
        const githubUsername = profileData.github_username || profileData.github_url.split('/').pop();
        githubLink.textContent = githubUsername;
    }

    // 위치 정보 업데이트
    const locationAddress = document.querySelector('address');
    if (locationAddress && profileData.location) {
        locationAddress.textContent = profileData.location;
    }

    // Birthday 업데이트
    const birthdayTime = document.querySelector('time[datetime]');
    if (birthdayTime && profileData.birthday) {
        birthdayTime.setAttribute('datetime', profileData.birthday);
        const date = new Date(profileData.birthday);
        // 날짜 포맷을 'Month Day, Year' 형식으로 변경
        birthdayTime.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}


/**
 * 타임라인 데이터를 동적으로 렌더링하는 함수
 */
async function loadTimelineData() {
    
    // Resume 섹션에 로딩 메시지 추가
    const resumeSection = document.querySelector('.resume[data-page="timeline"]');
    if (resumeSection) {
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.innerHTML = '<div class="loading-spinner"></div>로딩중입니다.';
        loadingMsg.id = 'timelineLoading';
        resumeSection.appendChild(loadingMsg);
    }
    
    try {
        const timelineData = await fetchTimelineData();

        if (timelineData) {
            // Education 및 Experience 섹션 업데이트
            updateTimelineSection('.resume[data-page="timeline"] .timeline:nth-of-type(1) .timeline-list', timelineData.educations, 'library-outline');
            updateTimelineSection('.resume[data-page="timeline"] .timeline:nth-of-type(2) .timeline-list', timelineData.experiences, 'briefcase-outline');

            // 타임라인 기능 재초기화
            if (window.reinitializeTimeline) {
                window.reinitializeTimeline();
            }
            
            // 로딩 메시지 제거
            const loadingMsg = document.getElementById('timelineLoading');
            if (loadingMsg) loadingMsg.remove();
        }
    } catch (error) {
        // 로딩 메시지를 오류 메시지로 변경
        const loadingMsg = document.getElementById('timelineLoading');
        if (loadingMsg) {
            loadingMsg.innerHTML = '오류로 정보를 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.';
            loadingMsg.className = 'error-message';
        }
    }
}

/**
 * [리팩토링] 타임라인 섹션을 동적으로 업데이트하는 함수 (Education, Experience 공통 로직 추출)
 * @param {string} listSelector - 타임라인 리스트를 선택할 CSS 선택자
 * @param {Array} items - 타임라인 아이템 배열
 * @param {string} defaultIcon - 기본 ion-icon 이름
 */
function updateTimelineSection(listSelector, items, defaultIcon) {
    const list = document.querySelector(listSelector);
    if (!list) {
        return;
    }

    list.innerHTML = ''; // 기존 내용 초기화

    if (items && items.length > 0) {
        items.forEach(item => {
            const timelineItem = document.createElement('li');
            timelineItem.className = 'timeline-item';
            timelineItem.setAttribute('data-timeline-item', '');

            const {
                place = '',
                startDate = '',
                endDate = '',
                simpleDescription = '',
                detailDescription = '',
                iconPath = ''
            } = item;

            const dateRange = startDate && endDate ? `${startDate} — ${endDate}` : startDate;
            
            // API_BASE_URL을 사용하여 이미지 경로 설정
            let fullIconPath = '';
            if (iconPath) {
                if (iconPath.startsWith('http')) {
                    fullIconPath = iconPath; // 이미 전체 URL인 경우
                } else {
                    fullIconPath = `${window.appConfig.getApiBaseUrl()}/${iconPath}`;
                }
            }
            
            const iconHtml = iconPath
                ? `<img src="${fullIconPath}" alt="${place}" width="20" height="20">`
                : `<ion-icon name="${defaultIcon}"></ion-icon>`;

            // [보안] innerHTML에 변수를 사용할 때는 신뢰할 수 있는 데이터인지 확인해야 합니다.
            // 여기서는 서버에서 받은 데이터를 사용하므로, 서버 측에서 데이터 정제(Sanitization)가 이루어졌다고 가정합니다.
            timelineItem.innerHTML = `
                <div class="timeline-item-header">
                    <div class="timeline-icon">${iconHtml}</div>
                    <div class="timeline-content">
                        <h4 class="h4 timeline-item-title">${place}</h4>
                        <span>${dateRange}</span>
                        <p class="timeline-text">${simpleDescription}</p>
                    </div>
                    <div class="timeline-click-hint">
                        <ion-icon name="chevron-down-outline"></ion-icon>
                    </div>
                </div>
                <div class="timeline-detail-content">
                    <div class="timeline-detail-text">
                        <h5 class="h5">
                            <ion-icon name="information-circle-outline"></ion-icon>
                            상세 정보
                        </h5>
                        <p>${detailDescription}</p>
                    </div>
                </div>
            `;
            list.appendChild(timelineItem);
        });
    }
}

/**
 * 모든 로딩 메시지를 제거하는 함수
 */
function removeLoadingMessages() {
    const loadingIds = ['sidebarLoading', 'aboutLoading', 'techLoading'];
    loadingIds.forEach(id => {
        const loadingMsg = document.getElementById(id);
        if (loadingMsg) loadingMsg.remove();
    });
}

/**
 * 각 섹션별로 오류 메시지를 표시하는 함수
 */
function showSectionErrors() {
    // Sidebar 오류 메시지 - 기존 내용 지우고 오류 메시지만 표시
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // 기존 내용 숨기기 (이미 숨겨져 있음)
        const sidebarInfo = sidebar.querySelector('.sidebar-info');
        const sidebarInfoMore = sidebar.querySelector('.sidebar-info_more');
        if (sidebarInfo) sidebarInfo.style.display = 'none';
        if (sidebarInfoMore) sidebarInfoMore.style.display = 'none';
        
        // 오류 메시지 표시
        const sidebarLoading = document.getElementById('sidebarLoading');
        if (sidebarLoading) {
            sidebarLoading.innerHTML = '오류로 정보를 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.';
            sidebarLoading.className = 'error-message';
        }
    }
    
    // About Me 오류 메시지
    const aboutLoading = document.getElementById('aboutLoading');
    if (aboutLoading) {
        aboutLoading.innerHTML = '오류로 정보를 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.';
        aboutLoading.className = 'error-message';
    }
    
    // Tech Stack 오류 메시지 - 기존 내용 지우고 오류 메시지만 표시
    const serviceList = document.querySelector('.service-list');
    if (serviceList) {
        // 기존 내용 지우기
        serviceList.innerHTML = '';
        
        // 오류 메시지 표시
        const techLoading = document.getElementById('techLoading');
        if (techLoading) {
            techLoading.innerHTML = '오류로 정보를 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.';
            techLoading.className = 'error-message';
            serviceList.appendChild(techLoading);
        }
    }
}

/**
 * 섹션의 기존 내용을 복원하는 함수
 */
function restoreSectionContents() {
    // Sidebar 내용 복원
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const sidebarInfo = sidebar.querySelector('.sidebar-info');
        const sidebarInfoMore = sidebar.querySelector('.sidebar-info_more');
        if (sidebarInfo) sidebarInfo.style.display = '';
        if (sidebarInfoMore) sidebarInfoMore.style.display = '';
    }
}


// 페이지 로드 시 API 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    // 여러 비동기 작업을 병렬로 실행하여 로딩 시간 단축
    Promise.all([
        loadProfileData(),
        loadTimelineData()
    ]).catch(error => {
        // 페이지 초기 데이터 로드 중 에러 발생
    });
});