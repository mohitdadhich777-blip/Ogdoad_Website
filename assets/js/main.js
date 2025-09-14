/* Minimal menu noop so old behavior stays */
document.addEventListener('click', ()=>{});

/* ===== Preview Modal Logic — stable (5 free, total 9) ===== */
(function(){
  const TOTAL = 9;   // tumne 9 images dali hain
  const FREE  = 5;

  // Exact filenames — yahi use honge (lowercase, .png)
  const PAGES = [
    'assets/preview/page1.png',
    'assets/preview/page2.png',
    'assets/preview/page3.png',
    'assets/preview/page4.png',
    'assets/preview/page5.png',
    'assets/preview/page6.png',
    'assets/preview/page7.png',
    'assets/preview/page8.png',
    'assets/preview/page9.png',
  ];

  // DOM
  const modal   = document.getElementById('previewModal');
  if(!modal) return; // page without modal

  const img     = document.getElementById('pv-img');
  const lock    = document.getElementById('pv-lock');
  const pageLbl = document.getElementById('pv-page');
  const totalLbl= document.getElementById('pv-total');
  const dots    = document.getElementById('pv-dots');
  const btnPrev = document.getElementById('pv-prev');
  const btnNext = document.getElementById('pv-next');
  const STAGE   = modal.querySelector('.pv-stage');

  let pageIndex = 1; // 1-based

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

  function setImage(url, locked){
    img.onerror = () => {
      console.warn('[Preview] failed:', url);
      img.style.display = 'none';
      lock.classList.remove('hidden');
      lock.querySelector('h4').textContent = 'Preview image missing';
      lock.querySelector('p').textContent  = 'This page could not be loaded.';
    };
    img.onload = () => { img.style.display = 'block'; };
    img.src = url + '?t=' + Date.now(); // cache-bust
    applyLock(locked);
  }

  function showPage(n){
    pageIndex = Math.max(1, Math.min(n, TOTAL));
    const locked = pageIndex > FREE;
    const url = PAGES[pageIndex - 1];

    if(url){ setImage(url, locked); }
    else { img.style.display = 'none'; lock.classList.remove('hidden'); }

    // Counter UI: 4/5 style (FREE tak count)
    pageLbl.textContent  = Math.min(pageIndex, FREE);
    totalLbl.textContent = String(FREE);
    renderDots();

    btnPrev.disabled = (pageIndex === 1);
    btnNext.disabled = (pageIndex >= TOTAL); // TOTAL tak navigation allow
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

  // Open / Close (delegation)
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

  // Swipe (mobile)
  let sx=null, sy=null;
  STAGE.addEventListener('touchstart', (e)=>{
    const t=e.touches[0]; sx=t.clientX; sy=t.clientY;
  }, {passive:true});
  STAGE.addEventListener('touchend', (e)=>{
    if(sx==null) return;
    const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){
      if(dx<0) showPage(pageIndex+1); else showPage(pageIndex-1);
    }
    sx=sy=null;
  }, {passive:true});

  // Block right-click save
  img.addEventListener('contextmenu', e=> e.preventDefault());
})();