# Especificação de UX/UI — Confirmação de Presença de Casamento

Documento de referência para montagem no Figma. Cobre direção de marca, design system e a especificação completa de cada tela (Convidado + Admin), seguindo o briefing enviado.

---

## 1. Direção de marca

### 1.1 Paleta de cores

A âncora não é "azul bonito" — é a tinta de um convite gravado em relevo sobre papel de linho cru, à luz de vela. Isso evita o azul-corporativo genérico e mantém a obrigatoriedade do azul-marinho como identidade.

| Papel | Hex | Uso |
|---|---|---|
| `bg` (fundo) | `#FAF8F4` | Fundo geral — off-white quente, como papel de convite |
| `surface` | `#FFFFFF` | Cards, inputs, modais |
| `surface-alt` | `#F3EEE5` | Seções alternadas, fundo do painel admin |
| `navy` (primária) | `#16223E` | Botões primários, títulos de destaque, ícones ativos |
| `navy-600` (hover) | `#1F3159` | Estado hover/pressed dos elementos navy |
| `blue-gray` (secundária) | `#5B6B85` | Textos de apoio sobre navy, ícones secundários, bordas ativas |
| `champagne` (detalhe) | `#C9A876` | Divisores, ícones decorativos, bordas de destaque — nunca em texto corrido |
| `champagne-light` | `#EBE0CB` | Fundo de chips neutros, hover sutil |
| `text-primary` (ink) | `#1E2433` | Texto principal |
| `text-secondary` | `#6B7280` | Texto de apoio, timestamps, legendas |
| `success` | `#6F8F6B` | Estado confirmado |
| `success-bg` | `#EAF0E6` | Fundo de chip/alerta de sucesso |
| `error` | `#B5564A` | Estado de erro (terracota apagado, só semântico) |
| `error-bg` | `#F5E9E7` | Fundo de alerta de erro |
| `border` | `#E4DFD5` | Bordas de cards, inputs, divisores |

**Contraste:** `text-primary` sobre `bg` e branco sobre `navy` passam AA com folga (>7:1). `text-secondary` sobre `bg` fica em ~4.6:1, dentro do mínimo AA para texto normal. `champagne` é usado só como cor decorativa/borda, nunca como cor de texto — não teria contraste suficiente.

**Por que funciona para este briefing especificamente:** a combinação de off-white quente + navy profundo + champagne discreto + verde sálvia comunica "convite de casamento impresso", não serviria do mesmo jeito para uma fintech (pediria azul mais frio/saturado) nem para uma clínica (pediria tons mais clínicos). Evita os três clichês genéricos de IA (creme+terracota como cor principal, quase-preto+verde-ácido, estilo jornal com hairlines).

### 1.2 Tipografia

- **Display — Cormorant Garamond** (serifada clássica, traços finos, romântica sem ser piegas). Uso moderado: nomes dos noivos, títulos H1/H2, número de destaque nos cards do dashboard.
- **UI/Corpo — Jost** (geométrica-humanista, moderna e muito legível). Uso: corpo de texto, labels, botões, tabela, chips.

Ambas disponíveis no Google Fonts.

| Estilo | Fonte | Tamanho (desktop / mobile) | Peso | Observação |
|---|---|---|---|---|
| H1 Display | Cormorant Garamond | 44px / 32px | 500 | Nomes dos noivos |
| H2 Display | Cormorant Garamond | 28px / 24px | 500 | Títulos de tela |
| H3 UI | Jost | 18px | 600 | Títulos de seção, nome do convidado |
| Body | Jost | 16px | 400 | Texto corrido, line-height 1.5 |
| Body small | Jost | 14px | 400 | Texto secundário |
| Caption/label | Jost | 13px | 500, letter-spacing 0.02em | Labels de formulário, timestamps |
| Botão | Jost | 15px | 600 | — |

### 1.3 Fundamentos de forma

- **Grid base:** 4px; espaçamentos em múltiplos de 8 (8 / 12 / 16 / 24 / 32 / 48 / 64)
- **Border radius:** cards `20px`, botões/inputs `10px`, chips `999px` (pill), modais `24px`
- **Sombra:** uma só, suave — `0 4px 20px rgba(22,34,62,0.06)` em cards; `0 20px 60px rgba(22,34,62,0.18)` reservada só para modais, para destacá-los do fundo
- **Bordas:** `1px solid border` em cards e inputs — evita depender de sombra pesada para dar contorno

