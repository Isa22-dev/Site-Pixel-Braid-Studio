const bookingConfig = window.PixelBraidConfig;
const bookingForm = document.querySelector("#bookingForm");
const bookingFormMessage = document.querySelector("#formMessage");
const bookingSubmitButton = bookingForm?.querySelector(".submit-button");
const bookingDateInput = document.querySelector("#data");

if (bookingForm) {
  bookingForm.addEventListener("submit", handleBookingSubmit);
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  clearBookingMessage();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    showBookingMessage("Preencha todos os campos obrigatórios para continuar.", "error");
    return;
  }

  if (!bookingConfig?.supabaseClient) {
    showBookingMessage(bookingConfig?.supabaseMessage || "Supabase ainda não foi configurado.", "error");
    return;
  }

  const booking = getBookingData();
  bookingSubmitButton.disabled = true;
  bookingSubmitButton.textContent = "Salvando...";

  try {
    const { error } = await bookingConfig.supabaseClient.from("agendamentos").insert([booking]);
    if (error) throw error;

    showBookingMessage("Agendamento salvo com sucesso. Abrindo WhatsApp...", "success");
    bookingForm.reset();
    if (bookingDateInput) bookingDateInput.min = new Date().toISOString().split("T")[0];

    window.setTimeout(() => {
      window.location.href = buildBookingWhatsAppUrl(booking);
    }, 1000);
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error);
    showBookingMessage("Não foi possível salvar. Confira as políticas RLS do Supabase.", "error");
  } finally {
    bookingSubmitButton.disabled = false;
    bookingSubmitButton.textContent = "Confirmar Agendamento";
  }
}

function getBookingData() {
  const formData = new FormData(bookingForm);
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
    formatBookingDate(booking.data),
    "",
    "Horário:",
    booking.horario,
  ].join("\n");

  return window.PixelBraidWhatsApp.buildPlainWhatsAppUrl(message);
}

function formatBookingDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function showBookingMessage(message, type) {
  bookingFormMessage.textContent = message;
  bookingFormMessage.className = `form-message ${type}`;
}

function clearBookingMessage() {
  bookingFormMessage.textContent = "";
  bookingFormMessage.className = "form-message";
}
