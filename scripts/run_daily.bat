@echo off
chcp 65001 > nul
echo ===================================================
echo   트립모두(tripmodu.kr) SEO & GEO 단체여행 칼럼 자동생성
echo ===================================================
echo.

cd /d "%~dp0\.."

echo [1/2] AI 단체여행 전문 칼럼 생성 중...
node scripts\generate_post.mjs

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 글 생성 중 문제가 발생했습니다.
    pause
    exit /b 1
)

echo.
echo [2/2] 작업 완료! posts/index.html 및 사이트맵이 갱신되었습니다.
echo.
pause
