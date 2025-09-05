/* Minimal JS just for mobile menu */
document.addEventListener('click', () => {
  // no-op for now; CSS checkbox handles menu
});
document.querySelectorAll('img[loading="lazy"]').forEach(img=>{
  if(img.complete) { img.classList.add('loaded'); return; }
  img.addEventListener('load', ()=> img.classList.add('loaded'));
});
