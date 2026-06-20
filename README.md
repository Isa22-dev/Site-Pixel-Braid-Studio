# Pixel Braid Studio

Site estático em HTML, CSS e JavaScript puro para um salão de tranças com estética geek, gamer, pixel art, kawaii e cultura pop. O projeto inclui catálogo, galeria com lightbox, modal de ajuda com mascote, formulário de agendamento, integração Supabase e redirecionamento para WhatsApp.

## Estrutura

```text
/
├── index.html
├── admin.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── admin.js
│   ├── catalogo.js
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

O mesmo SQL também cria:

- `public.catalogo_trancas`, usada pelo catálogo editável.
- Bucket público `catalogo` no Supabase Storage.
- Políticas RLS para clientes visualizarem somente tranças ativas.
- Políticas RLS para usuários autenticados criarem, editarem e excluírem itens.
- Seis itens iniciais do catálogo: Box Braids Longas, Knotless Braids, Goddess Braids, Nagô, Twists e Fulani Braids.

Campos da tabela `catalogo_trancas`:

```sql
id
nome
descricao
preco
tempo
imagem_url
categoria
ativo
created_at
```

## Admin

O painel fica em:

```text
/admin.html
```

Para criar o usuário administrador:

1. No Supabase, abra `Authentication > Users`.
2. Clique em `Add user`.
3. Informe e-mail e senha.
4. Use esse login em `admin.html`.

No painel você pode:

- Cadastrar nova trança.
- Editar nome, descrição, preço, tempo médio, categoria e imagem.
- Enviar imagem para o bucket `catalogo`.
- Usar uma imagem por URL.
- Ativar/desativar item do catálogo público.
- Excluir item.

Clientes não acessam o painel sem login. A página pública busca somente registros com `ativo = true`.

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

Admin local:

```text
http://localhost:3000/admin.html
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

## Como testar o catálogo editável

1. Rode o SQL de `supabase.sql` no Supabase.
2. Crie um usuário em `Authentication > Users`.
3. Configure `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
4. Abra `/admin.html` e faça login.
5. Cadastre ou edite uma trança.
6. Abra `/index.html`.
7. Confira se o card aparece com o mesmo layout estilo Instagram.
8. Clique em `Agendar este estilo`.
9. Confira se o campo `Serviço` foi preenchido automaticamente.

Para conferir no banco:

```sql
select nome, preco, tempo, ativo, imagem_url
from public.catalogo_trancas
order by created_at desc;
```

## GitHub

O repositório já está configurado para:

```text
https://github.com/Isa22-dev/Site-Pixel-Braid-Studio.git
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
