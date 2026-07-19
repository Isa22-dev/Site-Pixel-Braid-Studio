const adminClient = window.PixelBraidConfig?.supabaseClient;
const adminDashboard = document.querySelector("#adminDashboard");
const logoutButton = document.querySelector("#logoutButton");
const menuLogoutButton = document.querySelector("#menuLogoutButton");
const catalogForm = document.querySelector("#catalogForm");
const catalogList = document.querySelector("#adminCatalogList");
const bookingList = document.querySelector("#adminBookingList");
const catalogMessage = document.querySelector("#catalogMessage");
const formTitle = document.querySelector("#formTitle");
const clearFormButton = document.querySelector("#clearFormButton");
const saveCatalogButton = document.querySelector("#saveCatalogButton");
const adminLoginUrl = new URL("admin/login.html", window.location.href);

const fields = {
  id: document.querySelector("#catalogId"),
  nome: document.querySelector("#catalogNome"),
  descricao: document.querySelector("#catalogDescricao"),
  preco: document.querySelector("#catalogPreco"),
  tempo: document.querySelector("#catalogTempo"),
  categoria: document.querySelector("#catalogCategoria"),
  imagemUrl: document.querySelector("#catalogImagemUrl"),
  imagemFile: document.querySelector("#catalogImagemFile"),
  ativo: document.querySelector("#catalogAtivo"),
};

if (!adminClient) {
  window.location.replace(adminLoginUrl.href);
} else {
  initAdmin();
}

async function initAdmin() {
  const { data, error } = await adminClient.auth.getSession();
  if (error || !data.session || !(await isAuthorizedAdmin())) {
    await adminClient.auth.signOut();
    redirectToLogin();
    return;
  }

  setAuthState(true);

  adminClient.auth.onAuthStateChange((_event, session) => {
    if (!session) redirectToLogin();
  });

  logoutButton.addEventListener("click", handleLogout);
  menuLogoutButton.addEventListener("click", handleLogout);
  catalogForm.addEventListener("submit", handleSaveCatalogItem);
  clearFormButton.addEventListener("click", resetCatalogForm);
  catalogList.addEventListener("click", handleCatalogListAction);
}

async function isAuthorizedAdmin() {
  const { data, error } = await adminClient.rpc("is_admin");
  return !error && data === true;
}

async function setAuthState(isAuthenticated) {
  adminDashboard.hidden = !isAuthenticated;

  if (isAuthenticated) {
    await loadAdminCatalog();
    await loadAdminBookings();
  }
}

async function handleLogout() {
  await adminClient.auth.signOut();
  clearSupabaseSessionStorage();
  redirectToLogin();
}

function redirectToLogin() {
  window.location.replace(adminLoginUrl.href);
}

async function loadAdminCatalog() {
  catalogList.innerHTML = '<p class="admin-empty">Carregando catálogo...</p>';

  const { data, error } = await adminClient
    .from("catalogo_trancas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    catalogList.innerHTML = '<p class="admin-empty">Não foi possível carregar. Confira as políticas RLS da tabela.</p>';
    return;
  }

  if (!data.length) {
    catalogList.innerHTML = '<p class="admin-empty">Nenhuma trança cadastrada ainda.</p>';
    return;
  }

  catalogList.innerHTML = data.map(createAdminCatalogItem).join("");
}

async function loadAdminBookings() {
  if (!bookingList) return;

  bookingList.innerHTML = '<p class="admin-empty">Carregando agendamentos...</p>';

  const { data, error } = await adminClient
    .from("agendamentos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    bookingList.innerHTML = '<p class="admin-empty">Não foi possível carregar agendamentos. Confira as políticas RLS.</p>';
    return;
  }

  if (!data.length) {
    bookingList.innerHTML = '<p class="admin-empty">Nenhum agendamento recebido ainda.</p>';
    return;
  }

  bookingList.innerHTML = data.map(createAdminBookingItem).join("");
}

function createAdminBookingItem(item) {
  const clientName = escapeHtml(item.nome_cliente);
  const phone = escapeHtml(item.telefone);
  const service = escapeHtml(item.servico);
  const date = escapeHtml(formatDate(item.data));
  const time = escapeHtml(item.horario?.slice(0, 5) || "");
  const notes = escapeHtml(item.observacoes || "Sem observações.");

  return `
    <article class="admin-booking-item">
      <div>
        <span class="admin-status">${date} às ${time}</span>
        <h3>${clientName}</h3>
        <p>${service}</p>
        <p>${phone}</p>
        <p>${notes}</p>
      </div>
    </article>
  `;
}

