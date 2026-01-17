// script.js - تفاعلات بسيطة للموقع
(function(){
  const qs = (s, ctx=document) => ctx.querySelector(s);
  const qsa = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

  // Toggle mobile nav
  const toggleBtn = qs('.nav__toggle');
  const navList = qs('.nav__list');
  if(toggleBtn && navList){
    toggleBtn.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Smooth scroll for internal links
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id && qs(id);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        navList?.classList.remove('is-open');
        toggleBtn?.setAttribute('aria-expanded','false');
      }
    });
  });

  // Testimonials slider (simple)
  const testimonials = qsa('.testimonial');
  let current = testimonials.findIndex(el => el.classList.contains('is-active'));
  const prevBtn = qs('.ts-btn[data-dir="prev"]');
  const nextBtn = qs('.ts-btn[data-dir="next"]');
  function show(idx){
    testimonials.forEach(el => el.classList.remove('is-active'));
    testimonials[idx]?.classList.add('is-active');
  }
  function step(dir){
    if(!testimonials.length) return;
    current = (current + dir + testimonials.length) % testimonials.length;
    show(current);
  }
  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));
  let auto = setInterval(() => step(1), 5000);
  [prevBtn, nextBtn].forEach(btn => btn?.addEventListener('click', () => { clearInterval(auto); auto = setInterval(() => step(1), 7000); }));

  // Contact form validation & mock submit
  const form = qs('#contactForm');
  const status = qs('.form__status');
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      const fd = new FormData(form);
      // Honeypot
      if(fd.get('hp_field')){ status.textContent = 'تم تجاهل الطلب.'; return; }
      const name = String(fd.get('name')||'').trim();
      const email = String(fd.get('email')||'').trim();
      const phone = String(fd.get('phone')||'').trim();
      const company = String(fd.get('company')||'').trim();
      const message = String(fd.get('message')||'').trim();
      // Basic validations
      const errors = [];
      if(name.length < 3) errors.push('يرجى إدخال اسم صحيح');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('يرجى إدخال بريد صحيح');
      if(!/^[0-9+\-\s]{8,}$/.test(phone)) errors.push('يرجى إدخال رقم صحيح');
      if(message.length < 10) errors.push('الرسالة قصيرة جدًا');

      if(errors.length){
        status.textContent = errors.join(' • ');
        status.style.color = '#ffb3b3';
        return;
      }

      // Redirect to WhatsApp with prefilled message
      const msgText = `طلب استشارة محاسبية\nالاسم: ${name}\nالبريد: ${email}\nالجوال: ${phone}\nالشركة: ${company || '-'}\nالتفاصيل: ${message}`;
      const waNumberAttr = form.getAttribute('data-whatsapp') || '';
      const waNumber = waNumberAttr.replace(/\D/g, '');
      const base = waNumber ? `https://wa.me/${201101030421}` : `https://wa.me/201101030421`;
      const waUrl = `${base}?text=${encodeURIComponent(msgText)}`;
      status.textContent = 'سيتم تحويلك إلى واتساب لإتمام الطلب...';
      status.style.color = '#89f1f1';
      // Try opening in new tab; fallback to same-tab
      const opened = window.open(waUrl, '_blank');
      if(!opened){
        window.location.href = waUrl;
      }
    });
  }
  // Set WhatsApp footer link from form data-whatsapp if available
  const waFooterLink = qsa('.footer__social a').find(a => a.getAttribute('aria-label') === 'واتساب');
  if(waFooterLink){
    const waNumberAttr = (form?.getAttribute('data-whatsapp') || '').replace(/\D/g, '');
    waFooterLink.setAttribute('href', waNumberAttr ? `https://wa.me/${201101030421}` : 'https://wa.me/201101030421');
    waFooterLink.setAttribute('target','_blank');
    waFooterLink.setAttribute('rel','noopener');
  }
})();
