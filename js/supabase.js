const SUPABASE_URL = "__SUPABASE_URL__";
const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";
const WHATSAPP_NUMBER = "5511999999999";
const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Supabase ainda não foi configurado. Adicione SUPABASE_URL e SUPABASE_ANON_KEY para utilizar o painel administrativo.";

const hasSupabaseConfig =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("__") &&
  !SUPABASE_ANON_KEY.includes("__") &&
  SUPABASE_ANON_KEY.length > 30 &&
  Boolean(window.supabase);

const createClient = window.supabase?.createClient;

window.PixelBraidConfig = (() => {
  const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  return {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    whatsappNumber: WHATSAPP_NUMBER,
    supabaseClient: supabase,
    isSupabaseConfigured: Boolean(supabase),
    supabaseMessage: SUPABASE_NOT_CONFIGURED_MESSAGE,
  };
})();
