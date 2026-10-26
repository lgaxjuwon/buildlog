# BuildLog 로컬 실행 안내

## 현재 가능한 것

React 기본 화면, 회원 화면의 준비 안내, 메뉴 이동, FastAPI 연결 확인, SQLite3 연결과 DB 변경 이력의 시작점을 준비했습니다. 회원가입·로그인·기록 조회·저장 기능은 아직 구현하지 않았습니다. 로그인하지 않은 기록 경로에는 안내만 표시하며 실제 데이터를 제공하지 않습니다.

인증 방식과 내 기록 홈의 카드 구성은 아직 결정되지 않았습니다. 현재 시작 화면은 홈의 실제 기록 카드를 확정한 것이 아닙니다.

## 설치된 구성

| 도구 | 확인한 버전 |
| --- | --- |
| Python | 3.13.17 |
| Node.js | 24.22.1 |
| npm | 11.19.1 |
| React / React DOM | 19.3.1 |
| Vite | 8.3.5 |
| React Router | 7.18.4 |
| FastAPI | 0.162.0 |
| Uvicorn | 0.54.0 |
| SQLAlchemy | 2.0.55 |
| Alembic | 1.20.1 |
| Psycopg | 3.3.6 |

화면의 설치 버전은 `frontend/package-lock.json`, 서버와 검증 도구는 `backend/requirements-dev.lock`에 고정했습니다. 버전을 변경할 때는 호환성을 확인하고 잠금 파일도 갱신합니다.

Python을 명령 경로에서 찾지 못해 `.tools`에 uv와 Python을 준비하고 프로젝트 루트 `.venv`에 패키지를 설치했습니다. 시스템 PATH나 PowerShell 실행 정책은 변경하지 않았습니다. PowerShell에서 `npm` 실행이 제한되어 아래 명령은 `npm.cmd`를 사용합니다. 가상 환경 활성화 없이 Python 실행 파일을 직접 호출할 수 있습니다.

## 실행 방법

프로젝트 루트 `C:\Users\aicam\Desktop\buildlog`에서 PowerShell 터미널 두 개를 엽니다.

첫 번째 터미널에서 서버를 실행합니다.

```powershell
.\.venv\Scripts\python.exe -m alembic -c database/alembic.ini upgrade head
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

두 번째 터미널에서 화면을 실행합니다.

```powershell
cd frontend
npm.cmd run dev -- --port 5173 --strictPort
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다. 기본 화면 하단에 ‘서버 연결 확인됨’이 나타나면 화면→서버→DB의 연결 확인이 성공한 것입니다. 서버를 끄면 실패 안내와 다시 확인 버튼이 나타납니다. 종료는 각 터미널에서 `Ctrl+C`를 누릅니다.

`/api/health`는 `SELECT 1`로 DB 응답을 확인할 뿐 회원·기록 데이터를 조회하지 않습니다. 현재 API는 회원 인증이 필요한 기능을 제공하지 않습니다. 실제 저장·열람 API는 이후 단계에서 인증·권한과 함께 만듭니다.

## 환경 설정

기본값으로 로컬 실행할 때 `.env`를 만들 필요는 없습니다. 설정을 바꾸려면 `backend/.env.example`을 `backend/.env`로, `frontend/.env.example`을 `frontend/.env`로 복사한 뒤 필요한 값을 입력하고 실행 프로세스를 다시 시작합니다.

| 위치·항목 | 역할 | 기본값 |
| --- | --- | --- |
| 서버 `DATABASE_URL` | DB 연결 | `sqlite+pysqlite:///database/buildlog.db` |
| 서버 `CORS_ORIGINS` | API 요청을 허용할 화면 주소 목록 | localhost와 127.0.0.1의 5173 포트 |
| 화면 `VITE_API_BASE_URL` | 서버 주소, 브라우저에 공개되는 값 | `http://127.0.0.1:8000` |

상대 SQLite 경로는 실행 위치와 무관하게 프로젝트 루트 기준입니다. SQLite 파일은 `database/buildlog.db`에 생성되며 Git 제외 규칙에 포함됩니다. 회원 기능을 연결할 때 필요한 요청 방식과 인증 전달 설정은 그때 확장합니다. 현재 허용 방식은 연결 확인용 GET입니다.

