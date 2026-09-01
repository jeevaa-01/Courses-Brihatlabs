// ============================================================
//  HitaVirTech Access Gate — branded HTML pages
//  (login / denied / error). Self-contained, no external CSS.
// ============================================================

const BASE_STYLES = `
  :root{
    --bg:#0d1424; --bg2:#111c33; --surface:#16223d; --line:#26344f;
    --ink:#eaf0fa; --muted:#93a1bd; --accent:#f5a623; --accent2:#ffd27a;
    --danger:#ff6b6b;
  }
  *{box-sizing:border-box}
  html,body{margin:0;height:100%}
  body{
    font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    color:var(--ink);
    background:
      radial-gradient(900px 500px at 50% -10%, rgba(245,166,35,.10), transparent 60%),
      linear-gradient(180deg,var(--bg),var(--bg2));
    display:flex;align-items:center;justify-content:center;
    min-height:100vh;padding:24px;line-height:1.55;
  }
  .card{
    width:100%;max-width:420px;background:var(--surface);
    border:1px solid var(--line);border-radius:18px;
    padding:38px 34px;text-align:center;
    box-shadow:0 24px 60px -24px rgba(0,0,0,.6);
  }
  .mark{
    display:inline-flex;align-items:center;gap:11px;margin-bottom:26px;
  }
  .mark .glyph{
    width:38px;height:38px;border-radius:10px;flex:none;position:relative;
    background:linear-gradient(140deg,var(--accent),#d4820a);
    box-shadow:0 0 0 1px rgba(255,210,122,.35), 0 8px 22px -8px rgba(245,166,35,.7);
  }
  .mark .glyph::after{
    content:"";position:absolute;inset:11px;border-radius:3px;
    border:2px solid #1a1206;border-bottom:none;border-right:none;
    transform:rotate(45deg);
  }
  .mark .name{font-family:'Space Grotesk',sans-serif;font-weight:600;
    font-size:19px;letter-spacing:-.2px}
  .mark .name b{color:var(--accent)}
  h1{font-family:'Space Grotesk',sans-serif;font-weight:600;
    font-size:22px;margin:4px 0 8px;letter-spacing:-.3px}
  p{color:var(--muted);font-size:14.5px;margin:0 0 8px}
  .tag{font-size:12px;color:var(--muted);letter-spacing:.3px;
    margin-top:22px;font-style:italic;opacity:.8}
  .gbtn{
    display:flex;align-items:center;justify-content:center;gap:11px;
    width:100%;margin:24px 0 6px;padding:13px 16px;
    background:#fff;color:#1f2733;text-decoration:none;
    border-radius:11px;font-weight:600;font-size:15px;
    transition:transform .12s ease, box-shadow .12s ease;
  }
  .gbtn:hover{transform:translateY(-1px);
    box-shadow:0 10px 26px -10px rgba(255,255,255,.45)}
  .gbtn svg{width:19px;height:19px;flex:none}
  .status{font-family:'Space Grotesk',ui-monospace,monospace;
    font-size:12px;color:var(--muted);margin-top:18px;
    display:flex;align-items:center;justify-content:center;gap:8px}
  .dot{width:7px;height:7px;border-radius:50%;background:var(--accent);
    box-shadow:0 0 10px var(--accent);animation:pulse 1.8s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
  .email{color:var(--accent2);font-weight:600;word-break:break-all}
  .contact{margin-top:20px;font-size:13.5px}
  .contact a{color:var(--accent);text-decoration:none}
  .iconwrap{width:54px;height:54px;border-radius:14px;margin:0 auto 18px;
    display:flex;align-items:center;justify-content:center;
    background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3)}
  @media (prefers-reduced-motion:reduce){.dot{animation:none}}
`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">`;

const MARK = `<div class="mark">
  <span class="glyph"></span>
  <span class="name">Hita<b>Vir</b>Tech</span>
</div>`;

const GOOGLE_ICON = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

function shell({ title, inner }) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>${FONTS}<style>${BASE_STYLES}</style></head>
<body><main class="card">${MARK}${inner}</main></body></html>`;
}

export function loginPage(googleUrl) {
  return shell({
    title: "Sign in · HitaVirTech Learning Portal",
    inner: `
      <h1>Access to your Learning Playground</h1>
      <p>Sign in with the Google account you registered for your batch.</p>
      <a class="gbtn" href="${googleUrl}">${GOOGLE_ICON} Continue with Google</a>
      <div class="status"><span class="dot"></span> Secure access · enrolled students only</div>
      <div class="tag">Wisdom to Lead, Intelligence to Serve</div>`,
  });
}

export function deniedPage(email, contact) {
  return shell({
    title: "Access denied · HitaVirTech Learning Portal",
    inner: `
      <div class="iconwrap">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="#ff6b6b" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>
      </div>
      <h1>You're not on this batch's list</h1>
      <p>The account <span class="email">${email}</span> isn't enrolled in an
         active HitaVirTech batch, so we can't open the course for it.</p>
      <p>If you signed in with the wrong Google account, switch accounts and try again.</p>
      <div class="contact">Enrolled and still blocked?
        <a href="mailto:${contact}?subject=Learning%20portal%20access%20-%20${encodeURIComponent(email)}">Contact your trainer</a>
      </div>
      <div class="tag">Wisdom to Lead, Intelligence to Serve</div>`,
  });
}

export function messagePage(heading, message) {
  return shell({
    title: "HitaVirTech Learning Portal",
    inner: `
      <h1>${heading}</h1>
      <p>${message}</p>
      <a class="gbtn" href="/auth/login" style="margin-top:22px">Back to sign in</a>
      <div class="tag">Wisdom to Lead, Intelligence to Serve</div>`,
  });
}

export function restrictedPage(message) {
  return shell({
    title: "Coming soon · HitaVirTech Learning Portal",
    inner: `
      <h1>Coming soon — stay tuned!</h1>
      <p>${message}</p>
      <a class="gbtn" href="/" style="margin-top:22px">Back to the course</a>
      <div class="tag">Wisdom to Lead, Intelligence to Serve</div>`,
  });
}
