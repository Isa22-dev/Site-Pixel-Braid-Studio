const config = window.PixelBraidConfig;
const serviceSelect = document.querySelector("#servico");
const dateInput = document.querySelector("#data");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const mascotButton = document.querySelector("#mascotButton");
const assistantModal = document.querySelector("#assistantModal");
const assistantClose = document.querySelector("#assistantClose");
const assistantWhatsApp = document.querySelector("#assistantWhatsApp");
const footerWhatsApp = document.querySelector("#footerWhatsApp");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxClose = document.querySelector("#lightboxClose");

if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
assistantWhatsApp.href = buildPlainWhatsAppUrl("Olá! Quero falar com o Pixel Braid Studio.");
footerWhatsApp.href = buildPlainWhatsAppUrl("Olá! Quero saber mais sobre os agendamentos.");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".service-select");
  if (!button) return;

  const serviceName = button.dataset.service;
  if (serviceName) {
    ensureServiceOption(serviceName);
    serviceSelect.value = serviceName;
  }

  document.querySelector("#agendamento").scrollIntoView({ behavior: "smooth" });
  serviceSelect.focus({ preventScroll: true });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".subscription-button");
  if (!button) return;

  const planName = button.dataset.plan;
  const message = `Olá! Tenho interesse no Plano ${planName} de Tranças por Assinatura do Pixel Braid Studio. Gostaria de saber mais informações.`;
  window.location.href = buildPlainWhatsAppUrl(message);
});

mascotButton.addEventListener("click", () => openModal(assistantModal));
assistantClose.addEventListener("click", () => closeModal(assistantModal));
assistantModal.addEventListener("click", (event) => {
  if (event.target === assistantModal) closeModal(assistantModal);
});

document.querySelectorAll(".assistant-actions a[href^='#']").forEach((link) => {
  link.addEventListener("click", () => closeModal(assistantModal));
});

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.lightbox;
    openModal(lightbox);
  });
});

lightboxClose.addEventListener("click", () => closeModal(lightbox));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeModal(lightbox);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal(assistantModal);
    closeModal(lightbox);
  }
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
  );

  document.querySelectorAll(".section-reveal, .reveal-card").forEach((element) => observer.observe(element));

  window.PixelBraidReveal = {
    observe(element) {
      element.classList.add("is-visible");
      observer.observe(element);
    },
  };
} else {
  document.querySelectorAll(".section-reveal, .reveal-card").forEach((element) => element.classList.add("is-visible"));

  window.PixelBraidReveal = {
    observe(element) {
      element.classList.add("is-visible");
    },
  };
}

function ensureServiceOption(serviceName) {
  const exists = Array.from(serviceSelect.options).some((option) => option.value === serviceName);
  if (exists) return;

  serviceSelect.append(new Option(serviceName, serviceName));
}

function buildPlainWhatsAppUrl(message) {
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

window.PixelBraidWhatsApp = { buildPlainWhatsAppUrl };
