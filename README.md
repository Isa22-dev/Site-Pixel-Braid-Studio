# Pixel Braid Studio

Site estático em HTML, CSS e JavaScript puro para um salão de tranças com estética geek, gamer, pixel art, kawaii e cultura pop. O projeto inclui catálogo, galeria com lightbox, modal de ajuda com mascote, depoimentos, formulário de agendamento, integração Supabase e redirecionamento para WhatsApp.

## Estrutura

```text
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── supabase.js
├── assets/
│   ├── imagens/
│   ├── mascote/
│   └── icones/
├── supabase.sql
├── build-env.js
├── package.json
└── vercel.json
```

## Supabase

1. Acesse <https://supabase.com> e crie um projeto.
2. Abra `SQL Editor`.
3. Cole o conteúdo de `supabase.sql`.
4. Clique em `Run`.

O SQL cria a tabela `public.agendamentos` com:

```sql
id
nome_cliente
telefone
servico
data
horario
observacoes
created_at
```

Ele também ativa RLS e recria a política de insert para a chave pública `anon`.

## Chaves

No Supabase, vá em `Project Settings > API` e copie:

- `Project URL`
- `anon public`

Para teste local sem build, edite `js/supabase.js`:

```js
const SUPABASE_URL = "COLE_AQUI_A_URL_DO_SUPABASE";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_CHAVE_ANON_PUBLIC";
const WHATSAPP_NUMBER = "5511999999999";
```

Use o WhatsApp no formato internacional, apenas números. Nunca use a `service_role key` no front-end.

## Variáveis na Vercel

Configure em `Project Settings > Environment Variables`:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
WHATSAPP_NUMBER
```

O build command `npm run build` roda `build-env.js`, copia o site para `dist/` e injeta as variáveis em `dist/js/supabase.js`.

## Testar localmente

Abra o projeto com servidor local:

```bash
python -m http.server 3000
```

Acesse:

```text
http://localhost:3000
```

Com Node instalado, você também pode testar igual à Vercel:

```bash
$env:SUPABASE_URL="https://xxxxxxxx.supabase.co"
$env:SUPABASE_ANON_KEY="sua-chave-anon-public"
$env:WHATSAPP_NUMBER="5511999999999"
npm run build
python -m http.server 3000 -d dist
```

## Como testar o agendamento

1. Preencha nome, telefone, serviço, data e horário.
2. Envie o formulário.
3. O site deve validar os campos, salvar no Supabase e abrir o WhatsApp.
4. No Supabase, abra `Table Editor > agendamentos`.
5. Confira se apareceu uma nova linha.

Consulta opcional:

```sql
select *
from public.agendamentos
order by created_at desc;
```

## GitHub

O repositório já está configurado para:

```text
https://github.com/Isa22-dev/Site_Pixel_Braid_Studio.git
```

Para enviar novas alterações:

```bash
git add .
git commit -m "Improve Pixel Braid Studio interface"
git push
```

## Vercel

1. Acesse <https://vercel.com>.
2. Importe o repositório do GitHub.
3. Framework: `Other`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `WHATSAPP_NUMBER`.
7. Clique em `Deploy`.

## Mascote

O arquivo atual fica em `assets/mascote/mascote.png` e tem fundo transparente. Para trocar a mascote, substitua esse arquivo mantendo o mesmo nome ou atualize os caminhos no `index.html`.
