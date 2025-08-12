#!/bin/bash

# --- Cloudflare 배포 및 로컬 테스트용 빌드 스크립트 ---

# 1. 환경변수 설정 (Cloudflare 변수가 없으면 localhost를 기본값으로 사용)
# 형식: ${VARIABLE:-"default_value"}
# 로컬 서버 주소에 맞게 포트 등을 수정해서 사용하세요.
VITE_API_BASE_URL=${VITE_API_BASE_URL:-"http://localhost:8080"}
VITE_AI_API_URL=${VITE_AI_API_URL:-"http://localhost:8000"}

# ✅ 설정된 환경변수 값 알림
echo "✅ 빌드 환경변수가 설정되었습니다."
echo "   - VITE_API_BASE_URL: $VITE_API_BASE_URL"
echo "   - VITE_AI_API_URL:   $VITE_AI_API_URL"
echo ""


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
CONFIG_PATH="dist/src/js/config.js"
echo "🔄 Replacing placeholders in $CONFIG_PATH..."

# macOS와 Linux에서 모두 호환되도록 sed 명령어 수정
# -i 뒤에 ""를 붙여주면 백업 파일을 만들지 않습니다.
sed -i "" "s|__VITE_API_BASE_URL__|$VITE_API_BASE_URL|g" "$CONFIG_PATH"
sed -i "" "s|__VITE_AI_API_URL__|$VITE_AI_API_URL|g" "$CONFIG_PATH"
echo "✅ URLs replaced successfully."

# 5. 빌드된 config.js 파일에 주입된 URL을 추출하여 확인
echo "🔍 Verifying injected URLs in $CONFIG_PATH..."

# 'getApiBaseUrl' 라인에서 큰따옴표(")로 둘러싸인 2번째 필드(URL)를 추출
BASE_URL_IN_FILE=$(grep 'getApiBaseUrl' "$CONFIG_PATH" | cut -d '"' -f 2)
AI_URL_IN_FILE=$(grep 'getAiApiUrl' "$CONFIG_PATH" | cut -d '"' -f 2)

# 추출된 URL을 echo로 출력
echo "   - Injected VITE_API_BASE_URL: $BASE_URL_IN_FILE"
echo "   - Injected VITE_AI_API_URL:   $AI_URL_IN_FILE"

echo ""
echo "🎉 Build finished successfully!"
echo "📁 Build output is ready in the 'dist/' folder."
