#!/bin/bash

# --- 스크립트 실행 중 오류 발생 시 즉시 중단 ---
set -e

# --- Cloudflare 배포 및 로컬 테스트용 빌드 스크립트 ---

# 1. 환경변수 설정
VITE_API_BASE_URL=${VITE_API_BASE_URL:-"http://localhost:8080"}
VITE_AI_API_URL=${VITE_AI_API_URL:-"http://localhost:8000"}

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

# 4. (핵심 수정!) dist 폴더 안의 config.js 파일에서 플레이스홀더를 실제 환경 변수 값으로 교체
CONFIG_PATH="dist/src/js/config.js"
echo "🔄 Replacing placeholders in $CONFIG_PATH..."

# Linux(Cloudflare) 환경에 맞게 -i 옵션 뒤 "" 제거
sed -i "s|__VITE_API_BASE_URL__|$VITE_API_BASE_URL|g" "$CONFIG_PATH"
sed -i "s|__VITE_AI_API_URL__|$VITE_AI_API_URL|g" "$CONFIG_PATH"
echo "✅ URLs replaced successfully."

# 5. 빌드된 config.js 파일 내용 확인 (더 확실한 검증 방식)
echo "🔍 Verifying injected URLs in $CONFIG_PATH..."
echo "--- content of $CONFIG_PATH ---"
cat "$CONFIG_PATH"
echo "---------------------------------"

echo ""
echo "🎉 Build finished successfully!"