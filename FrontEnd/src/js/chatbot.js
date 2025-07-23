'use strict';

// Chatbot functionality
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (message) {
    try {
      // 사용자 메시지 표시
      addMessage('user', message);
      
      // 서버로 메시지 전송
      const response = await fetch('http://localhost:8000/chat', {  // 실제 서버 URL로 변경 필요
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
      
      // 챗봇 응답 표시
      addMessage('bot', data.response);

    } catch (error) {
      console.error('Error:', error);
      addMessage('bot', '죄송합니다. 일시적인 오류가 발생했습니다.');
    }

    // 입력창 초기화
    input.value = '';
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