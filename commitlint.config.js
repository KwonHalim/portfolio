module.exports = {
  // Conventional Commits 기본 규칙을 사용합니다.
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'test', 'chore', 'docs', 'style'],
    ],
    // type은 비어있을 수 없습니다.
    'type-empty': [2, 'never'],
    // subject는 비어있을 수 없습니다.
    'subject-empty': [2, 'never'],
    // 헤더(첫 줄)의 최대 길이는 100자입니다.
    'header-max-length': [2, 'always', 100],

      // Intellij 커밋이 안되서 설정 변경
      'body-leading-blank': [0, 'always'], // 본문 시작 전 빈 줄 규칙 비활성화
      'footer-leading-blank': [0, 'always'], // 꼬리말 시작 전 빈 줄 규칙 비활성화
      'body-max-line-length': [0, 'always', Infinity], // 본문 줄 길이 제한 없음
      'footer-max-line-length': [0, 'always', Infinity], // 꼬리말 줄 길이 제한 없음
      'subject-case': [0, 'never'], // 제목의 케이스(대소문자) 규칙 비활성화
  },
};

//feat: ✨ 새로운 로그인 기능 추가
//fix: 🐛 로그인 버튼 클릭 시 발생하던 500 에러 수정
//docs: 📝 기여 가이드에 커밋 규칙 추가
