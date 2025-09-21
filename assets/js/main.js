/* Minimal menu noop so old behavior stays */
document.addEventListener('click', ()=>{});

/* ===== Preview Modal Logic — robust resolver (no layout change) ===== */
(function(){
  const TOTAL = 9;      // total pages
  const FREE  = 5;      // free pages

  // ---- Candidate URL builder (covers assets vs assests, case + ext) ----
  const DIRS = ['assets/preview/', 'assests/preview/'];       // both spellings
  const EXTS = ['png','PNG','jpg','JPG','jpeg','JPEG','webp','WEBP'];

  function candidates(n){
    const s = String(n);
    const s0 = n < 10 ? '0'+s : s;
    const names = [
      `page${s}`, `Page${s}`,
      `page ${s}`, `Page ${s}`,
      `page-${s}`, `Page-${s}`,
      `page_${s}`, `Page_${s}`,
      `page${s0}`, `Page${s0}`,
      `page ${s0}`, `Page ${s0}`,
      `page-${s0}`, `Page-${s0}`,
      `page_${s0}`, `Page_${s0}`,
    ];
    const out = [];
    for(const d of DIRS){
      for(const nm of names){
        for(const ext of EXTS){
          out.push(`${d}${nm}.${ext}`);
        }
      }
    }
    return out;
  }

  function resolveImage(n){
    return new Promise((resolve)=>{
      const list = candidates(n);
      let i = 0, img = new Image();
      const tryNext = () => {
        if(i >= list.length){ resolve(null); return; }
        const url = list[i++];
        img = new Image();
        img.onload  = () => resolve(url);
        img.onerror = tryNext;
        img.src     = url + `?t=${Date.now()}`; // cache-bust
      };
      tryNext();
    });
  }

  // DOM refs (already present)
  const modal   = document.getElementById('previewModal');
  if(!modal) return;
  const img     = document.getElementById('pv-img');
  const lock    = document.getElementById('pv-lock');
  const pageLbl = document.getElementById('pv-page');
  const totalLbl= document.getElementById('pv-total');
  const dots    = document.getElementById('pv-dots');
  const btnPrev = document.getElementById('pv-prev');
  const btnNext = document.getElementById('pv-next');
  const STAGE   = modal.querySelector('.pv-stage');

  // cache of resolved URLs
  const RES = new Array(TOTAL+1).fill(null);
  let pageIndex = 1;

  function renderDots(){
    dots.innerHTML = '';
    for(let i=1;i<=FREE;i++){
      const el = document.createElement('span');
      el.className = 'dot' + (i===pageIndex ? ' active' : '');
      dots.appendChild(el);
    }
  }

  function applyLock(locked){
    img.style.filter = locked ? 'blur(2px) brightness(0.6)' : 'none';
    lock.classList.toggle('hidden', !locked);
  }

  async function showPage(n){
    pageIndex = Math.max(1, Math.min(n, TOTAL));
    const locked = pageIndex > FREE;

    if(!RES[pageIndex]) RES[pageIndex] = await resolveImage(pageIndex);
    const url = RES[pageIndex];

    if(url){
      img.onerror = () => {
        img.style.display = 'none';
        lock.classList.remove('hidden');
      };
      img.onload = () => { img.style.display = 'block'; };
      img.src = url;                 // already cache-busted above
      applyLock(locked);
    }else{
      // koi variant nahi mila
      img.style.display = 'none';
      lock.classList.remove('hidden');
    }

    pageLbl.textContent  = Math.min(pageIndex, FREE);
    totalLbl.textContent = String(FREE);
    renderDots();

    btnPrev.disabled = (pageIndex === 1);
    btnNext.disabled = (pageIndex >= TOTAL);   // TOTAL tak navigate allowed
  }

  function openPreview(){
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    showPage(1);
  }
  function closePreview(){
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  // Open/close hooks
  document.addEventListener('click', (e)=>{
    const opener = e.target.closest('[data-open-preview]');
    if(opener){ e.preventDefault(); openPreview(); return; }
    if(e.target && e.target.dataset && e.target.dataset.close) closePreview();
  });

  // Buttons
  btnPrev.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex-1); });
  btnNext.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex+1); });

  // Keyboard
  document.addEventListener('keydown', (e)=>{
    if(!modal.classList.contains('active')) return;
    if(e.key === 'Escape') closePreview();
    if(e.key === 'ArrowRight') showPage(pageIndex+1);
    if(e.key === 'ArrowLeft')  showPage(pageIndex-1);
  });

  // Swipe
  let sx=null, sy=null;
  STAGE.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; }, {passive:true});
  STAGE.addEventListener('touchend',   (e)=>{
    if(sx==null) return;
    const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){
      if(dx<0) showPage(pageIndex+1); else showPage(pageIndex-1);
    }
    sx=sy=null;
  }, {passive:true});

  img.addEventListener('contextmenu', e=> e.preventDefault());
})();