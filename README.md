# Pixel Braid Studio

Site estático em HTML, CSS e JavaScript puro para um salão de tranças com estética geek, gamer, pixel art, kawaii e cultura pop. O projeto inclui catálogo, galeria com lightbox, modal de ajuda com mascote, formulário de agendamento, integração Supabase e redirecionamento para WhatsApp.

## Estrutura

```text
/
├── index.html
├── admin.html
├── admin/
│   └── login.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── admin.js
│   ├── agendamento.js
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
- `public.admin_users`, uma allowlist de e-mails administradores.
- Bucket público `catalogo` no Supabase Storage.
- Políticas RLS para clientes visualizarem somente tranças ativas.
- Políticas RLS para somente administradores autorizados criarem, editarem e excluírem itens.
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
/admin/login.html
```

Para criar o usuário administrador:

1. No Supabase, abra `Authentication > Users`.
2. Clique em `Add user`.
3. Crie o usuário `admin@pixelbraidstudio.com` e defina a senha inicial no próprio Supabase.
4. Confirme que o e-mail também existe em `Table Editor > admin_users`.
5. Use esse login em `/admin/login.html`.

O painel protegido fica em `/admin.html`. Se não houver sessão ativa do Supabase Auth, o usuário é redirecionado automaticamente para `/admin/login.html`.

Para adicionar novos administradores futuramente, crie o usuário em `Authentication > Users` e adicione o e-mail em `admin_users`, sem alterar o código do site.

No painel você pode:

- Cadastrar nova trança.
- Editar nome, descrição, preço, tempo médio, categoria e imagem.
- Enviar imagem para o bucket `catalogo`.
- Usar uma imagem por URL.
- Ativar/desativar item do catálogo público.
- Excluir item.
- Visualizar agendamentos recebidos.

Clientes não acessam o painel sem login. A página pública busca somente registros com `ativo = true`, e o link do painel não é exibido no site público.

## Chaves

No Supabase, vá em `Project Settings > API` e copie:

- `Project URL`
- `anon public`

Crie um arquivo `.env` local a partir de `.env.example`:

```text
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-public
WHATSAPP_NUMBER=5511999999999
```

Use o WhatsApp no formato internacional, apenas números. Nunca use a `service_role key` no front-end. O arquivo `.env` fica fora do Git.

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
http://localhost:3000/admin/login.html
```

Para testar com Supabase localmente, rode o build e sirva a pasta `dist`:

```bash
npm run build
python -m http.server 3000 -d dist
```

Sem variáveis configuradas, o site público continua funcionando com fallback do catálogo. O painel exibe: `Supabase ainda não foi configurado. Adicione SUPABASE_URL e SUPABASE_ANON_KEY para utilizar o painel administrativo.`

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
4. Abra `/admin/login.html` e faça login.
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
