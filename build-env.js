const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const entriesToCopy = ["index.html", "css", "js", "assets", "supabase.sql", "README.md"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of entriesToCopy) {
  fs.cpSync(path.join(root, entry), path.join(dist, entry), { recursive: true });
}

const supabasePath = path.join(dist, "js", "supabase.js");
let supabaseConfig = fs.readFileSync(supabasePath, "utf8");

supabaseConfig = supabaseConfig
  .replace("COLE_AQUI_A_URL_DO_SUPABASE", process.env.SUPABASE_URL || "COLE_AQUI_A_URL_DO_SUPABASE")
  .replace(
    "COLE_AQUI_A_CHAVE_ANON_PUBLIC",
    process.env.SUPABASE_ANON_KEY || "COLE_AQUI_A_CHAVE_ANON_PUBLIC",
  )
  .replace("5511999999999", process.env.WHATSAPP_NUMBER || "5511999999999");

fs.writeFileSync(supabasePath, supabaseConfig);

console.log("Build finalizado em dist/.");
