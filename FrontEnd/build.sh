#!/bin/bash

# --- 로컬 테스트용 빌드 스크립트 ---

# 스크립트가 시작되었음을 알림
echo "🚀 Starting local build process..."

# 환경변수 설정 (기본값)
export VITE_API_BASE_URL=${VITE_API_BASE_URL:-"https://api-mac.mydomain.com"}
export VITE_AI_API_URL=${VITE_AI_API_URL:-"https://chatbot-mac.mydomain.com"}

echo "🔧 Environment variables:"
echo "   VITE_API_BASE_URL: $VITE_API_BASE_URL"
echo "   VITE_AI_API_URL: $VITE_AI_API_URL"

# 1. 'dist' 폴더가 이미 있다면 지우고, 새로 깨끗하게 만듭니다.
#    이것은 이전 빌드 결과물이 남지 않게 하기 위함입니다.
rm -rf dist && mkdir dist
echo "✅ Cleaned up and created 'dist' directory."

# 2. 웹사이트의 기본이 되는 index.html 파일을 dist 폴더로 복사합니다.
cp index.html dist/
echo "➡️ Copied index.html to dist/"

# 3. 웹사이트에 필요한 다른 모든 폴더(src, assets 등)도 dist 폴더로 복사합니다.
#    -r 옵션은 폴더 전체를 복사하라는 의미입니다.
#    프로젝트에 다른 폴더가 있다면 여기에 cp -r 폴더명 dist/ 형태로 추가하세요.
cp -r src dist/
cp -r assets dist/
echo "➡️ Copied 'src' and 'assets' directories to dist/"

# 4. (핵심!) dist 폴더 안의 index.html 파일에서 플레이스홀더를 실제 환경 변수 값으로 교체합니다.
#    - Cloudflare Tunnel URL을 기본값으로 사용합니다.
#    - 's|찾을문자열|바꿀문자열|g' 는 sed 명령어의 기본 형식입니다.
sed -i.bak "s|https://api-mac.mydomain.com|$VITE_API_BASE_URL|g" dist/index.html
sed -i.bak "s|https://chatbot-mac.mydomain.com|$VITE_AI_API_URL|g" dist/index.html
echo "🔄 Replaced URLs with environment variables."

# 5. sed가 만든 백업 파일(.bak)을 삭제하여 깔끔하게 정리합니다.
rm dist/index.html.bak
echo "🧹 Cleaned up backup files."

# 6. 로컬 테스트를 위한 간단한 HTTP 서버 실행 안내
echo ""
echo "🌐 To test locally, you can run:"
echo "   cd dist && python3 -m http.server 8000"
echo "   Then open http://localhost:8000 in your browser"
echo ""

# 모든 과정이 완료되었음을 알림
echo "🎉 Build finished successfully! You can now test the 'dist' folder."