const SUPABASE_URL = "COLE_AQUI_A_URL_DO_SUPABASE";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_CHAVE_ANON_PUBLIC";
const WHATSAPP_NUMBER = "5511999999999";

const form = document.querySelector("#bookingForm");
const formMessage = document.querySelector("#formMessage");
const submitButton = form.querySelector(".submit-button");
const helpButton = document.querySelector("#helpButton");
const helpPanel = document.querySelector("#helpPanel");
const helpClose = document.querySelector("#helpClose");
const dateInput = document.querySelector("#data");

const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY.length > 30 &&
  window.supabase;

const supabaseClient = isSupabaseConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

dateInput.min = new Date().toISOString().split("T")[0];

helpButton.addEventListener("click", () => {
  const isOpen = helpPanel.classList.toggle("is-open");
  helpPanel.setAttribute("aria-hidden", String(!isOpen));
});

helpClose.addEventListener("click", () => {
  helpPanel.classList.remove("is-open");
  helpPanel.setAttribute("aria-hidden", "true");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage("Preencha todos os campos obrigatórios para continuar.", "error");
    return;
  }

  if (!supabaseClient) {
    showMessage("Configure SUPABASE_URL e SUPABASE_ANON_KEY no script.js.", "error");
    return;
  }

  const booking = getBookingData();

  submitButton.disabled = true;
  submitButton.textContent = "Salvando...";

  try {
    const { error } = await supabaseClient.from("agendamentos").insert([booking]);

    if (error) {
      throw error;
    }

    showMessage("Agendamento salvo com sucesso. Abrindo WhatsApp...", "success");
    form.reset();
    dateInput.min = new Date().toISOString().split("T")[0];

    window.setTimeout(() => {
      window.location.href = buildWhatsAppUrl(booking);
    }, 1200);
  } catch (error) {
    showMessage(
      "Não foi possível salvar o agendamento. Confira as chaves e permissões do Supabase.",
      "error",
    );
    console.error("Erro ao salvar agendamento:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Confirmar agendamento";
  }
});

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

function buildWhatsAppUrl(booking) {
  const message = [
    "Olá, Pixel Braid Studio!",
    "Quero confirmar meu agendamento:",
    `Nome: ${booking.nome_cliente}`,
    `Telefone: ${booking.telefone}`,
    `Serviço: ${booking.servico}`,
    `Data: ${formatDate(booking.data)}`,
    `Horário: ${booking.horario}`,
    booking.observacoes ? `Observações: ${booking.observacoes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function clearMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}
