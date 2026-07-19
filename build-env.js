const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const entriesToCopy = ["index.html", "admin.html", "admin", "css", "js", "assets", "supabase.sql", "README.md"];
const localEnv = readDotEnv(path.join(root, ".env"));
const env = { ...localEnv, ...process.env };

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of entriesToCopy) {
  fs.cpSync(path.join(root, entry), path.join(dist, entry), { recursive: true });
}

const supabasePath = path.join(dist, "js", "supabase.js");
let supabaseConfig = fs.readFileSync(supabasePath, "utf8");

supabaseConfig = supabaseConfig
  .replace("__SUPABASE_URL__", env.SUPABASE_URL || "__SUPABASE_URL__")
  .replace("__SUPABASE_ANON_KEY__", env.SUPABASE_ANON_KEY || "__SUPABASE_ANON_KEY__")
  .replace("5511999999999", env.WHATSAPP_NUMBER || "5511999999999");

fs.writeFileSync(supabasePath, supabaseConfig);

console.log("Build finalizado em dist/.");

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return values;

      const separator = trimmed.indexOf("=");
      if (separator === -1) return values;

      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      values[key] = rawValue.replace(/^["']|["']$/g, "");
      return values;
    }, {});
}
