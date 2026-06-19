const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const filesToCopy = ["index.html", "style.css", "script.js", "supabase.sql", "README.md"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of filesToCopy) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

const scriptPath = path.join(dist, "script.js");
let script = fs.readFileSync(scriptPath, "utf8");

script = script
  .replace("COLE_AQUI_A_URL_DO_SUPABASE", process.env.SUPABASE_URL || "COLE_AQUI_A_URL_DO_SUPABASE")
  .replace(
    "COLE_AQUI_A_CHAVE_ANON_PUBLIC",
    process.env.SUPABASE_ANON_KEY || "COLE_AQUI_A_CHAVE_ANON_PUBLIC",
  )
  .replace("5511999999999", process.env.WHATSAPP_NUMBER || "5511999999999");

fs.writeFileSync(scriptPath, script);

console.log("Build finalizado em dist/.");
