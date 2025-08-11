#!/bin/bash

# --- Cloudflare 배포용 빌드 스크립트 ---

# 1. 환경변수 검증 및 알림
if [ -n "$VITE_API_BASE_URL" ] && [ -n "$VITE_AI_API_URL" ]; then
    # ✅ 환경변수가 모두 설정된 경우
    echo "✅ 환경변수가 감지되었습니다. 빌드 프로세스를 시작합니다."
    echo "   - VITE_API_BASE_URL: $VITE_API_BASE_URL"
    echo "   - VITE_AI_API_URL:   $VITE_AI_API_URL"
    echo ""
else
    # ❌ 환경변수가 하나라도 설정되지 않은 경우
    echo "❌ 필수 환경변수가 설정되지 않았습니다. 빌드를 중단합니다."
    echo "   Cloudflare Pages 또는 로컬 환경에 다음 변수를 설정해주세요:"
    echo "   - VITE_API_BASE_URL"
    echo "   - VITE_AI_API_URL"
    exit 1
fi

# --- 빌드 프로세스 ---
echo "🚀 Starting build process..."

# 2. 'dist' 폴더 정리 및 생성
rm -rf dist && mkdir dist
echo "✅ Cleaned up 'dist' directory."

# 3. 필수 파일 및 폴더를 dist로 복사
cp index.html dist/
cp -r src dist/
cp -r assets dist/
echo "➡️ Copied necessary files and directories to dist/"

# 4. (핵심!) dist 폴더 안의 config.js 파일에서 플레이스홀더를 실제 환경 변수 값으로 교체
# config.js의 경로는 'dist/src/js/config.js'가 됩니다.
CONFIG_PATH="dist/src/js/config.js"
echo "🔄 Replacing placeholders in $CONFIG_PATH..."
sed -i.bak "s|__VITE_API_BASE_URL__|$VITE_API_BASE_URL|g" "$CONFIG_PATH"
sed -i.bak "s|__VITE_AI_API_URL__|$VITE_AI_API_URL|g" "$CONFIG_PATH"
echo "✅ URLs replaced successfully."

# 5. sed가 만든 백업 파일(.bak)을 삭제
rm "${CONFIG_PATH}.bak"
echo "🧹 Cleaned up backup files."

# 6. 빌드된 config.js 파일의 URL 변경 여부 확인
echo "🔍 Verifying replaced URLs..."
grep -E "$VITE_API_BASE_URL|$VITE_AI_API_URL" "$CONFIG_PATH"

echo ""
echo "🎉 Build finished successfully!"
echo "📁 Build output is ready in the 'dist/' folder."