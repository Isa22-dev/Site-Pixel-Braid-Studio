const loginClient = window.PixelBraidConfig?.supabaseClient;
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminLoginMessage = document.querySelector("#adminLoginMessage");
const adminLoginButton = document.querySelector("#adminLoginButton");

const adminPanelUrl = new URL("../admin.html", window.location.href);

if (!loginClient) {
  showLoginMessage(window.PixelBraidConfig?.supabaseMessage || "Supabase ainda não foi configurado.", "error");
  adminLoginButton.disabled = true;
} else {
  initAdminLogin();
}

async function initAdminLogin() {
  const { data } = await loginClient.auth.getSession();
  if (data.session && (await isAuthorizedAdmin())) {
    window.location.replace(adminPanelUrl.href);
    return;
  }

  if (data.session) await loginClient.auth.signOut();

  adminLoginForm.addEventListener("submit", handleAdminLogin);
}

async function handleAdminLogin(event) {
  event.preventDefault();
  showLoginMessage("", "");

  const email = document.querySelector("#adminEmail").value.trim();
  const password = document.querySelector("#adminPassword").value;

  adminLoginButton.disabled = true;
  adminLoginButton.textContent = "Entrando...";

  try {
    const { error } = await loginClient.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!(await isAuthorizedAdmin())) {
      await loginClient.auth.signOut();
      showLoginMessage("Usuário autenticado, mas sem permissão administrativa.", "error");
      return;
    }

    adminLoginForm.reset();
    window.location.replace(adminPanelUrl.href);
  } catch (error) {
    console.error("Erro no login admin:", error);
    showLoginMessage("Login não autorizado. Confira e-mail, senha e usuário criado no Supabase Auth.", "error");
  } finally {
    adminLoginButton.disabled = false;
    adminLoginButton.textContent = "Entrar";
  }
}

async function isAuthorizedAdmin() {
  const { data, error } = await loginClient.rpc("is_admin");
  return !error && data === true;
}

function showLoginMessage(message, type) {
  adminLoginMessage.textContent = message;
  adminLoginMessage.className = type ? `form-message ${type}` : "form-message";
}
