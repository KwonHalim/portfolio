module.exports = {
  // Conventional Commits 기본 규칙을 가져옵니다.
  extends: ['@commitlint/config-conventional'],
  rules: {
    // --- ✅ 활성화할 헤더(제목) 규칙 ---
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'test', 'chore', 'docs', 'style'],
    ],
    // type은 비워둘 수 없습니다.
    'type-empty': [2, 'never'],
    // subject는 비워둘 수 없습니다.
    'subject-empty': [2, 'never'],
    // 헤더(제목)의 최대 길이는 100자로 제한합니다. (너무 길어지는 것을 방지)
    'header-max-length': [2, 'always', 100],

    // --- ❌ 비활성화할 모든 규칙 ---
    // 본문은 비워둘 수 있습니다.
    'body-empty': [0, 'always'],
    // 본문 시작 전 빈 줄 강제 규칙 비활성화
    'body-leading-blank': [0, 'always'],
    // 본문의 최대 줄 길이 제한 비활성화
    'body-max-line-length': [0, 'always'],
    // 꼬리말은 비워둘 수 있습니다.
    'footer-empty': [0, 'always'],
    // 꼬리말 시작 전 빈 줄 강제 규칙 비활성화
    'footer-leading-blank': [0, 'always'],
    // 꼬리말의 최대 줄 길이 제한 비활성화
    'footer-max-line-length': [0, 'always'],
  },
};


// fix(pencil): stop graphite breaking when too much pressure applied (Patch Release)
// feat(pencil): add 'graphiteWidth' option (Minor Release)
/** => Major Release
 * perf(pencil): remove graphiteWidth option
 *
 * BREAKING CHANGE: The graphiteWidth option has been removed.
 * The default graphite width of 10mm is always used for performance reasons.
 *
 */