# Pixel Braid Studio

Site estático em HTML, CSS e JavaScript puro para um salão de tranças com estética geek, pixel, kawaii e gamer. O formulário de agendamento salva os dados no Supabase e depois redireciona a cliente para o WhatsApp com a mensagem preenchida.

## Arquivos do projeto

- `index.html`: estrutura da página, catálogo, seção de motivos, mascote de ajuda e formulário.
- `style.css`: visual responsivo com as cores do Pixel Braid Studio.
- `script.js`: validação do formulário, conexão com Supabase e redirecionamento para WhatsApp.
- `supabase.sql`: comando SQL para criar a tabela `agendamentos` e liberar inserts públicos com RLS.
- `build-env.js`: gera a pasta `dist` e injeta variáveis de ambiente da Vercel no `script.js`.
- `vercel.json`: configura o deploy da Vercel para publicar a pasta `dist`.

## 1. Configurar o Supabase

1. Acesse <https://supabase.com> e crie um projeto.
2. No painel do projeto, abra `SQL Editor`.
3. Crie uma nova query.
4. Cole todo o conteúdo do arquivo `supabase.sql`.
5. Clique em `Run`.

O SQL cria a tabela:

```sql
public.agendamentos (
  id,
  nome_cliente,
  telefone,
  servico,
  data,
  horario,
  observacoes,
  created_at
)
```

Ele também ativa RLS e recria uma política que permite apenas inserir novos agendamentos usando a chave pública `anon`.

## 2. Pegar as chaves do Supabase

1. No Supabase, abra `Project Settings`.
2. Entre em `API`.
3. Copie a `Project URL`.
4. Copie a chave `anon public`.

Para testar rapidamente sem build, você pode abrir `script.js` e trocar:

```js
const SUPABASE_URL = "COLE_AQUI_A_URL_DO_SUPABASE";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_CHAVE_ANON_PUBLIC";
const WHATSAPP_NUMBER = "5511999999999";
```

Use seu número do WhatsApp no formato internacional, apenas números. Exemplo para Brasil:

```js
const WHATSAPP_NUMBER = "5511999999999";
```

Importante: a chave `anon public` é feita para uso no navegador, mas a segurança depende das políticas RLS no Supabase. Nunca coloque a `service_role key` no front-end.

## 3. Usar variáveis de ambiente na Vercel

O projeto já tem um build simples para usar variáveis de ambiente sem salvar as chaves no GitHub.

Na Vercel, crie estas variáveis em `Project Settings > Environment Variables`:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
WHATSAPP_NUMBER
```

Exemplo:

```text
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-public
WHATSAPP_NUMBER=5511999999999
```

Durante o deploy, o arquivo `build-env.js` cria a pasta `dist` e troca os valores no `script.js` publicado.

## 4. Testar localmente

Você pode abrir o arquivo `index.html` no navegador. Se preferir testar com um servidor local:

```bash
python -m http.server 3000
```

Depois acesse:

```text
http://localhost:3000
```

Se você tiver Node instalado e quiser testar o mesmo fluxo da Vercel:

```bash
$env:SUPABASE_URL="https://xxxxxxxx.supabase.co"
$env:SUPABASE_ANON_KEY="sua-chave-anon-public"
$env:WHATSAPP_NUMBER="5511999999999"
npm run build
python -m http.server 3000 -d dist
```

Teste o formulário preenchendo:

- Nome completo
- WhatsApp
- Serviço
- Data
- Horário

Ao enviar, o site deve:

1. validar os campos obrigatórios;
2. salvar em `public.agendamentos`;
3. mostrar mensagem de sucesso;
4. abrir o WhatsApp com a mensagem automática.

## 5. Conferir se salvou no Supabase

1. Abra o painel do Supabase.
2. Entre em `Table Editor`.
3. Selecione a tabela `agendamentos`.
4. Confira se apareceu uma nova linha com os dados enviados pelo formulário.

Também é possível conferir pelo `SQL Editor`:

```sql
select *
from public.agendamentos
order by created_at desc;
```

## 6. Subir para o GitHub

No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Create Pixel Braid Studio site"
```

Crie um repositório vazio no GitHub e conecte:

```bash
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/pixel-braid-studio.git
git push -u origin main
```

## 7. Deploy na Vercel

1. Acesse <https://vercel.com>.
2. Clique em `Add New Project`.
3. Importe o repositório do GitHub.
4. Como é um site estático, deixe o framework como `Other`.
5. Confira se o build command está como `npm run build`.
6. Confira se o output directory está como `dist`.
7. Configure as variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `WHATSAPP_NUMBER`.
8. Clique em `Deploy`.

## 8. Checklist final

- A tabela `agendamentos` existe no Supabase.
- A política RLS de insert para `anon` foi criada.
- `SUPABASE_URL` foi trocada no `script.js`.
- `SUPABASE_ANON_KEY` foi trocada no `script.js`.
- `WHATSAPP_NUMBER` foi trocado no `script.js`.
- Um agendamento de teste aparece no `Table Editor`.
- O WhatsApp abre com os dados preenchidos.
