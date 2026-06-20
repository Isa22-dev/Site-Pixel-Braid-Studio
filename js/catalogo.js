const catalogGrid = document.querySelector("#catalogGrid");
const catalogFallbackCards = catalogGrid ? catalogGrid.innerHTML : "";

const catalogIcons = `
  <span><svg viewBox="0 0 24 24"><path d="M20.8 5.8c-1.7-2-4.7-1.8-6.3.2L12 9l-2.5-3C7.9 4 4.9 3.8 3.2 5.8c-1.8 2.1-1.4 5.2.7 7.1l8.1 7.1 8.1-7.1c2.1-1.9 2.5-5 .7-7.1Z"/></svg></span>
  <span><svg viewBox="0 0 24 24"><path d="M4 12l16-8-5 16-3-7-8-1Z"/><path d="M12 13l8-9"/></svg></span>
  <span><svg viewBox="0 0 24 24"><path d="M6 4h12v16l-6-4-6 4V4Z"/></svg></span>
`;

if (catalogGrid) {
  loadPublicCatalog();
}

async function loadPublicCatalog() {
  const client = window.PixelBraidConfig?.supabaseClient;
  if (!client) return;

  try {
    const { data, error } = await client
      .from("catalogo_trancas")
      .select("nome, descricao, preco, tempo, imagem_url, categoria")
      .eq("ativo", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data?.length) return;

    renderCatalog(data);
    syncBookingServices(data);
  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);
    catalogGrid.innerHTML = catalogFallbackCards;
  }
}

function renderCatalog(items) {
  catalogGrid.innerHTML = items.map(createCatalogCard).join("");

  catalogGrid.querySelectorAll(".reveal-card").forEach((card) => {
    if (window.PixelBraidReveal) {
      window.PixelBraidReveal.observe(card);
    } else {
      card.classList.add("is-visible");
    }
  });
}

function createCatalogCard(item) {
  const name = escapeHtml(item.nome || "Trança personalizada");
  const description = escapeHtml(item.descricao || "Modelo personalizado com acabamento Pixel Braid Studio.");
  const price = escapeHtml(item.preco || "Sob consulta");
  const time = escapeHtml(item.tempo || "Sob consulta");
  const imageUrl = escapeHtml(item.imagem_url || "assets/imagens/box-braids.svg");

  return `
    <article class="catalog-card insta-card reveal-card">
      <header class="post-header"><span class="post-avatar">P</span><span><strong>Pixel Braid Studio</strong><small>@pixelbraidstudio</small></span></header>
      <figure class="post-media"><img src="${imageUrl}" alt="${name}" loading="lazy" /></figure>
      <div class="post-actions" aria-hidden="true">${catalogIcons}</div>
      <div class="post-content">
        <h3>${name}</h3>
        <p>${description}</p>
        <dl><div><dt>A partir de</dt><dd>${price}</dd></div><div><dt>Tempo médio</dt><dd>${time}</dd></div></dl>
        <button class="button button-card service-select" type="button" data-service="${name}">Agendar este estilo</button>
      </div>
    </article>
  `;
}

function syncBookingServices(items) {
  const select = document.querySelector("#servico");
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">Selecione uma trança</option>';

  items.forEach((item) => {
    if (item.nome) select.append(new Option(item.nome, item.nome));
  });

  select.value = currentValue;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
