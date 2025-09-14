/* Minimal JS just for mobile menu */
document.addEventListener('click', () => {
  // no-op for now; CSS checkbox handles menu
});
// ===== Preview Modal Logic (robust paths + swipe + sizing) =====
(function(){
  const TOTAL = 9;          // total images you placed
  const FREE = 5;           // free pages
  const BASE = 'assets/preview/';

  // Build filename candidates for n (1-based)
  function buildVariants(n){
    const s = String(n);
    const s0 = n < 10 ? '0' + s : s;          // leading zero
    const names = [
      `page${s}`, `Page${s}`,
      `page ${s}`, `Page ${s}`,
      `page-${s}`, `Page-${s}`,
      `page_${s}`, `Page_${s}`,
      `page${s0}`, `Page${s0}`,               // 01, 03 variants
      `page ${s0}`, `Page ${s0}`,
      `page-${s0}`, `Page-${s0}`,
      `page_${s0}`, `Page_${s0}`,
    ];
    const exts = ['png','PNG','jpg','JPG','jpeg','JPEG','webp','WEBP'];
    const out = [];
    for(const nm of names){
      for(const ext of exts){
        out.push(`${BASE}${nm}.${ext}`);
      }
    }
    return out;
  }

function resolveImage(n){
  return new Promise((resolve)=>{
    // 1) Explicit override first (bulletproof)
    if (PAGE_MAP[n]) {
      const test = new Image();
      test.onload = () => resolve(PAGE_MAP[n]);
      test.onerror = () => {
        // fallback to guessing if override path fails
        tryNext();
      };
      test.src = PAGE_MAP[n] + `?v=${Date.now()}`;
      return;
    }

    // 2) Otherwise try variants
    const opts = buildVariants(n);
    let i = 0, img = new Image();
    const tryNext = () => {
      if(i >= opts.length){ resolve(null); return; }
      const url = opts[i++];
      img = new Image();
      img.onload = () => resolve(url);
      img.onerror = tryNext;
      img.src = url + `?v=${Date.now()}`;
    };
    tryNext();
  });
}

  // Cache
  const RES = new Array(TOTAL+1).fill(null);  // 1..TOTAL

  // DOM
  const modal = document.getElementById('previewModal');
  if(!modal) return;                           // page without modal

  const img = document.getElementById('pv-img');
  const lock = document.getElementById('pv-lock');
  const pageLbl = document.getElementById('pv-page');
  const totalLbl = document.getElementById('pv-total');
  const dotsWrap = document.getElementById('pv-dots');
  const btnPrev = document.getElementById('pv-prev');
  const btnNext = document.getElementById('pv-next');
  const STAGE = modal.querySelector('.pv-stage');

  let pageIndex = 1;

  function renderDots(){
    dotsWrap.innerHTML = '';
    for(let i=1;i<=FREE;i++){
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === pageIndex ? ' active' : '');
      dotsWrap.appendChild(dot);
    }
  }

  async function showPage(n){
    pageIndex = Math.max(1, Math.min(n, TOTAL));
    const locked = pageIndex > FREE;

    if(!RES[pageIndex]) RES[pageIndex] = await resolveImage(pageIndex);
    const url = RES[pageIndex];

    if(url){
      img.setAttribute('src', url);
      img.style.display = 'block';
    } else {
      // Graceful fallback if not found
      img.style.display = 'none';
    }

    img.style.filter = locked ? 'blur(2px) brightness(0.6)' : 'none';
    lock.classList.toggle('hidden', !locked);

    pageLbl.textContent = Math.min(pageIndex, FREE);
    totalLbl.textContent = String(FREE);

    renderDots();
    if(btnPrev) btnPrev.disabled = (pageIndex === 1);
    if(btnNext) btnNext.disabled = (pageIndex >= TOTAL);
  }

  async function primeFirst(){
    // Resolve first FREE quickly
    for(let i=1;i<=FREE;i++){
      if(!RES[i]) RES[i] = await resolveImage(i);
    }
  }

  async function openPreview(){
    await primeFirst();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    await showPage(1);
  }

  function closePreview(){
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open/close via clicks
  document.addEventListener('click', (e)=>{
    const opener = e.target.closest('[data-open-preview]');
    if(opener){
      e.preventDefault();
      openPreview();
      return;
    }
    if(e.target && e.target.dataset && e.target.dataset.close) closePreview();
  });

  btnPrev && btnPrev.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex - 1); });
  btnNext && btnNext.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex + 1); });

  // Keyboard navigation
  document.addEventListener('keydown', (e)=>{
    if(!modal.classList.contains('active')) return;
    if(e.key === 'Escape') closePreview();
    if(e.key === 'ArrowRight') showPage(pageIndex + 1);
    if(e.key === 'ArrowLeft') showPage(pageIndex - 1);
  });

  // Swipe support (mobile)
  let startX = null, startY = null;
  STAGE.addEventListener('touchstart', (e)=>{
    const t = e.touches[0]; startX = t.clientX; startY = t.clientY;
  }, {passive:true});
  STAGE.addEventListener('touchend', (e)=>{
    if(startX == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) showPage(pageIndex + 1);
      else showPage(pageIndex - 1);
    }
    startX = startY = null;
  }, {passive:true});

  // Prevent casual save
  img.addEventListener('contextmenu', e=> e.preventDefault());
})();