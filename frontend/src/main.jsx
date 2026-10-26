import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import './style.css';

const sections = [
  ['/study', '공부 기록', '배운 것을 나만의 언어로'],
  ['/todos', '할 일', '작은 실천을 하나씩'],
  ['/errors', '오류 기록', '막혔던 순간도 배움으로'],
];

function ConnectionCheck() {
  const [status, setStatus] = useState('checking');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    setStatus('checking');
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
    fetch(`${base}/api/health`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok || (await response.json()).status !== 'ok') throw new Error('Unavailable');
        if (active) setStatus('ok');
      })
      .catch(() => { if (active) setStatus('error'); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [attempt]);
  return <div className="connection" role="status">
    <span className={`dot ${status}`} aria-hidden="true" />
    {status === 'checking' ? '연결 확인 중' : status === 'ok' ? '서버 연결 확인됨' : '서버에 연결할 수 없습니다'}
    {status === 'error' && <button onClick={() => setAttempt(attempt + 1)}>다시 확인</button>}
  </div>;
}

function Welcome() {
  return <>
    <section className="intro">
      <p className="eyebrow">YOUR LEARNING JOURNAL</p>
      <h1>오늘의 배움이<br /><span>내일의 바탕이 되도록.</span></h1>
      <p className="lead">공부한 것, 해야 할 일, 해결한 오류까지.<br />흩어진 배움의 흔적을 BuildLog에 모아보세요.</p>
      <div className="actions"><Link className="button primary" to="/signup">회원가입 <span aria-hidden="true">↗</span></Link><Link className="button secondary" to="/login">로그인</Link></div>
      <p className="notice">지금은 기본 화면을 준비하고 있어요. 회원가입과 기록 저장은 다음 단계에 연결됩니다.</p>
    </section>
    <section className="features" aria-label="BuildLog에서 모아둘 기록">
      {sections.map(([path, title, description], index) => <Link className="feature" to={path} key={path}><span className="feature-number">0{index + 1}</span><h2>{title}<span aria-hidden="true">↗</span></h2><p>{description}</p></Link>)}
    </section>
  </>;
}

function AccountPage({ signup = false }) {
  const title = signup ? '회원가입' : '로그인';
  return <section className="account-card">
    <p className="eyebrow">START YOUR BUILDLOG</p><h1>{title}</h1>
    <p className="muted">{signup ? '나만의 배움 기록을 시작해 보세요.' : '배움의 기록을 이어가세요.'}</p>
    <p className="info">회원 기능은 준비 중입니다. 아직 입력하거나 전송할 수 없습니다.</p>
    <form onSubmit={(event) => event.preventDefault()}>
      <fieldset disabled><legend className="sr-only">준비 중인 {title} 입력 양식</legend>
        <label htmlFor="email">이메일</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" />
        <label htmlFor="password">비밀번호</label><input id="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} placeholder="8~64자" />
        {signup && <><label htmlFor="nickname">닉네임</label><input id="nickname" placeholder="한글, 영문, 숫자, 밑줄 2~20자" /></>}
        <button className="button primary full" type="submit">{title} 준비 중</button>
      </fieldset>
    </form>
    <p className="account-link">{signup ? '이미 계정이 있나요?' : '처음 오셨나요?'} <Link to={signup ? '/login' : '/signup'}>{signup ? '로그인' : '회원가입'}</Link></p>
  </section>;
}

function ProtectedPlaceholder() {
  const { pathname } = useLocation();
  const title = [...sections, ['/public', '공개 기록'], ['/settings', '계정 설정'], ['/home', '내 기록 홈']].find(([path]) => path === pathname)?.[1] || '기록';
  return <section className="account-card"><p className="eyebrow">YOUR SPACE</p><h1>{title}</h1><p className="muted">이 화면은 로그인 후 이용할 수 있습니다.</p><p className="info">회원 기능이 연결되면 이용할 수 있어요. 현재는 기록을 불러오거나 저장하지 않습니다.</p><Link className="button primary" to="/login">로그인 화면으로</Link></section>;
}

function App() {
  return <div className="shell">
    <header><Link className="brand" to="/" aria-label="BuildLog 시작 화면"><span className="brand-mark" aria-hidden="true">B<span>↗</span></span>BuildLog<span className="brand-period">.</span></Link>
      <nav aria-label="주 메뉴"><NavLink to="/study">공부 기록</NavLink><NavLink to="/todos">할 일</NavLink><NavLink to="/errors">오류 기록</NavLink><NavLink to="/public">공개 기록</NavLink><NavLink to="/settings">계정 설정</NavLink></nav>
      <Link className="header-login" to="/login">로그인 <span aria-hidden="true">↗</span></Link>
    </header>
    <main><Routes><Route path="/" element={<Welcome />} /><Route path="/login" element={<AccountPage />} /><Route path="/signup" element={<AccountPage signup />} />
      {['/home', '/study', '/todos', '/errors', '/public', '/settings'].map((path) => <Route key={path} path={path} element={<ProtectedPlaceholder />} />)}
      <Route path="*" element={<section className="account-card"><h1>페이지를 찾을 수 없습니다</h1><Link to="/">시작 화면으로 돌아가기</Link></section>} />
    </Routes></main>
    <footer><p>BuildLog <span>작은 기록, 쌓이는 성장.</span></p><ConnectionCheck /></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