function createAdminCatalogItem(item) {
  const image = escapeHtml(item.imagem_url || "assets/imagens/box-braids.svg");
  const name = escapeHtml(item.nome);
  const description = escapeHtml(item.descricao || "Sem descrição cadastrada.");
  const price = escapeHtml(item.preco || "Sob consulta");
  const time = escapeHtml(item.tempo || "Tempo não informado");
  const category = escapeHtml(item.categoria || "Sem categoria");
  const statusClass = item.ativo ? "is-active" : "is-inactive";
  const statusText = item.ativo ? "Ativo" : "Desativado";

  return `
    <article class="admin-catalog-item ${statusClass}" data-item='${escapeHtml(JSON.stringify(item))}'>
      <img src="${image}" alt="${name}" />
      <div>
        <span class="admin-status">${statusText}</span>
        <h3>${name}</h3>
        <p>${description}</p>
        <dl><div><dt>Preço</dt><dd>${price}</dd></div><div><dt>Tempo</dt><dd>${time}</dd></div><div><dt>Categoria</dt><dd>${category}</dd></div></dl>
      </div>
      <div class="admin-item-actions">
        <button class="button button-secondary" type="button" data-action="edit">Editar</button>
        <button class="button button-secondary" type="button" data-action="toggle">${item.ativo ? "Desativar" : "Ativar"}</button>
        <button class="button button-primary" type="button" data-action="delete">Excluir</button>
      </div>
    </article>
  `;
}

async function handleSaveCatalogItem(event) {
  event.preventDefault();
  showAdminMessage(catalogMessage, "", "");

  if (!fields.nome.value.trim()) {
    showAdminMessage(catalogMessage, "Informe o nome da trança.", "error");
    return;
  }

  saveCatalogButton.disabled = true;
  saveCatalogButton.textContent = "Salvando...";

  try {
    const uploadedImageUrl = await uploadCatalogImage();
    const payload = {
      nome: fields.nome.value.trim(),
      descricao: fields.descricao.value.trim(),
      preco: fields.preco.value.trim(),
      tempo: fields.tempo.value.trim(),
      categoria: fields.categoria.value.trim(),
      imagem_url: uploadedImageUrl || fields.imagemUrl.value.trim(),
      ativo: fields.ativo.checked,
    };

    const itemId = fields.id.value;
    const response = itemId
      ? await adminClient.from("catalogo_trancas").update(payload).eq("id", itemId)
      : await adminClient.from("catalogo_trancas").insert([payload]);

    if (response.error) throw response.error;

    showAdminMessage(catalogMessage, "Trança salva com sucesso.", "success");
    resetCatalogForm();
    await loadAdminCatalog();
  } catch (error) {
    console.error("Erro ao salvar item:", error);
    showAdminMessage(catalogMessage, "Não foi possível salvar. Verifique tabela, Storage e políticas RLS.", "error");
  } finally {
    saveCatalogButton.disabled = false;
    saveCatalogButton.textContent = "Salvar trança";
  }
}

async function uploadCatalogImage() {
  const file = fields.imagemFile.files[0];
  if (!file) return "";

  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `trancas/${fileName}`;

  const { error } = await adminClient.storage.from("catalogo").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = adminClient.storage.from("catalogo").getPublicUrl(filePath);
  return data.publicUrl;
}

async function handleCatalogListAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const itemElement = button.closest(".admin-catalog-item");
  const item = JSON.parse(itemElement.dataset.item);
  const action = button.dataset.action;

  if (action === "edit") {
    fillCatalogForm(item);
    return;
  }

  if (action === "toggle") {
    const { error } = await adminClient.from("catalogo_trancas").update({ ativo: !item.ativo }).eq("id", item.id);
    if (error) {
      showAdminMessage(catalogMessage, "Não foi possível alterar o status.", "error");
      return;
    }
    await loadAdminCatalog();
  }

  if (action === "delete") {
    const shouldDelete = window.confirm(`Excluir "${item.nome}" do catálogo?`);
    if (!shouldDelete) return;

    const { error } = await adminClient.from("catalogo_trancas").delete().eq("id", item.id);
    if (error) {
      showAdminMessage(catalogMessage, "Não foi possível excluir o item.", "error");
      return;
    }

    resetCatalogForm();
    await loadAdminCatalog();
  }
}

function fillCatalogForm(item) {
  fields.id.value = item.id;
  fields.nome.value = item.nome || "";
  fields.descricao.value = item.descricao || "";
  fields.preco.value = item.preco || "";
  fields.tempo.value = item.tempo || "";
  fields.categoria.value = item.categoria || "";
  fields.imagemUrl.value = item.imagem_url || "";
  fields.imagemFile.value = "";
  fields.ativo.checked = Boolean(item.ativo);
  formTitle.textContent = "Editar trança";
  fields.nome.focus();
}

function resetCatalogForm() {
  catalogForm.reset();
  fields.id.value = "";
  fields.ativo.checked = true;
  formTitle.textContent = "Nova trança";
}

function showAdminMessage(element, message, type) {
  element.textContent = message;
  element.className = type ? `form-message ${type}` : "form-message";
}

function clearSupabaseSessionStorage() {
  [localStorage, sessionStorage].forEach((storage) => {
    Object.keys(storage)
      .filter((key) => key.startsWith("sb-") && key.includes("auth-token"))
      .forEach((key) => storage.removeItem(key));
  });
}

function formatDate(dateValue) {
  if (!dateValue) return "Data pendente";
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
