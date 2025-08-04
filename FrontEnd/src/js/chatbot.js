'use strict';

// Chatbot functionality
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (message) {
    input.value = '';

    try {
      // 사용자 메시지 표시
      addMessage('user', message);
      
      // 타이핑 효과 시작
      const typingMessage = addTypingMessage();
      
      // 서버로 메시지 전송
      const response = await fetch('http://localhost:8000/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      const data = await response.json();
      console.log('서버 응답:', data);
      
      // 타이핑 효과 제거
      removeTypingMessage(typingMessage);
      
      // 챗봇 응답 표시 - 서버 응답 구조에 맞게 수정
      let botResponse = '응답을 받았습니다.';
      if (data.result) {
        botResponse = data.result;
      } else if (data.message) {
        botResponse = data.message;
      } else if (data.response) {
        botResponse = data.response;
      }
      
      addMessage('bot', botResponse);

    } catch (error) {
      console.error('Error:', error);
      // 타이핑 효과 제거
      const typingMessage = document.querySelector('.typing-message');
      if (typingMessage) {
        removeTypingMessage(typingMessage);
      }
      addMessage('bot', '죄송합니다. 일시적인 오류가 발생했습니다.');
    }

    // 입력창 초기화
  }
}

function addMessage(type, text) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  
  if (type === 'bot') {
    // AI 메시지인 경우 좋아요/싫어요 버튼 추가
    messageDiv.innerHTML = `
      <div class="message-content">${text}</div>
      <div class="message-feedback">
        <button class="feedback-like" onclick="rateMessage(this, 'like')" title="좋아요">
          <ion-icon name="thumbs-up-outline"></ion-icon>
        </button>
        <button class="feedback-dislike" onclick="rateMessage(this, 'dislike')" title="싫어요">
          <ion-icon name="thumbs-down-outline"></ion-icon>
        </button>
      </div>
    `;
  } else {
    // 사용자 메시지인 경우 텍스트만
    messageDiv.textContent = text;
  }
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 타이핑 효과 메시지 추가
function addTypingMessage() {
  const messagesDiv = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-message';
  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return typingDiv;
}

// 타이핑 효과 메시지 제거
function removeTypingMessage(typingMessage) {
  if (typingMessage && typingMessage.parentNode) {
    typingMessage.parentNode.removeChild(typingMessage);
  }
}

// 챗봇 초기화 함수
function initializeChatbot() {
  console.log('챗봇 초기화 시작');
  const chatInput = document.getElementById('chatInput');
  console.log('챗봇 입력창 찾음:', chatInput);
  
  if (chatInput) {
    // 기존 이벤트 리스너 제거 (중복 방지)
    chatInput.removeEventListener('keypress', handleEnterKey);
    
    // 새로운 이벤트 리스너 추가
    chatInput.addEventListener('keypress', handleEnterKey);
    console.log('엔터키 이벤트 리스너 추가됨');
  } else {
    console.error('챗봇 입력창을 찾을 수 없습니다!');
  }
  
  // 저장된 피드백 전송 시도
  sendPendingFeedback();
}

// 엔터키 처리 함수
function handleEnterKey(e) {
  console.log('키 입력 감지:', e.key);
  if (e.key === 'Enter') {
    console.log('엔터키 감지됨');
    e.preventDefault(); // 기본 동작 방지
    sendMessage();
  }
}

// 피드백 모달 표시
function showFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('feedbackText').focus();
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeFeedbackModal();
      }
    });
    
    // 모달 배경 클릭으로 닫기
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeFeedbackModal();
      }
    });
  }
}

// 피드백 모달 닫기
function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.style.display = 'none';
    // 텍스트 영역 초기화
    document.getElementById('feedbackText').value = '';
  }
}

// 피드백 제출
async function submitFeedback() {
  const feedbackText = document.getElementById('feedbackText').value.trim();
  
  if (!feedbackText) {
    alert('피드백 내용을 입력해주세요.');
    return;
  }
  
  try {
    // 피드백 데이터 준비
    const feedbackData = {
      message: feedbackText,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // 환경변수에서 API URL 가져오기
    const apiUrl = window.appConfig ? window.appConfig.getApiUrl('/api/feedback') : 'http://localhost:8080/api/feedback';
    
    // 서버로 피드백 전송
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (response.ok) {
      alert('피드백이 성공적으로 전송되었습니다. 감사합니다!');
      closeFeedbackModal();
    } else {
      throw new Error('서버 응답 오류');
    }
    
  } catch (error) {
    console.error('피드백 전송 실패:', error);
    
    // 서버 연결 실패 시 로컬 스토리지에 저장
    saveFeedbackLocally(feedbackText);
    
    alert('피드백이 로컬에 저장되었습니다. 나중에 서버가 연결되면 전송됩니다.');
    closeFeedbackModal();
  }
}

// 로컬 스토리지에 피드백 저장
function saveFeedbackLocally(feedbackText) {
  try {
    const existingFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
    const newFeedback = {
      message: feedbackText,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    existingFeedback.push(newFeedback);
    localStorage.setItem('pendingFeedback', JSON.stringify(existingFeedback));
    
    console.log('피드백이 로컬 스토리지에 저장되었습니다.');
  } catch (error) {
    console.error('로컬 스토리지 저장 실패:', error);
  }
}

// 저장된 피드백 전송 시도 (페이지 로드 시)
async function sendPendingFeedback() {
  try {
    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
    
    if (pendingFeedback.length === 0) {
      return;
    }
    
    const apiUrl = window.appConfig ? window.appConfig.getApiUrl('/api/feedback') : 'http://localhost:8080/api/feedback';
    
    for (const feedback of pendingFeedback) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedback)
        });
        
        if (response.ok) {
          console.log('저장된 피드백 전송 성공');
        }
      } catch (error) {
        console.error('저장된 피드백 전송 실패:', error);
        break; // 하나라도 실패하면 중단
      }
    }
    
    // 전송 성공 시 로컬 스토리지에서 제거
    localStorage.removeItem('pendingFeedback');
    
  } catch (error) {
    console.error('저장된 피드백 처리 실패:', error);
  }
}

// 챗봇 토글 기능 (호버 전용으로 변경)
function toggleChatbot() {
  // 이 함수는 더 이상 사용되지 않습니다.
  // 호버만으로 툴팁이 표시됩니다.
} 