### 1.4 Elemento de assinatura

Um **selo circular fino** (linha ~1px), com as iniciais dos noivos unidas por "&", desenhado à mão (não um ícone de estoque). Aparece em **exatamente dois lugares**: no topo da tela inicial do convidado (acima do nome dos noivos) e na tela de sucesso da confirmação. Não aparece em nenhuma tela do admin — isso reforça o contraste intencional entre a área do convidado (acolhedora, afetiva) e a área admin (objetiva, prática), como pedido no briefing.

---

## 2. Componentes do design system

| Componente | Especificação |
|---|---|
| **Botão primário** | Fundo `navy`, texto branco, radius `10px`, altura 48px (toque confortável), hover `navy-600`, estado loading com spinner substituindo o texto |
| **Botão secundário** | Contorno `1px navy`, texto `navy`, fundo transparente |
| **Botão ghost/texto** | Sem fundo/contorno, texto `blue-gray`, usado em "Voltar" |
| **Input** | Label acima (caption), altura 48px, borda `1px border`, radius `10px`, foco com borda `navy` + leve halo `champagne` a 15% de opacidade |
| **Checkbox custom** | Quadrado 22px, radius 6px, borda `border`; selecionado = fundo `navy` + check branco desenhado com pequena animação de "traço" (150ms) |
| **Card** | Fundo `surface`, borda `1px border`, radius `20px`, padding 20–24px, sombra suave |
| **Chip de status** | Pill (`radius 999px`), padding 4px 12px, texto 13px peso 600. `Confirmado` = fundo `success-bg` texto `success`; `Não confirmado` = fundo `surface-alt` texto `text-secondary`; `Entregue` = fundo `champagne-light` texto `navy`; `Pendente` = fundo `surface-alt` texto `text-secondary` |
| **Modal** | Overlay `rgba(22,34,62,0.4)`, card centralizado radius `24px` (no mobile: bottom sheet ocupando a largura toda, cantos superiores arredondados), largura máx. 480px no desktop |
| **Tabela (admin)** | Desktop: linhas com divisores `1px border`, header em `text-secondary` caption. Mobile: cada linha vira um card empilhado (nome + chips em destaque, demais dados em lista de labels) |
| **Loading** | Spinner circular fino na cor `navy` (não usar o selo como spinner — ele é só assinatura, não deve virar elemento genérico) |
| **Empty state** | Ícone de linha simples + título curto + texto de apoio + ação, quando fizer sentido |
| **Estado de erro** | Ícone leve + mensagem amigável em `error` sobre `error-bg`, tom não técnico |
| **Estado de sucesso** | Ícone leve + mensagem em `success` sobre `success-bg` |

---

## 3. Arquitetura da informação

### Fluxo do Convidado
```
Landing (código do convite)
   → Confirmação (lista de convidados do grupo + seleção)
      → Modal "Confirmar presença?"
         → Sucesso (agradecimento + botão lista de presentes)
```
Rotas sugeridas: `/` (landing, aceita também `?codigo=ABC123` para link direto por convite) → `/confirmar` (lista + seleção, troca de conteúdo para o estado de sucesso ao final, sem navegar para outra rota).

### Fluxo do Admin
```
Acesso administrativo (senha única — ver nota¹)
   → Dashboard (indicadores + listagem + filtros)
      → Modal "Adicionar/editar convidado"
      → Fluxo "Importar convidados" (upload → preview → confirmação)
   → Grupos (visão resumida por grupo)
```
Rotas sugeridas: `/admin/acesso`, `/admin` (dashboard + listagem), `/admin/grupos`.

> ¹ **Nota de suposição:** o briefing não especifica autenticação do admin. Para um site temporário como este, sugiro uma tela mínima de acesso por senha única (sem cadastro de usuário) — simples o bastante para não pesar o projeto, mas evita que qualquer pessoa com o link edite os dados. Se preferir sem nenhuma barreira, é só remover essa tela.

Nav do admin: apenas 2 itens (Convidados / Grupos) — não precisa de mais que isso para o tamanho do projeto.

---

## 4. Telas — Área do Convidado

### 4.1 Landing — `/`
**Objetivo:** boas-vindas + entrada do código do convite.

**Conteúdo:**
- Selo (elemento de assinatura), centralizado, pequeno
- H1 Display: nome dos noivos (ex.: "Marina & Thiago")
- Body: "Olá! Que alegria ter você conosco."
- Body small: "Para confirmar sua presença, informe o código do seu convite."
- Input: label "Código do convite", placeholder "Ex: AB12CD"
- Botão primário: "Continuar"
- Rodapé discreto (opcional): data e local do casamento, em `text-secondary`

