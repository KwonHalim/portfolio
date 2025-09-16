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
  },
};

//feat: ✨ 새로운 로그인 기능 추가
//fix: 🐛 로그인 버튼 클릭 시 발생하던 500 에러 수정
//docs: 📝 기여 가이드에 커밋 규칙 추가
