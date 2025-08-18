'use strict';

// API 기본 URL 설정
const AI_API_BASE_URL = `${window.appConfig.getAiApiUrl()}`;

// ====================================================================
// [수정] 일반 피드백 모달 관련 함수 복원
// ====================================================================

// 피드백 모달 표시
function showFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('feedbackText').focus();
    
    const closeModalHandler = (e) => {
      if (e.key === 'Escape' || e.target === modal || e.target.closest('.close-modal')) {
        closeFeedbackModal();
        document.removeEventListener('keydown', closeModalHandler);
        modal.removeEventListener('click', closeModalHandler);
      }
    };
    
    document.addEventListener('keydown', closeModalHandler);
    modal.addEventListener('click', closeModalHandler);
  }
}

// 피드백 모달 닫기
function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.style.display = 'none';
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
  
  const sessionId = getChatSessionId();
  const feedbackData = {
    session: sessionId,
    feedback: feedbackText
  };
  
  try {
    const response = await fetch(`${window.appConfig.getApiBaseUrl()}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    saveFeedbackLocally(feedbackData);
    alert('피드백 전송에 실패하여 로컬에 저장되었습니다. 다음 접속 시 다시 시도합니다.');
    closeFeedbackModal();
  }
}

// 로컬 스토리지에 피드백 저장
function saveFeedbackLocally(feedbackData) {
  try {
    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
    pendingFeedback.push(feedbackData);
    localStorage.setItem('pendingFeedback', JSON.stringify(pendingFeedback));
    console.log('피드백이 로컬 스토리지에 저장되었습니다.');
  } catch (error) {
    console.error('로컬 스토리지 저장 실패:', error);
  }
}

// 저장된 피드백 전송 시도
async function sendPendingFeedback() {
  const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
  if (pendingFeedback.length === 0) return;

  console.log(`${pendingFeedback.length}개의 저장된 피드백 전송을 시도합니다.`);
  
  const successfulSubmissions = [];

  for (const feedback of pendingFeedback) {
    try {
      const response = await fetch(`${window.appConfig.getApiBaseUrl()}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
      
      if (response.ok) {
        console.log('저장된 피드백 전송 성공:', feedback);
        successfulSubmissions.push(feedback);
      } else {
        // 하나라도 실패하면 다음을 위해 중단
        throw new Error('서버 응답 오류');
      }
    } catch (error) {
      console.error('저장된 피드백 전송 실패, 다음 시도를 위해 중단합니다.', error);
      break; 
    }
  }
  
  // 성공적으로 전송된 피드백만 로컬 스토리지에서 제거
  if (successfulSubmissions.length > 0) {
    const remainingFeedback = pendingFeedback.filter(
      item => !successfulSubmissions.some(sent => JSON.stringify(sent) === JSON.stringify(item))
    );
    localStorage.setItem('pendingFeedback', JSON.stringify(remainingFeedback));
  }
}


// ====================================================================
// 챗봇 기능 (기존 코드 유지)
// ====================================================================

// UUID 생성 함수
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 채팅 세션 ID 관리
function getChatSessionId() {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
}

// 메시지 전송 제한 상태 변수
let isMessageSending = false;
let messageCooldownTimer = null;
let countdownInterval = null;

