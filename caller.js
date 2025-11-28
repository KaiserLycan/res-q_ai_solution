(() => {
  const body = document.body;
  const sosBtn = document.getElementById('sosBtn');
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  const btnMain = document.getElementById('btnMain');
  const btnSub = document.getElementById('btnSub');

  let live = false;

  function setIdle() {
    live = false;
    body.classList.remove('live');
    body.classList.add('idle');
    sosBtn.setAttribute('aria-pressed','false');
    statusText.querySelector('.primary').textContent = 'SYSTEM ARMED';
    btnMain.textContent = 'SOS';
    btnSub.textContent = 'TAP TO BROADCAST';
  }

  function setLive() {
    live = true;
    body.classList.remove('idle');
    body.classList.add('live');
    sosBtn.setAttribute('aria-pressed','true');
    statusText.querySelector('.primary').textContent = 'CONNECTION ESTABLISHED';
    btnMain.textContent = 'LIVE';
    btnSub.textContent = 'SENDING AUDIO...';
  }

  // Toggle handler with a short button press and hold logic
  sosBtn.addEventListener('click', () => {
    if (live) setIdle(); else setLive();
  });

  // Keyboard accessibility
  sosBtn.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      sosBtn.click();
    }
  });

  // Initialize idle
  setIdle();

  // Optional: expose small API for external control
  window.CallerUI = {setLive, setIdle, isLive: () => live};

  // --- Menu interactions ---
  const menuToggle = document.getElementById('menuToggle');
  const menuDropdown = document.getElementById('menuDropdown');
  const muteToggle = document.getElementById('muteToggle');
  const shareLoc = document.getElementById('shareLoc');
  const settingsBtn = document.getElementById('settingsBtn');
  const helpBtn = document.getElementById('helpBtn');
  const locationInput = document.getElementById('locationInput');

  function openMenu(){
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded','true');
    menuDropdown.setAttribute('aria-hidden','false');
  }
  function closeMenu(){
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded','false');
    menuDropdown.setAttribute('aria-hidden','true');
  }

  menuToggle.addEventListener('click', (e)=>{
    const open = document.body.classList.contains('menu-open');
    if(open) closeMenu(); else openMenu();
  });

  // Close on outside click
  document.addEventListener('click', (e)=>{
    if (!e.target.closest('.menu-wrap')) closeMenu();
  });

  // Escape to close
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeMenu();
  });

  // Mute toggle (UI-only)
  muteToggle.addEventListener('click', ()=>{
    const pressed = muteToggle.getAttribute('aria-pressed') === 'true';
    muteToggle.setAttribute('aria-pressed', String(!pressed));
    if(!pressed){
      muteToggle.classList.add('muted');
      muteToggle.querySelector('.label').textContent = 'Unmute Audio';
      document.body.classList.add('muted');
    } else {
      muteToggle.classList.remove('muted');
      muteToggle.querySelector('.label').textContent = 'Mute Audio';
      document.body.classList.remove('muted');
    }
  });

  // Share location: fill input with coordinates
  shareLoc.addEventListener('click', ()=>{
    if (!navigator.geolocation){
      alert('Geolocation not supported');
      return;
    }
    shareLoc.disabled = true;
    shareLoc.querySelector('.label').textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition((pos)=>{
      const {latitude, longitude} = pos.coords;
      locationInput.value = `Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)}`;
      // flash input
      locationInput.parentElement.classList.add('flash');
      setTimeout(()=>locationInput.parentElement.classList.remove('flash'), 900);
      shareLoc.querySelector('.label').textContent = 'Share Location';
      shareLoc.disabled = false;
      closeMenu();
    }, (err)=>{
      shareLoc.querySelector('.label').textContent = 'Share Location';
      shareLoc.disabled = false;
      alert('Unable to get location');
    }, {enableHighAccuracy:true, timeout:8000});
  });

  settingsBtn.addEventListener('click', ()=>{
    closeMenu();
    alert('Settings not implemented in this prototype.');
  });
  helpBtn.addEventListener('click', ()=>{
    closeMenu();
    alert('Help resources are not available in this prototype.');
  });

  // expose menu controls
  window.CallerUI.openMenu = openMenu;
  window.CallerUI.closeMenu = closeMenu;

  // --- Page navigation (tabs) ---
  const pageLinks = document.querySelectorAll('.page-link');
  function markActiveLink(){
    const path = window.location.pathname.split('/').pop() || 'index.html';
    pageLinks.forEach(link => {
      const href = link.getAttribute('href').split('/').pop();
      if (href === path) {
        link.classList.add('active');
        link.setAttribute('aria-current','page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }
  // Close menu when clicking a link; let browser handle navigation
  pageLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
  markActiveLink();

})();
