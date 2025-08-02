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
  messageDiv.textContent = text;
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