**Layout:** mobile-first, conteúdo centralizado verticalmente, largura máxima do card de conteúdo ~400px, bastante respiro (padding vertical generoso, 64px+ no topo).

**Estados:**
- Loading do botão ao validar o código (spinner substitui o texto, input desabilitado)
- Erro inline abaixo do input: "Não encontramos esse convite. Verifique o código informado e tente novamente." (chip/alerta `error`)
- Se vier de link direto (`?codigo=`), pular esta tela e ir direto para 4.2 com loading de carregamento do grupo

### 4.2 Confirmação — `/confirmar`
**Objetivo:** selecionar quem vai comparecer.

**Conteúdo:**
- H2 Display: "Confirme sua presença"
- Body: "Selecione as pessoas que estarão presentes no nosso casamento."
- Link/checkbox utilitário: "Selecionar todos"
- Lista de cards de convidado, um por pessoa do grupo:
  - Checkbox custom
  - Nome do convidado (H3 UI)
  - Chip de status atual: "Confirmado" (verde) ou "Ainda não confirmado" (neutro)
- Botão primário, fixo/sticky no rodapé em mobile: "Confirmar presença" (desabilitado se nada selecionado)

**Layout:** lista vertical de cards com espaçamento 12px entre eles; em mobile, botão final fica fixo na parte inferior da tela para não exigir rolar até o fim.

**Estados:**
- Loading inicial (skeleton dos cards) enquanto busca os convidados do grupo
- Grupo sem convidados: empty state — "Não encontramos convidados nesse convite. Fale com os noivos para verificar o código." + botão "Voltar"
- Erro ao carregar: "Não conseguimos carregar sua lista agora. Tente novamente em instantes." + botão "Tentar novamente"
- Todos já confirmados: estado informativo acima da lista — "Vimos que sua presença já está confirmada 💙" — lista continua visível (permite alterar), sem bloquear

### 4.3 Modal de confirmação (sobre a tela 4.2)
**Conteúdo:**
- H2 Display: "Confirmar presença?"
- Body: "Você deseja confirmar a presença das seguintes pessoas?"
- Lista simples com marcadores dos nomes selecionados
- Body: "Essas pessoas estarão presentes no nosso casamento?"
- Botão ghost: "Voltar" | Botão primário: "Confirmar presença"

**Estados:** loading no botão primário durante o salvamento; erro ao salvar — mensagem inline no próprio modal: "Não conseguimos salvar sua confirmação agora. Tente novamente." (o modal permanece aberto, não fecha sozinho em erro)

### 4.4 Sucesso (troca de conteúdo em `/confirmar` após confirmar)
**Conteúdo:**
- Selo (elemento de assinatura)
- H2 Display: "Presença confirmada 💙"
- Body: "Obrigado por confirmar sua presença. Estamos muito felizes em poder celebrar esse momento com você!"
- Botão secundário: "Lista de presentes" (link externo)
- Body small, `text-secondary`: "Nos vemos no grande dia!"

**Layout:** mesma estrutura centralizada da landing, para fechar o fluxo com a mesma sensação de acolhimento com que começou.

---

## 5. Telas — Área do Administrador

### 5.1 Acesso administrativo — `/admin/acesso` *(suposição, ver nota¹ acima)*
Tela simples: título curto, um input de senha, botão "Entrar". Sem elementos decorativos do lado do convidado — já entra no tom objetivo do admin.

### 5.2 Dashboard/Listagem — `/admin`
**Header:**
- Nome do sistema ("Painel — Casamento Marina & Thiago")
- H2 UI: "Convidados"
- Botões de ação no canto: "Importar convidados" (secundário) e "Adicionar convidado" (primário)

**Cards de indicadores** (linha de 4–5 cards, viram carrossel horizontal ou empilham 2x2 em mobile):
- Total de convidados — número em Display
- Confirmados
- Pendentes
- Convites entregues
- Grupos

Cada card: label caption em cima, número grande em Cormorant Garamond embaixo, fundo `surface`, sem gráfico — só o número, como pedido no briefing ("não exagerar nos gráficos").

