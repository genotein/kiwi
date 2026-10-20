/* 공통 기능: 서버 통신, 데모 모드, 화면 도우미 */
const DEMO = !CONFIG.API_URL;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

async function api(action, data = {}) {
  if (DEMO) return demoApi(action, JSON.parse(JSON.stringify(data)));
  let res;
  try {
    res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...data }),
    });
  } catch (e) {
    throw new Error('서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.');
  }
  const j = await res.json().catch(() => ({ ok: false, error: '서버 응답을 읽지 못했어요.' }));
  if (!j.ok) throw new Error(j.error || '오류가 발생했어요.');
  return j;
}

/* ---------- 화면 도우미 ---------- */
const won = n => Number(n || 0).toLocaleString('ko-KR') + '원';
const onlyDigits = v => String(v || '').replace(/\D/g, '');
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function formatPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.startsWith('02')) {
    if (d.length < 3) return d;
    if (d.length < 6) return d.slice(0, 2) + '-' + d.slice(2);
    if (d.length < 10) return d.slice(0, 2) + '-' + d.slice(2, 5) + '-' + d.slice(5);
    return d.slice(0, 2) + '-' + d.slice(2, 6) + '-' + d.slice(6, 10);
  }
  if (d.length < 4) return d;
  if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
  if (d.length < 11) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
  return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
}
function bindPhoneInput(el) {
  el.addEventListener('input', () => { el.value = formatPhone(el.value); });
}

let toastTimer;
function toast(msg, type = '') {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.className = 'toast show ' + type;
  t.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 2600);
}

async function copyText(text, label = '복사했어요') {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    ta.remove();
  }
  toast(label);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-copy]');
  if (b) copyText(b.dataset.copy, b.dataset.copyMsg || '복사했어요');
});

/* 버튼 로딩 상태 */
async function withBusy(btn, fn) {
  if (btn.disabled) return;
  const label = btn.innerHTML;
  btn.disabled = true; btn.classList.add('busy');
  try { return await fn(); }
  finally { btn.disabled = false; btn.classList.remove('busy'); btn.innerHTML = label; }
}

/* 아래에서 올라오는 시트(모달) */
function openSheet(title, html) {
  closeSheet();
  const wrap = document.createElement('div');
  wrap.className = 'sheet-backdrop';
  wrap.id = 'sheet';
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><b>${esc(title)}</b><button type="button" class="icon-btn" data-close aria-label="닫기">✕</button></div>
    <div class="sheet-body">${html}</div></div>`;
  wrap.addEventListener('click', e => {
    if (e.target === wrap || e.target.closest('[data-close]')) closeSheet();
  });
  document.body.appendChild(wrap);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => wrap.classList.add('open'));
  return $('.sheet-body', wrap);
}
function closeSheet() {
  const s = $('#sheet');
  if (s) s.remove();
  document.body.classList.remove('no-scroll');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

/* 사진 줄이기 (업로드 용량 절약) */
function resizeImage(file, max = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('사진을 읽지 못했어요. 다른 사진으로 시도해주세요.')); };
    img.src = url;
  });
}

function showDemoBanner() {
  if (!DEMO) return;
  const b = document.createElement('div');
  b.className = 'demo-banner';
  b.textContent = '데모 모드 · 서버 연결 전이라 이 기기에만 임시 저장돼요';
  document.body.prepend(b);
}

/* ==========================================================
   데모 모드 (API_URL 이 비어 있을 때만 사용)
   ========================================================== */
function demoApi(action, r) {
  const KEY = 'kiwi_demo_db';
  const db = JSON.parse(localStorage.getItem(KEY) || '{"orders":[],"reships":[]}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(db));
  const fail = m => Promise.reject(new Error(m));
  const now = () => new Date().toLocaleString('sv-SE').slice(0, 16);
  const id = p => p + new Date().toISOString().slice(5, 10).replace('-', '') + '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase();
  const prod = v => CONFIG.PRODUCTS.find(p => p.id === v || '키위 ' + p.label === v);
  const nm = v => String(v || '').replace(/\s/g, '');
  const wait = v => new Promise(res => setTimeout(() => res(v), 350));

  if (action === 'createOrder') {
    const p = prod(r.product);
    if (!p) return fail('상품을 선택해주세요.');
    const o = {
      id: id('K'), createdAt: now(), name: r.name.trim(), phone: formatPhone(r.phone),
      zip: r.zip, address: r.address, addressDetail: r.addressDetail,
      product: '키위 ' + p.label, qty: +r.qty, amount: p.price * r.qty,
      payMethod: r.payMethod, depositor: r.depositor || r.name.trim(),
      paid: false, note: r.note, memo: '', updatedAt: '',
    };
    db.orders.unshift(o); save();
    return wait({ ok: true, order: o });
  }
  if (action === 'lookup') {
    const list = db.orders.filter(o => nm(o.name) === nm(r.name) && onlyDigits(o.phone) === onlyDigits(r.phone));
    return wait({ ok: true, orders: list.map(o => ({
      ...o, address: o.address.split(' ').slice(0, 2).join(' ') + ' ***',
      reships: db.reships.filter(x => x.orderId === o.id),
    })) });
  }
  if (action === 'reship') {
    const o = db.orders.find(x => x.id === r.orderId);
    if (!o) return fail('주문을 찾을 수 없어요.');
    db.reships.unshift({
      id: id('R'), createdAt: now(), orderId: o.id, name: o.name, phone: o.phone,
      type: r.type, content: r.content, photos: r.photos.map((_, i) => '#데모사진' + (i + 1)),
      status: '접수', memo: '',
    });
    save();
    return wait({ ok: true });
  }
  if (action === 'adminList') return wait({ ok: true, sheetUrl: '', ...db });
  if (action === 'adminUpdateOrder') {
    const o = db.orders.find(x => x.id === r.id);
    if (!o) return fail('주문을 찾을 수 없어요.');
    Object.assign(o, r.fields);
    if (r.fields.phone) o.phone = formatPhone(o.phone);
    const p = prod(o.product);
    if (p) { o.product = '키위 ' + p.label; o.qty = +o.qty; o.amount = p.price * o.qty; }
    o.updatedAt = now(); save();
    return wait({ ok: true, order: o });
  }
  if (action === 'adminUpdateReship') {
    const x = db.reships.find(v => v.id === r.id);
    if (!x) return fail('찾을 수 없어요.');
    Object.assign(x, r.fields); save();
    return wait({ ok: true });
  }
  return fail('알 수 없는 요청');
}
