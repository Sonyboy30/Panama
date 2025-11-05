/*
  One file to power interactivity across the site
*/
(function(){
  // include header/footer partials
  document.querySelectorAll('[data-include]').forEach(async el=>{
    const path=el.getAttribute('data-include');
    try{const res=await fetch(path); el.outerHTML=await res.text(); attachNav();}catch(e){console.warn('Include failed',path,e)}
  });

  function attachNav(){
    const toggle=document.querySelector('.nav-toggle');
    const nav=document.querySelector('.nav');
    if(toggle && nav){
      toggle.addEventListener('click',()=>{
        const open=nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded',open);
      });
      // set active link
      const here=location.pathname.replace(/\/$/,'/index.html');
      document.querySelectorAll('.nav a').forEach(a=>{ if(here.endsWith(a.getAttribute('href'))) a.classList.add('active');});
    }
  }

  // scroll reveal
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} })
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // video modal
  const modal=document.getElementById('videoModal');
  const frame=document.getElementById('ytFrame');
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-video]');
    if(btn){ frame.src=btn.dataset.video; modal.showModal(); }
    if(e.target.matches('.modal-close')){ frame.src=''; modal.close(); }
  });

  // carousel on home
  const track=document.querySelector('.car-track');
  if(track){
    const slides=[...track.children];
    const prev=document.querySelector('.car-btn.prev');
    const next=document.querySelector('.car-btn.next');
    const dots=document.querySelector('.car-dots');
    let index=0;
    function go(i){ index=(i+slides.length)%slides.length; track.scrollTo({left:track.clientWidth*index,behavior:'smooth'}); updateDots(); }
    function updateDots(){ dots.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('active',j===index)); }
    slides.forEach((_,i)=>{ const b=document.createElement('button'); b.addEventListener('click',()=>go(i)); dots.appendChild(b);});
    updateDots();
    prev.addEventListener('click',()=>go(index-1));
    next.addEventListener('click',()=>go(index+1));
    let touchStart=null; track.addEventListener('touchstart',e=>touchStart=e.touches[0].clientX); track.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-touchStart; if(Math.abs(d)>40) go(index+(d<0?1:-1));});
  }

  // image lightbox for galleries
  document.querySelectorAll('[data-lightbox] img').forEach(img=>{
    img.style.cursor='zoom-in';
    img.addEventListener('click',()=>{
      const dlg=document.createElement('dialog');
      dlg.className='modal';
      dlg.innerHTML=`<button class="modal-close" aria-label="Close">×</button><div class="modal-body"><img src="${img.src}" alt="${img.alt}"></div>`;
      document.body.appendChild(dlg); dlg.showModal();
      dlg.querySelector('.modal-close').addEventListener('click',()=>dlg.remove());
    });
  });

  // before/after compare slider
  const cmp=document.querySelector('[data-compare]');
  if(cmp){
    const first=cmp.querySelector('img:first-child');
    const handle=cmp.querySelector('.handle');
    function set(x){
      const r=cmp.getBoundingClientRect();
      const pct=Math.min(1,Math.max(0,(x-r.left)/r.width));
      first.style.clipPath=`inset(0 ${(1-pct)*100}% 0 0)`; handle.style.left=`${pct*100}%`;
    }
    const move=e=>set((e.touches?e.touches[0].clientX:e.clientX));
    handle.addEventListener('mousedown',()=>window.addEventListener('mousemove',move));
    window.addEventListener('mouseup',()=>window.removeEventListener('mousemove',move));
    handle.addEventListener('touchstart',()=>window.addEventListener('touchmove',move));
    window.addEventListener('touchend',()=>window.removeEventListener('touchmove',move));
  }

  // Timeline data + renderer
  const timelineEl=document.getElementById('timeline');
  if(timelineEl){
    const timelineData=[
      {date:'1869‑11‑17', era:'French', title:'Suez Canal completed; U.S. creates IOCC', note:'Sets the model & ambition for a canal across Panama.'},
      {date:'1879‑05‑29', era:'French', title:'France approves de Lesseps’ sea‑level plan', note:'Costly plan; disease and landslides doom the attempt.'},
      {date:'1903‑11‑18', era:'U.S.', title:'Hay–Bunau‑Varilla Treaty', note:'U.S. obtains canal rights after Panama’s independence.'},
      {date:'1904‑05‑04', era:'U.S.', title:'American work begins', note:'John Wallace leads; Gorgas starts sanitation campaign.'},
      {date:'1905‑07‑26', era:'U.S.', title:'John Stevens takes over; lock plan chosen', note:'Railroad overhaul, modern shovels, and logistics.'},
      {date:'1906‑11‑15', era:'U.S.', title:'Theodore Roosevelt visits Panama', note:'First sitting U.S. president to travel abroad.'},
      {date:'1907‑02‑26', era:'U.S.', title:'Goethals named chief engineer', note:'Pushes 24/7 excavation; deals with strikes & slides.'},
      {date:'1913‑05‑20', era:'U.S.', title:'Culebra Cut excavation completed', note:'Two steam shovels meet in the middle.'},
      {date:'1914‑08‑15', era:'Operations', title:'Official opening; SS Ancon transits', note:'WWI muted celebrations but traffic grew quickly.'},
      {date:'1977‑09‑07', era:'Operations', title:'Torrijos–Carter Treaties signed', note:'Set path to Panamanian control.'},
      {date:'1999‑12‑31', era:'Operations', title:'Handover to Panama Canal Authority', note:'Panama assumes full control.'},
      {date:'2016‑06‑26', era:'Operations', title:'Expanded locks open', note:'“Neo‑Panamax” vessels begin transiting.'}
    ];

    const eraSel=document.getElementById('eraFilter');
    const search=document.getElementById('tlSearch');

    function render(){
      const era=eraSel.value; const q=(search.value||'').toLowerCase();
      const items=timelineData
        .filter(e=>era==='all'||e.era===era)
        .filter(e=>!q||e.title.toLowerCase().includes(q)||e.note.toLowerCase().includes(q))
        .sort((a,b)=>a.date.localeCompare(b.date));
      timelineEl.innerHTML=items.map(e=>`
        <article class="tl-card">
          <div class="tl-era">${e.era}</div>
          <div class="tl-date">${new Date(e.date).toLocaleDateString(undefined,{year:'numeric',month:'short'})}</div>
          <h3 class="tl-title">${e.title}</h3>
          <details><summary>Details</summary><p class="muted">${e.note}</p></details>
        </article>`).join('');
    }
    eraSel.addEventListener('change',render); search.addEventListener('input',render); render();
  }
})();