**Barra de filtros** (abaixo dos cards, acima da tabela):
- Busca por nome (input com ícone de lupa)
- Filtro por grupo (select)
- Filtro por convite entregue (select: Todos/Sim/Não)
- Filtro por confirmação (select: Todos/Confirmado/Pendente)
- Ordenação (select: Nome, Grupo, Último acesso, Status de confirmação)

Em mobile, filtros colapsam num botão "Filtrar" que abre um bottom sheet.

**Tabela/listagem:**
Colunas: ID · Nome · Observação · Grupo · Convite entregue? (chip) · Confirmou presença? (chip) · Último acesso · Ações (editar/excluir, ícones)

Em mobile, cada linha vira um card: nome em destaque no topo, os dois chips logo abaixo lado a lado, e os demais dados (observação, grupo, último acesso) em uma lista de pares label/valor discretos, com o menu de ações (⋯) no canto.

**Estados:**
- Loading: skeleton nas linhas/cards
- Lista vazia (nenhum convidado cadastrado ainda): empty state central com ícone leve + "Nenhum convidado cadastrado ainda." + botões "Importar convidados" e "Adicionar convidado"
- Filtro sem resultado: "Nenhum convidado encontrado com esses filtros." + botão "Limpar filtros"

### 5.3 Modal "Adicionar/editar convidado"
Campos: Nome (obrigatório), Observação (opcional), Grupo (select ou campo livre com sugestão dos grupos existentes), Convite entregue? (toggle Sim/Não), Confirmou presença? (toggle Sim/Não — só habilitado/visível no modo edição, já que no cadastro normalmente começa como pendente).

Rodapé do modal: botão ghost "Cancelar" | botão primário "Salvar convidado" (texto muda para "Adicionar convidado" ou "Salvar alterações" conforme o modo).

### 5.4 Fluxo "Importar convidados" (modal multi-etapa)

**Etapa 1 — Upload:** área de drop/seleção de arquivo (aceita .csv/.xlsx), texto de apoio explicando o formato esperado das colunas (ID, Nome, Observação, Grupo, Convite entregue?, Confirmou presença?), com um link "Baixar modelo de planilha".

**Etapa 2 — Pré-visualização e validação:** após ler o arquivo, mostrar:
- Resumo em destaque: "42 convidados encontrados" / "40 registros válidos" (chip verde) / "2 registros precisam de atenção" (chip terracota)
- Tabela de preview com as mesmas colunas da planilha; linhas com problema ficam com fundo `error-bg` sutil e um ícone indicando o motivo (ex.: "Grupo não identificado", "Nome em branco") ao passar o cursor/tocar
- Usuário pode remover linhas problemáticas da importação antes de confirmar

**Etapa 3 — Confirmação:** resumo final ("Você está prestes a importar 40 convidados") + botão primário "Importar convidados" (loading durante o processamento) | botão ghost "Cancelar"

**Etapa 4 — Resultado:** estado de sucesso — "40 convidados importados com sucesso." — botão "Concluir" fecha o modal e atualiza a listagem. Em caso de erro geral na importação, estado de erro amigável com opção de tentar novamente.

### 5.5 Grupos — `/admin/grupos`
Grid de cards, um por grupo (2 colunas no desktop, 1 no mobile):
- Título: "Grupo 1" (ou nome customizado, se houver)
- Contagem: "3 convidados"
- Dois números lado a lado: confirmados / pendentes (com as mesmas cores semânticas do resto do sistema)
- "Último acesso: hoje às 18:42"
- Ação: "Ver convidados" → aplica o filtro de grupo na listagem principal (5.2)

---

## 6. Estrutura sugerida do arquivo no Figma

Ao montar no Figma, organizar em 3 páginas:

1. **🎨 Design System** — estilos de cor e texto, componentes-base (botão, input, checkbox, chip, card, modal) como componentes reutilizáveis com variantes
2. **📱 Convidado** — frames 4.1 a 4.4 nesta ordem, em fluxo horizontal, com os estados de erro como frames adicionais ao lado da tela correspondente
3. **💻 Admin** — frames 5.1 a 5.5, com os modais (5.3, 5.4) como frames separados ancorados perto da tela 5.2

Nomear os frames com o padrão `[Área]/[Nº] Nome da tela` (ex.: `Convidado/02 Confirmação`, `Admin/04 Importar — Etapa 2`) para navegação rápida no Figma.

---

Pronto para colar/recriar no Figma. Qualquer ajuste de tom, paleta ou prioridade de telas, é só sinalizar antes de eu seguir para a prototipagem quando a conexão estiver disponível.