DB 비밀번호·서버 비밀키는 서버 `.env`에만 입력합니다. `VITE_`로 시작하는 설정은 화면에 포함되므로 비밀값을 넣지 않습니다. `.env.example`에는 실제 비밀값을 기록하지 않습니다.

## DB 구조 변경과 Supabase 준비

SQLAlchemy를 SQLite3와 PostgreSQL의 공통 DB 접근 도구로, Alembic을 DB 구조 변경 이력 관리 도구로 사용합니다. Psycopg는 Supabase PostgreSQL 연결용으로 설치했습니다. 회원 인증은 이 선택과 별개로 미정입니다.

현재 `0001_baseline`은 변경 이력의 빈 시작점이며, 회원·기록·댓글·신고 테이블은 만들지 않습니다. 미정 규칙에 의존하는 구조는 해당 단계에서 추가합니다. 새 모델을 추가할 때는 `database/migrations/env.py`의 현재 빈 `target_metadata`를 실제 모델의 metadata에 연결한 뒤 변경 파일을 생성·검토합니다. 빈 metadata 상태에서 기존 업무 테이블에 자동 변경 생성을 실행하면 안 됩니다.

이후 구조 변경 적용은 같은 명령을 사용합니다.

```powershell
.\.venv\Scripts\python.exe -m alembic -c database/alembic.ini upgrade head
.\.venv\Scripts\python.exe -m alembic -c database/alembic.ini current
```

SQLite3의 구조 변경은 Alembic의 batch 모드를 사용하도록 준비했습니다. DB별 검색·날짜·중복 제약 차이는 실제 Supabase 검증 때 확인합니다.

Supabase 연결 단계에서는 별도 테스트 프로젝트의 PostgreSQL 연결 정보를 서버 `.env`의 `DATABASE_URL`에 입력합니다. 예시는 `backend/.env.example`에 있으며, 실제 호스트·포트·계정·SSL 연결 조건은 프로젝트에서 제공한 값을 사용합니다. 서버에서 직접 DB로 연결하는 구조이며, 브라우저에 DB 연결 정보를 전달하지 않습니다.

연결 대상을 바꾼 뒤 위 Alembic 명령으로 구조를 적용하고 기능을 다시 검증합니다. 이 명령은 SQLite3 데이터를 옮기는 작업이 아닙니다. 데이터 이전 여부와 실제 Supabase 접속은 아직 미정·미실행입니다.

## 검증 명령

서버 검증은 루트에서 실행합니다.

```powershell
cd backend
..\.venv\Scripts\python.exe -m pytest -q
```

화면 빌드와 실제 Chrome 검증은 `frontend`에서 실행합니다. 브라우저 검증은 먼저 8000 포트의 FastAPI를 실행해야 하며, 5173 포트의 화면 서버는 검증 도구가 실행·종료합니다. Chrome이 설치된 환경을 사용합니다.

```powershell
npm.cmd run build
npm.cmd run test:e2e
```

Chrome 검증은 실제 API 연결, 360px·1280px 가로 넘침, 메뉴 이동, 미구현 회원 입력 차단, 연결 실패와 재시도를 확인합니다. 화면 캡처는 무시 대상인 `frontend/test-results/`에 생성됩니다. Edge·Safari의 최신 두 버전 검증은 아직 수행하지 않았습니다.

## 환경을 다시 준비할 때

현재 환경에서는 위 실행 명령만 사용하면 됩니다. 프로젝트를 다른 환경에서 다시 설치할 때는 Python 3.13과 호환되는 Node.js를 준비하고 루트에서 다음을 실행합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements-dev.lock
cd frontend
npm.cmd ci
```

현재 uv로 만든 가상 환경에는 pip 대신 프로젝트의 uv로 패키지를 동기화할 수 있습니다. 루트에서 다음을 실행합니다.

```powershell
$env:UV_CACHE_DIR = Join-Path (Get-Location) '.tools/uv-cache'
.\.tools\uv\uv.exe pip sync backend/requirements-dev.lock --python .venv/Scripts/python.exe
```

공식 참고: [Vite 시작 안내](https://vite.dev/guide/), [FastAPI 시작 안내](https://fastapi.tiangolo.com/tutorial/first-steps/), [SQLAlchemy DB 연결](https://docs.sqlalchemy.org/en/20/core/engines.html), [Alembic 구조 변경](https://alembic.sqlalchemy.org/en/latest/tutorial.html).
