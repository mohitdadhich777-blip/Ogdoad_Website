/* Minimal JS just for mobile menu */
document.addEventListener('click', () => {
  // no-op for now; CSS checkbox handles menu
});
// ===== Preview Modal Logic (with swipe support) =====
(function(){
  // Episode -> pages map (PNG paths as you placed)
  const PREVIEWS = {
    ep1: {
      pages: [
        'assets/preview/page1.png',
        'assets/preview/page2.png',
        'assets/preview/page3.png',
        'assets/preview/page4.png',
        'assets/preview/page5.png',
        'assets/preview/page6.png',
        'assets/preview/page7.png',
        'assets/preview/page8.png',
        'assets/preview/page9.png',
      ],
      free: 5,
      buyUrl: 'shop.html#ep1',
      detailsUrl: 'episodes.html#ep1',
      title: 'Episode 1 — Free Preview'
    }
  };

  const modal = document.getElementById('previewModal');
  if(!modal) return;

  const img = document.getElementById('pv-img');
  const lock = document.getElementById('pv-lock');
  const pageLbl = document.getElementById('pv-page');
  const totalLbl = document.getElementById('pv-total');
  const dotsWrap = document.getElementById('pv-dots');
  const btnPrev = document.getElementById('pv-prev');
  const btnNext = document.getElementById('pv-next');

  let activeKey = null;
  let pages = [];
  let pageIndex = 0; // 0-based
  let freeCount = 5;

  function renderDots(){
    dotsWrap.innerHTML = '';
    const count = Math.min(pages.length, freeCount);
    for(let i=0;i<count;i++){
      const d = document.createElement('span');
      d.className = 'dot' + (i===pageIndex ? ' active':'');
      dotsWrap.appendChild(d);
    }
  }

  function showPage(i){
    pageIndex = Math.max(0, Math.min(i, pages.length-1));
    const locked = pageIndex >= freeCount;

    img.setAttribute('src', pages[pageIndex]);
    img.style.filter = locked ? 'blur(2px) brightness(0.6)' : 'none';
    lock.classList.toggle('hidden', !locked);

    pageLbl.textContent = Math.min(pageIndex+1, freeCount);
    totalLbl.textContent = freeCount.toString();

    renderDots();
    btnPrev.disabled = (pageIndex === 0);
    btnNext.disabled = (pageIndex >= freeCount); // gate at free limit
  }

  function openPreview(key){
    const cfg = PREVIEWS[key];
    if(!cfg) return;
    activeKey = key;
    pages = cfg.pages.slice();
    freeCount = cfg.free || 5;
    pageIndex = 0;

    document.getElementById('pv-title').textContent = cfg.title || 'Free Preview';
    modal.querySelector('.pv-lock .pv-cta .primary').setAttribute('href', cfg.buyUrl);
    modal.querySelector('.pv-lock .pv-cta .ghost').setAttribute('href', cfg.detailsUrl);

    // Preload first few
    pages.slice(0, freeCount).forEach(p => { const im = new Image(); im.src = p; });

    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    showPage(0);
  }

  function closePreview(){
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  // Open/close handlers
  document.addEventListener('click', (e)=>{
    const opener = e.target.closest('[data-open-preview]');
    if(opener){
      e.preventDefault();
      openPreview(opener.getAttribute('data-open-preview'));
      return;
    }
    if(e.target.dataset.close) closePreview();
  });

  btnPrev && btnPrev.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex-1); });
  btnNext && btnNext.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex+1); });

  // Keyboard nav
  document.addEventListener('keydown', (e)=>{
    if(!modal.classList.contains('active')) return;
    if(e.key === 'Escape') closePreview();
    if(e.key === 'ArrowRight') showPage(pageIndex+1);
    if(e.key === 'ArrowLeft') showPage(pageIndex-1);
  });

  // Swipe support (touch)
  let touchStartX = null;
  let touchStartY = null;
  const STAGE = modal.querySelector('.pv-stage');

  STAGE.addEventListener('touchstart', (e)=>{
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, {passive:true});

  STAGE.addEventListener('touchend', (e)=>{
    if(touchStartX == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    // horizontal intent
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) showPage(pageIndex+1); else showPage(pageIndex-1);
    }
    touchStartX = touchStartY = null;
  }, {passive:true});

  // Prevent right-click save (casual)
  img.addEventListener('contextmenu', e=> e.preventDefault());
})();