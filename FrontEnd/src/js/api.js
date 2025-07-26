// API 관련 함수들
const API_BASE_URL = 'http://localhost:8080/api';

// 프로필 정보를 가져오는 함수
async function fetchProfileData() {
    try {
        const response = await fetch(`${API_BASE_URL}/about/KwonHalim`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.result; // ApiResponse의 result 필드
    } catch (error) {
        console.error('프로필 데이터를 가져오는 중 오류가 발생했습니다:', error);
        return null;
    }
}

// 페이지 로드 시 프로필 데이터를 적용하는 함수
async function loadProfileData() {
    console.log('프로필 데이터 로드 시작...');
    const profileData = await fetchProfileData();
    
    console.log('받은 프로필 데이터:', profileData);
    console.log('introduction:', profileData.introduction);
    console.log('birthday:', profileData.birthday);
    
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
            profileImage.src = profileData.profile_path;
            profileImage.alt = profileData.name;
        }
        
        // About 섹션 제목 업데이트
        const articleTitle = document.querySelector('.about .article-title');
        if (articleTitle) {
            articleTitle.textContent = profileData.title;
        }
        
        // About 텍스트 업데이트 (introduction 사용)
        const aboutText = document.querySelector('.about-text');
        console.log('aboutText 요소:', aboutText);
        console.log('introduction 값:', profileData.introduction);
        if (aboutText && profileData.introduction) {
            aboutText.innerHTML = `<p>${profileData.introduction}</p>`;
            console.log('소개글 업데이트 완료');
        } else {
            console.log('소개글 업데이트 실패 - 요소 또는 데이터 없음');
        }
        
        // Birthday 업데이트
        const birthdayTime = document.querySelector('time[datetime]');
        if (birthdayTime && profileData.birthday) {
            birthdayTime.setAttribute('datetime', profileData.birthday);
            birthdayTime.textContent = profileData.birthday;
        }
        

        
        // Tech Stack 업데이트
        updateTechStack(profileData.techInfos);
        
        // 연락처 정보 업데이트
        updateContactInfo(profileData);
    }
}



        // Tech Stack 섹션을 동적으로 업데이트하는 함수
        function updateTechStack(techInfos) {
            console.log('updateTechStack 호출됨');
            console.log('techInfos:', techInfos);
            
            const serviceList = document.querySelector('.service-list');
            if (!serviceList) {
                console.log('service-list 요소를 찾을 수 없음');
                return;
            }
            
            // 기존 내용을 비우고 새로운 내용으로 교체
            serviceList.innerHTML = '';
            
            if (techInfos && techInfos.length > 0) {
                techInfos.forEach((techInfo, index) => {
                    const stack = techInfo.stack || '';
                    const description = techInfo.description || '';
                    const iconPath = techInfo.icon_path || './assets/images/icon-design.svg';
                    
                    console.log(`인덱스 ${index}: stack="${stack}", description="${description}", iconPath="${iconPath}"`);
                    
                    const serviceItem = document.createElement('li');
                    serviceItem.className = 'service-item';
                    
                    serviceItem.innerHTML = `
                        <div class="service-icon-box">
                            <img src="${iconPath}" alt="${stack} icon" width="40">
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
            }
        }

// 연락처 정보를 업데이트하는 함수
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
        githubLink.textContent = `@${profileData.github_username}`;
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
        birthdayTime.textContent = profileData.birthday;
    }
}

// 타임라인 정보를 가져오는 함수
async function fetchTimelineData() {
    try {
        const response = await fetch(`${API_BASE_URL}/timeline/KwonHalim`);
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

// Education 섹션을 동적으로 업데이트하는 함수
function updateEducationSection(educations) {
    const educationList = document.querySelector('.resume[data-page="timeline"] .timeline-list');
    if (!educationList) {
        console.log('Education timeline-list 요소를 찾을 수 없음');
        return;
    }
    
    // 기존 내용을 비우고 새로운 내용으로 교체
    educationList.innerHTML = '';
    
    if (educations && educations.length > 0) {
        educations.forEach((education, index) => {
            const timelineItem = document.createElement('li');
            timelineItem.className = 'timeline-item';
            timelineItem.setAttribute('data-timeline-item', '');
            
            const startDate = education.startDate || '';
            const endDate = education.endDate || '';
            const dateRange = startDate && endDate ? `${startDate} — ${endDate}` : '';
            
            timelineItem.innerHTML = `
                <div class="timeline-item-header">
                    <div class="timeline-icon">
                        ${education.iconPath ? `<img src="${education.iconPath}" alt="${education.place || 'Education'}" width="20" height="20">` : '<ion-icon name="library-outline"></ion-icon>'}
                    </div>
                    <div class="timeline-content">
                        <h4 class="h4 timeline-item-title">${education.place || ''}</h4>
                        <span>${dateRange}</span>
                        <p class="timeline-text">
                            ${education.simpleDescription || ''}
                        </p>
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
                        <p>${education.detailDescription || ''}</p>
                    </div>
                </div>
            `;
            
            educationList.appendChild(timelineItem);
        });
    }
}

// Experience 섹션을 동적으로 업데이트하는 함수
function updateExperienceSection(experiences) {
    // Experience 섹션은 두 번째 timeline 섹션에 있음
    const timelineSections = document.querySelectorAll('.resume[data-page="timeline"] .timeline');
    const experienceSection = timelineSections[1]; // 두 번째 섹션이 Experience
    
    if (!experienceSection) {
        console.log('Experience 섹션을 찾을 수 없음');
        return;
    }
    
    const experienceList = experienceSection.querySelector('.timeline-list');
    if (!experienceList) {
        console.log('Experience timeline-list 요소를 찾을 수 없음');
        return;
    }
    
    // 기존 내용을 비우고 새로운 내용으로 교체
    experienceList.innerHTML = '';
    
    if (experiences && experiences.length > 0) {
        experiences.forEach((experience, index) => {
            const timelineItem = document.createElement('li');
            timelineItem.className = 'timeline-item';
            timelineItem.setAttribute('data-timeline-item', '');
            
            const startDate = experience.startDate || '';
            const endDate = experience.endDate || '';
            const dateRange = startDate && endDate ? `${startDate} — ${endDate}` : '';
            
            timelineItem.innerHTML = `
                <div class="timeline-item-header">
                    <div class="timeline-icon">
                        ${experience.iconPath ? `<img src="${experience.iconPath}" alt="${experience.place || 'Experience'}" width="20" height="20">` : '<ion-icon name="briefcase-outline"></ion-icon>'}
                    </div>
                    <div class="timeline-content">
                        <h4 class="h4 timeline-item-title">${experience.place || ''}</h4>
                        <span>${dateRange}</span>
                        <p class="timeline-text">
                            ${experience.simpleDescription || ''}
                        </p>
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
                        <p>${experience.detailDescription || ''}</p>
                    </div>
                </div>
            `;
            
            experienceList.appendChild(timelineItem);
        });
    }
}

// 페이지 로드 시 API 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    // API 데이터 로드 시도
    loadProfileData().catch(error => {
        console.error('API 데이터 로드 실패:', error);
        // API 호출 실패 시 기본값 설정
        setDefaultValues();
    });
    
    // 타임라인 데이터 로드 시도
    loadTimelineData().catch(error => {
        console.error('타임라인 데이터 로드 실패:', error);
    });
});

// API 호출 실패 시 기본값을 설정하는 함수
function setDefaultValues() {
    document.title = 'Backend Developer - 권하림';
    
    const nameElement = document.querySelector('.name');
    if (nameElement) {
        nameElement.textContent = '권하림';
        nameElement.title = '권하림';
    }
    
    const jobElement = document.querySelector('.job');
    if (jobElement) {
        jobElement.textContent = 'Backend Developer';
    }
    
    const articleTitle = document.querySelector('.about .article-title');
    if (articleTitle) {
        articleTitle.textContent = 'About me';
    }
    
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        aboutText.innerHTML = `
            <p>안녕하세요</p>
            <p>백엔드 개발자 희망입니다.</p>
        `;
    }
    
    // Birthday 기본값 설정
    const birthdayTime = document.querySelector('time[datetime]');
    if (birthdayTime) {
        birthdayTime.setAttribute('datetime', '2000-04-25');
        birthdayTime.textContent = 'April 25, 2000';
    }
    
    // 기본 Tech Stack 설정
    const serviceList = document.querySelector('.service-list');
    if (serviceList) {
        serviceList.innerHTML = `
            <li class="service-item">
                <div class="service-icon-box">
                    <img src="./assets/images/icon-design.svg" alt="Spring icon" width="40">
                </div>
                <div class="service-content-box">
                    <h4 class="h4 service-item-title">Spring</h4>
                    <p class="service-item-text">
                        스프링을 공부했습니다.
                    </p>
                </div>
            </li>
        `;
    }
} 