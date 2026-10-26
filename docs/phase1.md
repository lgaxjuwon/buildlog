# Phase 1 — 개발 환경과 기본 화면

## 상태

기본 구축과 실행 검증을 진행했습니다. 인증 방식 및 홈 카드 결정에 의존하는 작업은 보류했습니다. **Phase 1 전체 완료가 아니라 독립적으로 진행 가능한 기본 틀의 구현·검증 완료 상태입니다.**

## 구현한 것

- `frontend`: React·Vite, 밝은 기본 화면, 반응형 메뉴·카드·입력 양식의 틀
- `/`, `/signup`, `/login`, `/home`, `/study`, `/todos`, `/errors`, `/public`, `/settings` 경로
- 회원 양식은 준비 안내와 비활성 입력만 표시하며, 기록 경로는 로그인 필요 안내만 표시
- `backend`: FastAPI·환경 설정·허용 화면 주소 설정·DB 상태 확인 API
- `database`: SQLite3 파일, SQLAlchemy DB 연결 분리, Alembic 빈 기준 이력
- SQLite3 외래키 검사 활성화, PostgreSQL 연결 드라이버 준비
- 비밀값 없는 환경 예시, 패키지 잠금 파일, 로컬 도구·DB·검증 결과의 Git 제외
- 별도 [실행 안내](development.md)

인증 결정과 무관한 DB 도구로 SQLAlchemy·Alembic·Psycopg를 선택했습니다. Supabase Auth 사용 여부나 회원·신고 데이터 구조까지 결정한 것은 아닙니다.

## 검증 결과

| 확인 | 결과 |
| --- | --- |
| FastAPI·SQLite3 응답과 허용 출처, 외래키 검사 | 서버 자동 검사 통과 |
| DB 오류 시 503 응답·상세 정보 비노출 | 서버 자동 검사 통과 |
| Alembic 기준 이력 적용 | `0001_baseline (head)` 확인 |
| React 빌드 | 성공 |
| 실제 React→FastAPI→SQLite3 연결 | Chrome 자동 검사 통과 |
| 360px·1280px 화면 가로 넘침 및 메뉴 이동 | Chrome 자동 검사 통과 |
| 360px·1280px 화면 캡처 육안 확인 | 카드·메뉴·문구 배치 확인 |
| 회원 입력 차단·연결 실패 안내·재시도 | Chrome 자동 검사 통과 |
| Supabase 실제 연결 | 미실행, Phase 9 대상 |
| Chrome·Edge·Safari 최신 두 버전 전체 | 미실행, 현재 설치된 Chrome만 확인 |

패키지에서 발생하는 React Router의 `use client` 빌드 경고와 Starlette의 httpx 사용 예정 변경 경고가 있습니다. 현재 빌드·검증은 통과했으며 다음 의존성 갱신 때 확인합니다.

## 남은 결정

- D01: FastAPI 직접 인증 또는 Supabase Auth. 회원 구조·로그인 상태 처리는 결정 후 구현합니다.
- D11: 내 기록 홈의 핵심 카드 내용·개수. 지금 시작 화면은 실제 홈 구성 확정이 아닙니다.
- D02 등 데이터 보관·기능 규칙은 [Phase 0 결정 목록](phase0.md)에 남겨두었습니다.

회원·기록·댓글·신고 데이터 테이블과 실제 API는 만들지 않았습니다. README 변경, Git 초기화·커밋·배포도 진행하지 않았습니다.
