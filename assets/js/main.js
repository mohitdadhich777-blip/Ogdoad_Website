/* Minimal JS just for mobile menu */
document.addEventListener('click', () => {
  // no-op for now; CSS checkbox handles menu
});
// ===== Preview Modal Logic — SIMPLE & RELIABLE =====
(function(){
  // ---- CONFIG: yahi actual file list set karo ----
  // Make sure ye EXACT names assets/preview/ me maujood hon
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
  const FREE = 5;

  // ---- DOM refs ----
  const modal = document.getElementById('previewModal');
  if(!modal) return; // page without modal

  const img = document.getElementById('pv-img');
  const lock = document.getElementById('pv-lock');
  const pageLbl = document.getElementById('pv-page');
  const totalLbl = document.getElementById('pv-total');
  const dotsWrap = document.getElementById('pv-dots');
  const btnPrev = document.getElementById('pv-prev');
  const btnNext = document.getElementById('pv-next');
  const STAGE = modal.querySelector('.pv-stage');

  const TOTAL = PAGES.length;
  let pageIndex = 1; // 1-based

  function renderDots(){
    if(!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for(let i=1;i<=FREE;i++){
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === pageIndex ? ' active' : '');
      dotsWrap.appendChild(dot);
    }
  }

  function setImg(src){
    // Always show the <img> unless actual error aata hai
    img.style.display = 'block';
    img.style.filter = 'none';
    img.removeAttribute('src'); // force reload

    img.onerror = () => {
      console.warn('[Preview] Failed to load:', src);
      // Graceful fallback: message show karo
      img.style.display = 'none';
      lock.classList.remove('hidden');
      lock.querySelector('h4').textContent = 'Preview image missing';
      lock.querySelector('p').textContent = 'This page could not be loaded. Please try again or continue to Buy.';
    };

    img.onload = () => {
      // restore lock text for normal gate
      lock.querySelector('h4').textContent = 'Get Full Access';
      lock.querySelector('p').textContent = 'Free preview ends here. Unlock the full episode to continue.';
    };

    img.src = src + '?v=' + Date.now(); // cache-bust
  }

  function showPage(n){
    pageIndex = Math.max(1, Math.min(n, TOTAL));
    const locked = pageIndex > FREE;

    const url = PAGES[pageIndex - 1];   // 0-based index
    if(url){
      setImg(url);
    } else {
      img.style.display = 'none';
    }

    // Gate: lock overlay for > FREE
    lock.classList.toggle('hidden', !locked);
    if(locked){
      img.style.filter = 'blur(2px) brightness(0.6)';
    }

    if(pageLbl) pageLbl.textContent = Math.min(pageIndex, FREE);
    if(totalLbl) totalLbl.textContent = String(FREE);

    renderDots();
    if(btnPrev) btnPrev.disabled = (pageIndex === 1);
    if(btnNext) btnNext.disabled = (pageIndex >= FREE);
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

  // Open/close via click (index + episodes)
  document.addEventListener('click', (e)=>{
    const opener = e.target.closest('[data-open-preview]');
    if(opener){
      e.preventDefault();
      openPreview();
      return;
    }
    if(e.target && e.target.dataset && e.target.dataset.close) closePreview();
  });

  // Buttons
  btnPrev && btnPrev.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex - 1); });
  btnNext && btnNext.addEventListener('click', (e)=>{ e.preventDefault(); showPage(pageIndex + 1); });

  // Keyboard
  document.addEventListener('keydown', (e)=>{
    if(!modal.classList.contains('active')) return;
    if(e.key === 'Escape') closePreview();
    if(e.key === 'ArrowRight') showPage(pageIndex + 1);
    if(e.key === 'ArrowLeft') showPage(pageIndex - 1);
  });

  // Swipe (mobile)
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