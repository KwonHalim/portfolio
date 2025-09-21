module.exports = {
  // Conventional Commits 기본 규칙을 가져오지만, 아래에서 필요한 규칙들을 덮어씁니다.
  extends: ['@commitlint/config-conventional'],
  rules: {
    // [Level, Applicable, Value]
    // Level: 0 = 비활성화, 1 = 경고, 2 = 오류

    // --- 헤더 규칙 (이 부분은 유지합니다) ---
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'test', 'chore', 'docs', 'style'],
    ],
    'type-empty': [2, 'never'],        // type은 비워둘 수 없습니다.
    'subject-empty': [2, 'never'],     // subject는 비워둘 수 없습니다.
    'header-max-length': [2, 'always', 100], // 헤더의 최대 길이는 100자입니다.
    'subject-case': [0, 'never'],      // 제목의 대소문자 규칙은 비활성화합니다.

    // --- 본문 및 꼬리말 규칙 (완전히 비활성화) ---
    // 아래 규칙들을 비활성화하여 제목만 있어도 커밋이 가능하게 하고,
    // 본문이나 꼬리말을 작성할 때 빈 줄을 강제하지 않도록 합니다.
    'body-leading-blank': [0, 'always'],   // 본문 앞 빈 줄 규칙 비활성화
    'footer-leading-blank': [0, 'always'], // 꼬리말 앞 빈 줄 규칙 비활성화
  },
};