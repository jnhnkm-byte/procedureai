# ProcureAI

AI 기반 조달·구매 의사결정 지원 MVP입니다.

## 현재 기능
- 공급업체 3개 비교
- 가격·납기·품질·위험 가중치 조정
- 가중치 변경 시 실시간 재순위화
- 견적서 업로드 UI
- 리스크 신호 및 다음 개발 단계 표시
- GitHub Pages 자동 배포

## 로컬 실행
```bash
npm install
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

## GitHub Pages
`main` 브랜치에 커밋하면 `.github/workflows/deploy.yml`이 정적 빌드를 실행합니다.
저장소 Settings → Pages → Source를 **GitHub Actions**로 설정하세요.

현재 저장소명이 `procedureai`이므로 배포 주소는 일반적으로 다음 형태입니다.
`https://jnhnkm-byte.github.io/procedureai/`

## v0.2 목표
1. 실제 PDF/Excel 견적 읽기
2. 품목·단가·수량·납기 자동 추출
3. 공급업체 비교 및 이상값 탐지
4. 위험요인 탐지
5. 추천 근거 생성
6. 의사결정 보고서 생성
