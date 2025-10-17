# Mohe Image Processor

Node.js 기반의 이미지 다운로드 및 리사이징 서버입니다. Docker 환경에서 실행할 수 있으며, 외부 이미지를 받아 저장하고 원하는 크기로 리사이징된 이미지를 제공합니다.

## 요구 사항
- Node.js 18+ (로컬 실행 시)
- Docker / Docker Compose (컨테이너 실행 시)

## 로컬 실행
```bash
npm install
npm start
```
서버는 기본적으로 `http://localhost:3000` 에서 동작합니다.

## Docker 실행
```bash
docker-compose up --build
```
`./images` 폴더가 컨테이너의 `/app/images` 에 마운트되어 다운로드된 이미지가 로컬에서도 확인 가능합니다.

## API 개요
- `POST /save` : 외부 URL의 이미지를 다운로드하여 지정한 파일명으로 저장합니다.
- `GET /image/:fileName` : 저장된 원본 이미지를 반환합니다.
- `GET /image/:fileName/:width/:height` : 지정한 크기로 리사이징된 이미지를 반환합니다.

자세한 요청/응답 형식은 `docs/api-spec.md` 를 참고하세요.
