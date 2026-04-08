/* ═══════════════════════════════════════════════
   ENCANTO DE VÊNUS · script.js
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Elementos ──────────────────────────────── */
  const header      = document.getElementById('header');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const cartBadge   = document.getElementById('cartBadge');
  const cartToast   = document.getElementById('cartToast');
  const cartToastMsg = document.getElementById('cartToastMsg');
  const mobileLinks = mobileMenu.querySelectorAll('.nav__link');

  /* ══════════════════════════════════════════════
     1. HEADER · Scroll comportamento
     ═══════════════════════════════════════════ */
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Adiciona sombra ao scrollar
    if (currentScroll > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  /* ══════════════════════════════════════════════
     2. MENU HAMBURGUER (Mobile)
     ═══════════════════════════════════════════ */
  function toggleMenu(forceClose = false) {
    const isOpen = mobileMenu.classList.contains('open') || forceClose;

    if (isOpen) {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Fecha o menu ao clicar em um link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // Fecha o menu ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu(true);
    }
  });

  /* ══════════════════════════════════════════════
     3. CARRINHO · Adicionar produto
     ═══════════════════════════════════════════ */
  let cartCount = 0;
  let toastTimer = null;

  const cartProducts = {};

  function showToast(message) {
    cartToastMsg.textContent = message;
    cartToast.classList.add('show');

    // Limpa timer anterior se existir
    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      cartToast.classList.remove('show');
    }, 3000);
  }

  function updateCartBadge() {
    cartBadge.textContent = cartCount;

    // Animação de "bump" no badge
    cartBadge.classList.remove('bump');
    void cartBadge.offsetWidth; // força reflow para reiniciar animação
    cartBadge.classList.add('bump');

    setTimeout(() => cartBadge.classList.remove('bump'), 300);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn--add-cart');
    if (!btn) return;

    // Pega dados do card pai
    const card = btn.closest('.product-card');
    if (!card) return;

    const productId   = card.dataset.id;
    const productName = card.dataset.name;
    const productPrice = card.dataset.price;

    // Registra no "carrinho"
    if (cartProducts[productId]) {
      cartProducts[productId].qty += 1;
    } else {
      cartProducts[productId] = {
        name: productName,
        price: parseFloat(productPrice),
        qty: 1
      };
    }

    cartCount++;
    updateCartBadge();

    // Feedback visual no botão
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado!';
    btn.style.background = 'var(--wine)';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled = false;
    }, 1500);

    // Toast
    showToast(`"${productName}" adicionado ao carrinho!`);

    // Log no console (útil para debug/integração)
    console.log('[Carrinho]', JSON.parse(JSON.stringify(cartProducts)));
  });

  /* ══════════════════════════════════════════════
     4. BOTÃO DE BUSCA (placeholder)
     ═══════════════════════════════════════════ */
  document.getElementById('searchBtn').addEventListener('click', () => {
    // Futuramente: abre modal de busca
    showToast('🔍 Busca em desenvolvimento — em breve!');
  });

  /* ══════════════════════════════════════════════
     5. BOTÃO DO CARRINHO (sumário)
     ═══════════════════════════════════════════ */
  document.getElementById('cartBtn').addEventListener('click', () => {
    if (cartCount === 0) {
      showToast('Seu carrinho está vazio. Explore nossas peças!');
      return;
    }
    const total = Object.values(cartProducts)
      .reduce((sum, p) => sum + p.price * p.qty, 0)
      .toFixed(2)
      .replace('.', ',');

    showToast(`Carrinho: ${cartCount} ${cartCount === 1 ? 'item' : 'itens'} · R$ ${total}`);
  });

  /* ══════════════════════════════════════════════
     6. NEWSLETTER (placeholder)
     ═══════════════════════════════════════════ */
  document.querySelector('.newsletter-form .btn--primary')
    .addEventListener('click', () => {
      const emailInput = document.querySelector('.newsletter-form input[type="email"]');
      const email = emailInput.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Por favor, insira um e-mail válido.');
        emailInput.focus();
        return;
      }

      showToast(`✉️ Obrigada! Você receberá nossas novidades.`);
      emailInput.value = '';
    });

  /* ══════════════════════════════════════════════
     7. INTERSECTION OBSERVER · Animações de entrada
     ═══════════════════════════════════════════ */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const fadeElements = document.querySelectorAll(
    '.product-card, .cat-card, .testimonial-card, .section-header, .strip, .mid-banner__content'
  );

  // Prepara elementos para animação
  fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger delay para cards em grid
        const delay = entry.target.closest('.products__grid, .categories__grid, .testimonials__grid')
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
          : 0;

        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  /* ══════════════════════════════════════════════
     8. SMOOTH SCROLL · Links âncora
     ═══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = header.offsetHeight + 16;
        const elementTop = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementTop - headerOffset, behavior: 'smooth' });
      }
    });
  });

})();
