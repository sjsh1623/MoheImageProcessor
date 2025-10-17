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

Docker 환경에서는 `http://localhost:5200` 에서 동작합니다.

## API 사용 방법

> **확장자 관련 정책**
> - **저장 시**: 파일명에 확장자를 포함하지 않습니다. 서버가 이미지의 Content-Type을 확인하여 자동으로 적절한 확장자(.jpeg, .png, .webp 등)를 추가합니다.
> - **조회 시**: 확장자 포함/미포함 모두 가능합니다. 확장자 없이 요청하면 서버가 매칭되는 파일을 자동으로 찾아줍니다.

### 1. 이미지 저장 (POST /save)
외부 URL의 이미지를 다운로드하여 서버에 저장합니다.

**요청 파라미터:**
- `url` (필수): 다운로드할 이미지의 URL
- `fileName` (필수): 저장할 파일명 (**확장자 제외**, 예: `sample`, `my-image`)

**예시:**
```bash
curl -X POST http://localhost:3000/save \
  -H "Content-Type: application/json" \
  -d '{"url":"https://picsum.photos/200","fileName":"sample"}'
```

**응답:**
```json
{
  "message": "Image saved successfully.",
  "fileName": "sample.jpeg"
}
```
> 응답의 `fileName`에는 자동으로 추가된 확장자가 포함됩니다.

### 2. 원본 이미지 조회 (GET /image/:fileName)
저장된 원본 이미지를 반환합니다. 파일명은 **확장자 포함/미포함 모두 가능**합니다.

**예시:**
```bash
# 확장자 포함
curl http://localhost:3000/image/sample.jpeg --output sample.jpeg

# 확장자 없이도 가능 (권장)
curl http://localhost:3000/image/sample --output sample.jpeg
```

### 3. 리사이징된 이미지 조회 (GET /image/:fileName/:width/:height)
지정한 크기로 리사이징된 이미지를 반환합니다. Sharp의 `cover` 모드를 사용하여 종횡비를 유지하면서 지정된 크기를 채웁니다.

**파라미터:**
- `fileName`: 저장된 이미지 파일명 (**확장자 포함 또는 미포함**)
- `width`: 원하는 너비 (양수)
- `height`: 원하는 높이 (양수)

**예시:**
```bash
# 확장자 포함
curl http://localhost:3000/image/sample.jpeg/100/100 --output sample_100.jpeg

# 확장자 없이도 가능 (권장)
curl http://localhost:3000/image/sample/100/100 --output sample_100.jpeg
```

자세한 요청/응답 형식은 `docs/api-spec.md` 를 참고하세요.
