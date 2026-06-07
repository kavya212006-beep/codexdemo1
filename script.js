(function () {
  "use strict";

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const pageName = document.body.dataset.page;
  const header = qs("[data-header]");
  const nav = qs("[data-nav]");
  const menuToggle = qs("[data-menu-toggle]");
  const backToTop = qs("[data-back-to-top]");

  window.addEventListener("load", () => {
    qs(".loader")?.classList.add("hidden");
  });

  const syncHeader = () => {
    const isScrolled = window.scrollY > 20;
    header?.classList.toggle("scrolled", isScrolled);
    backToTop?.classList.toggle("visible", window.scrollY > 520);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  menuToggle?.addEventListener("click", () => {
    nav?.classList.toggle("open");
    menuToggle.classList.toggle("open");
  });

  qsa(".nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if ((pageName === "home" && href === "index.html") || href.includes(`${pageName}.html`)) {
      link.classList.add("active");
    }
    link.addEventListener("click", () => nav?.classList.remove("open"));
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" })
    : null;

  qsa(".reveal").forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("visible");
  });

  const counterObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 })
    : null;

  qsa("[data-counter]").forEach((counter) => {
    if (counterObserver) counterObserver.observe(counter);
    else animateCounter(counter);
  });

  function animateCounter(counter) {
    const target = Number(counter.dataset.counter || "0");
    const duration = 1500;
    const start = performance.now();
    const format = (value) => target >= 1000 ? Math.floor(value).toLocaleString("en-IN") : Math.floor(value);

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else counter.textContent = format(target);
    }
    requestAnimationFrame(tick);
  }

  qsa(".accordion").forEach((accordion) => {
    const button = qs("button", accordion);
    button?.addEventListener("click", () => {
      const wasOpen = accordion.classList.contains("open");
      qsa(".accordion.open").forEach((item) => {
        if (item !== accordion) item.classList.remove("open");
      });
      accordion.classList.toggle("open", !wasOpen);
    });
  });

  const slider = qs("[data-slider]");
  if (slider) {
    const slides = qsa(".slide", slider);
    const prev = qs("[data-prev]", slider);
    const next = qs("[data-next]", slider);
    let active = 0;
    let timer;

    const showSlide = (index) => {
      slides[active]?.classList.remove("active");
      active = (index + slides.length) % slides.length;
      slides[active]?.classList.add("active");
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => showSlide(active + 1), 5200);
    };

    prev?.addEventListener("click", () => { showSlide(active - 1); restart(); });
    next?.addEventListener("click", () => { showSlide(active + 1); restart(); });
    restart();
  }

  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];
  qsa('input[type="date"]').forEach((input) => {
    input.min = minDate;
  });

  const appointmentForm = qs("#appointmentForm");
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const valid = validateForm(appointmentForm);
      const success = qs("#formSuccess");
      if (!valid) return;
      success.textContent = "Thank you. Your appointment request has been received. Our concierge team will contact you shortly to confirm your visit.";
      success.classList.add("show");
      appointmentForm.reset();
      qsa(".field-error", appointmentForm).forEach((row) => row.classList.remove("field-error"));
    });
  }

  const contactForm = qs("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const valid = validateForm(contactForm);
      const success = qs("#contactSuccess");
      if (!valid) return;
      success.textContent = "Your message has been sent. Our care team will reply as soon as possible.";
      success.classList.add("show");
      contactForm.reset();
    });
  }

  qsa("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
  });

  function validateForm(form) {
    const fields = qsa("input[required], select[required], textarea[required]", form);
    const results = fields.map(validateField);
    return results.every(Boolean);
  }

  function validateField(field) {
    const row = field.closest(".form-row");
    const error = qs(".error", row || document);
    let message = "";
    const value = field.value.trim();

    if (field.required && !value) {
      message = "This field is required.";
    } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = "Enter a valid email address.";
    } else if (field.type === "tel" && value && !/^[0-9+\-\s()]{8,18}$/.test(value)) {
      message = "Enter a valid phone number.";
    } else if (field.type === "date" && value && field.min && value < field.min) {
      message = "Please choose a future appointment date.";
    }

    row?.classList.toggle("field-error", Boolean(message));
    if (error) error.textContent = message;
    return !message;
  }
})();
