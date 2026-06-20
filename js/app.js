const config = window.PixelBraidConfig;
const form = document.querySelector("#bookingForm");
const formMessage = document.querySelector("#formMessage");
const submitButton = form.querySelector(".submit-button");
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

dateInput.min = new Date().toISOString().split("T")[0];
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

document.querySelectorAll(".service-select").forEach((button) => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.service;
    document.querySelector("#agendamento").scrollIntoView({ behavior: "smooth" });
    serviceSelect.focus({ preventScroll: true });
  });
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage("Preencha todos os campos obrigatórios para continuar.", "error");
    return;
  }

  if (!config.supabaseClient) {
    showMessage("Configure SUPABASE_URL e SUPABASE_ANON_KEY em js/supabase.js ou na Vercel.", "error");
    return;
  }

  const booking = getBookingData();
  submitButton.disabled = true;
  submitButton.textContent = "Salvando...";

  try {
    const { error } = await config.supabaseClient.from("agendamentos").insert([booking]);
    if (error) throw error;

    showMessage("Agendamento salvo com sucesso. Abrindo WhatsApp...", "success");
    form.reset();
    dateInput.min = new Date().toISOString().split("T")[0];

    window.setTimeout(() => {
      window.location.href = buildBookingWhatsAppUrl(booking);
    }, 1000);
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error);
    showMessage("Não foi possível salvar. Confira as chaves e a política RLS do Supabase.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Confirmar Agendamento";
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 },
);

document.querySelectorAll(".section-reveal, .reveal-card").forEach((element) => observer.observe(element));

function getBookingData() {
  const formData = new FormData(form);
  return {
    nome_cliente: String(formData.get("nome_cliente")).trim(),
    telefone: String(formData.get("telefone")).trim(),
    servico: String(formData.get("servico")).trim(),
    data: String(formData.get("data")).trim(),
    horario: String(formData.get("horario")).trim(),
    observacoes: String(formData.get("observacoes")).trim(),
  };
}

function buildBookingWhatsAppUrl(booking) {
  const message = [
    "Olá!",
    "Gostaria de confirmar meu agendamento.",
    "",
    "Nome:",
    booking.nome_cliente,
    "",
    "Serviço:",
    booking.servico,
    "",
    "Data:",
    formatDate(booking.data),
    "",
    "Horário:",
    booking.horario,
  ].join("\n");

  return buildPlainWhatsAppUrl(message);
}

function buildPlainWhatsAppUrl(message) {
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function clearMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}