// 메시지 전송 함수
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');
  const message = input.value.trim();
  
  if (!message || isMessageSending) return;

  // 전송 상태 활성화
  isMessageSending = true;
  input.disabled = true;
  if (sendButton) sendButton.disabled = true;
  
  // 실시간 카운트다운 시작
  let countdown = 8;
  input.placeholder = `${countdown}초 후 다시 메시지를 보낼 수 있습니다...`;
  
  countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      input.placeholder = `${countdown}초 후 다시 메시지를 보낼 수 있습니다...`;
    } else {
      // 카운트다운 완료
      clearInterval(countdownInterval);
      isMessageSending = false;
      input.disabled = false;
      input.placeholder = '메시지를 입력하세요...';
      if (sendButton) sendButton.disabled = false;
    }
  }, 1000);

  addMessage('user', message);
  input.value = '';

  const typingMessage = addTypingMessage();
  const sessionId = getChatSessionId();

  try {
    const response = await fetch(`${AI_API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);

    const data = await response.json();
    const botResponse = data?.result?.llm_answer || data?.message || '응답을 처리하는 중 문제가 발생했습니다.';
    const chatId = data?.result?.chat_id || null;

    addMessage('bot', botResponse, chatId);

  } catch (error) {
    console.error('Error:', error);
    addMessage('bot', '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    removeTypingMessage(typingMessage);
    
    // 기존 타이머 정리
    if (messageCooldownTimer) {
      clearTimeout(messageCooldownTimer);
    }
  }
}

// 채팅 메시지를 화면에 추가하는 함수
function addMessage(type, text, chatId = null) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = text;
  messageDiv.appendChild(messageContent);
  
  if (type === 'bot' && chatId) {
    messageDiv.setAttribute('data-chat-id', chatId);
    const feedbackDiv = createFeedbackButtons(chatId);
    messageDiv.appendChild(feedbackDiv);
  }
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 좋아요/싫어요 버튼 생성 함수
function createFeedbackButtons(chatId) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message-feedback';

    const likeBtn = document.createElement('button');
    likeBtn.className = 'feedback-like';
    likeBtn.title = '좋아요';
    likeBtn.innerHTML = '<ion-icon name="thumbs-up-outline"></ion-icon>';
    likeBtn.onclick = (e) => rateMessage(e.currentTarget, 'like', chatId);

    const dislikeBtn = document.createElement('button');
    dislikeBtn.className = 'feedback-dislike';
    dislikeBtn.title = '싫어요';
    dislikeBtn.innerHTML = '<ion-icon name="thumbs-down-outline"></ion-icon>';
    dislikeBtn.onclick = (e) => rateMessage(e.currentTarget, 'dislike', chatId);

    feedbackDiv.appendChild(likeBtn);
    feedbackDiv.appendChild(dislikeBtn);
    
    return feedbackDiv;
}

// 타이핑 효과 UI
function addTypingMessage() {
  const messagesDiv = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-message';
  typingDiv.innerHTML = `<div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return typingDiv;
}

function removeTypingMessage(typingMessage) {
  if (typingMessage?.parentNode) {
    typingMessage.parentNode.removeChild(typingMessage);
  }
}

// 챗봇 초기화
function initializeChatbot() {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', handleEnterKey);
  }
  // [수정] 페이지 로드 시 저장된 피드백 전송 시도
  sendPendingFeedback();
}

// 엔터키 입력 처리
function handleEnterKey(e) {
  if (e.key === 'Enter' && !isMessageSending) {
    e.preventDefault();
    sendMessage();
  }
}

// 메시지 평가(좋아요/싫어요) 전송
async function rateMessage(button, rating, chatId) {
  if (!chatId) return;
  
  const feedbackDiv = button.closest('.message-feedback');
  if (!feedbackDiv) return;

  const likeBtn = feedbackDiv.querySelector('.feedback-like');
  const dislikeBtn = feedbackDiv.querySelector('.feedback-dislike');
  
  if (likeBtn.disabled) return;

  likeBtn.disabled = true;
  dislikeBtn.disabled = true;

  try {
    const response = await fetch(`${AI_API_BASE_URL}/chat/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: chatId, isGood: rating === 'like' })
    });
    
    if (!response.ok) throw new Error('서버 응답 오류');
    
    const activeBtn = rating === 'like' ? likeBtn : dislikeBtn;
    const iconName = rating === 'like' ? 'thumbs-up' : 'thumbs-down';
    activeBtn.style.color = rating === 'like' ? '#4CAF50' : '#f44336';
    activeBtn.innerHTML = `<ion-icon name="${iconName}"></ion-icon>`;
    
    showFeedbackStatus(button, '피드백이 전송되었습니다.', 'success');

  } catch (error) {
    console.error('피드백 전송 실패:', error);
    likeBtn.disabled = false;
    dislikeBtn.disabled = false;
    showFeedbackStatus(button, '피드백 전송에 실패했습니다.', 'error');
  }
}

// 피드백 상태 메시지 표시
function showFeedbackStatus(element, text, type) {
    const messageDiv = element.closest('.message');
    if (!messageDiv) return;

    const existingStatus = messageDiv.querySelector('.feedback-status');
    if (existingStatus) existingStatus.remove();

    const statusDiv = document.createElement('div');
    statusDiv.className = `feedback-status ${type}`;
    statusDiv.textContent = text;
    
    messageDiv.appendChild(statusDiv);
    
    setTimeout(() => { statusDiv.remove(); }, 3000);
}


// 페이지 로드 시 챗봇 초기화
document.addEventListener('DOMContentLoaded', initializeChatbot);