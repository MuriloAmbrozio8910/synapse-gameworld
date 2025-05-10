// Variáveis globais
let jogosFiltrados = [];
let paginaAtual = 1;
const jogosPorPagina = 8;
let todosJogos = [];
const cacheDetalhesJogo = {};
let chartPreco = null;
let chartJogadores = null;
let chartAvaliacao = null;

// Debounce para filtro de nome
let debounceTimer;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarJogosGratis();

  // Filtro de nome com debounce
  document.getElementById('filtro-nome').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(aplicarFiltros, 250);
  });

  // Filtro de ordenação
  document.getElementById('filtro-ordenacao').addEventListener('change', aplicarFiltros);
});

// Função para aplicar filtros e ordenação
function aplicarFiltros() {
  const nome = document.getElementById('filtro-nome').value.toLowerCase();
  const ordenacao = document.getElementById('filtro-ordenacao').value;

  jogosFiltrados = todosJogos.filter(jogo =>
    jogo.title.toLowerCase().includes(nome)
  );

  switch (ordenacao) {
    case 'preco-menor':
      jogosFiltrados.sort((a, b) => a.deal.price.amount - b.deal.price.amount);
      break;
    case 'preco-maior':
      jogosFiltrados.sort((a, b) => b.deal.price.amount - a.deal.price.amount);
      break;
    case 'populares':
      jogosFiltrados.sort((a, b) => b.deal.rating - a.deal.rating);
      break;
    case 'novos':
      jogosFiltrados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      break;
    case 'gratuitos':
      jogosFiltrados = jogosFiltrados.filter(jogo => jogo.deal.price.amount === 0);
      break;
  }

  paginaAtual = 1;
  renderizarPagina(paginaAtual);
  criarControlesPaginacao();
}

// Carrega jogos da API
async function carregarJogosGratis() {
  try {
    const resposta = await fetch('https://api.isthereanydeal.com/deals/v2?key=bc111ff70ce3ebaf6447395372d4f06d401d151f&region=br&country=BR&limit=200&sort=-trending');
    const dados = await resposta.json();

    todosJogos = dados.list || [];
    jogosFiltrados = [...todosJogos];
    renderizarPagina(1);
    criarControlesPaginacao();
  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
  }
}

// Renderiza a página de jogos
function renderizarPagina(pagina) {
  const container = document.getElementById('lista-jogos-com-desconto');
  container.innerHTML = '';

  const inicio = (pagina - 1) * jogosPorPagina;
  const fim = inicio + jogosPorPagina;
  const jogos = jogosFiltrados.slice(inicio, fim);

  // Usa DocumentFragment para performance
  const fragment = document.createDocumentFragment();

  jogos.forEach(jogo => {
    const card = document.createElement('div');
    card.className = 'card';

    const id = jogo.id;
    const titulo = jogo.title;
    const imagem = jogo.assets.banner300 || jogo.assets.banner145;
    const precoAntigo = jogo.deal.regular.amount;
    const precoNovo = jogo.deal.price.amount;
    const precoMaisBaixo = jogo.deal.historyLow.amount;
    const desconto = jogo.deal.cut;
    const plataforma = jogo.deal.shop.name || 'Outros';
    const tagHTML = `<span class="tag plataforma-${plataforma.toLowerCase()}">${plataforma}</span>`;
    const tagDesconto = `<span class="tag desconto">${desconto}% OFF</span>`;

    card.innerHTML = `
      <img src="${imagem}" alt="${titulo}" loading="lazy" />
      ${tagHTML}
      ${tagDesconto}
      <div>
        <h3>${titulo}</h3>
        <div class="popup-pricing">
        <p class="preco-antigo">R$ ${precoAntigo}</p> <p class="preco-novo">R$ ${precoNovo}</p>
        </div>
        <button class="btn ver-oferta">Ver Oferta</button>
      </div>
    `;

    card.querySelector('.ver-oferta').addEventListener('click', () => abrirPopup(jogo));
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

// Abre o popup do jogo
function abrirPopup(jogo) {
  // Preenche imagem
  document.getElementById('popup-img').src = jogo.assets.banner300 || jogo.assets.banner145;
  document.getElementById('popup-img').alt = jogo.title;

  // Preenche tags
  const plataforma = jogo.deal.shop.name || 'Outros';
  const desconto = jogo.deal.cut;
  // Ícone de plataforma (exemplo para Steam)
  document.getElementById('loja').innerHTML = `
    <span class="tag plataforma-${plataforma.toLowerCase()}">
      ${plataforma}
    </span>
  `;
  document.getElementById('desconto').innerHTML = `<span class="tag desconto">-${desconto}% OFF</span>`;

  // Preenche título
  document.getElementById('Titulo').textContent = jogo.title;

  // Preenche preços
  document.getElementById('precoAntigo').textContent = `De: R$ ${jogo.deal.regular.amount}`;
  document.getElementById('precoNovo').textContent = `Por: R$ ${jogo.deal.price.amount}`;



  // Limpa campos de detalhes para evitar dados antigos
  document.getElementById('desenvolvedores').textContent = '';
  document.getElementById('generos').textContent = '';
  document.getElementById('descricao').textContent = '';
  // Link da oferta
  document.getElementById('linkOferta').href = jogo.deal.url;

  document.getElementById("overlay").classList.add("show");
  document.getElementById("popup").classList.add("show");

  // Busca detalhes extras
  consultarJogo(jogo.id);

  // Renderiza gráfico de preço
  setTimeout(() => {
    document.getElementById('grafico-precos').style.display = 'block';
    renderizarGraficoPreco(jogo.deal.regular.amount, jogo.deal.price.amount, jogo.deal.historyLow.amount, );
  }, 300); // simula carregamento
  // Adicione evento de fechar
  document.querySelector('.fechar-popup').onclick = fecharPopup;
}

// Fecha o popup
function fecharPopup() {
  document.getElementById('popup').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}

// Cria controles de paginação
function criarControlesPaginacao() {
  const container = document.getElementById('paginacao');
  container.innerHTML = '';

  const totalPaginas = Math.ceil(jogosFiltrados.length / jogosPorPagina);

  const adicionarBotao = (pagina, texto = null, isAtivo = false) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = texto || pagina;
    if (isAtivo) btn.classList.add('ativo');
    btn.onclick = () => {
      paginaAtual = pagina;
      renderizarPagina(pagina);
      criarControlesPaginacao();
    };
    container.appendChild(btn);
  };

  if (paginaAtual > 1) adicionarBotao(paginaAtual - 1, 'Anterior');

  adicionarBotao(1, '1', paginaAtual === 1);

  if (paginaAtual > 3) {
    const pontos = document.createElement('span');
    pontos.textContent = '...';
    container.appendChild(pontos);
  }

  for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
    if (i > 1 && i < totalPaginas) {
      adicionarBotao(i, i, paginaAtual === i);
    }
  }

  if (paginaAtual < totalPaginas - 2) {
    const pontos = document.createElement('span');
    pontos.textContent = '...';
    container.appendChild(pontos);
  }

  if (totalPaginas > 1) adicionarBotao(totalPaginas, totalPaginas, paginaAtual === totalPaginas);

  if (paginaAtual < totalPaginas) adicionarBotao(paginaAtual + 1, 'Próximo');
}

// Consulta detalhes do jogo (com cache)
async function consultarJogo(id, popup) {
  if (cacheDetalhesJogo[id]) {
    renderizarDetalhesJogo(cacheDetalhesJogo[id], popup);
    return;
  }
  try {
    const resposta = await fetch(`https://api.isthereanydeal.com/games/info/v2?key=bc111ff70ce3ebaf6447395372d4f06d401d151f&id=${id}`);
    const data = await resposta.json();
    cacheDetalhesJogo[id] = data;
    renderizarDetalhesJogo(data, popup);
  } catch (error) {
    console.error('Erro ao buscar detalhes do jogo:', error);
  }
}

// Renderiza detalhes extras no popup
function renderizarDetalhesJogo(data) {
  document.getElementById('desenvolvedores').textContent = data.developers?.[0]?.name || 'Desenvolvedora desconhecida';
  document.getElementById('generos').textContent = data.tags ? data.tags.join(', ') : 'Gêneros não informados';
  document.getElementById('descricao').textContent = data.description || 'Descrição indisponível.';

  // Gráficos de jogadores e avaliação
  setTimeout(() => {
    document.getElementById('grafico-jogadores').style.display = 'block';
    renderizarGraficoJogadores(
      data.players?.recent || 0,
      data.players?.day || 0,
      data.players?.week || 0,
      data.players?.peak || 0
    );
    document.getElementById('grafico-avaliacao').style.display = 'block';
    renderizarGraficoAvaliação(
      data.reviews?.[0]?.score || 0,
      data.reviews?.[0]?.count || 0,
      data.reviews?.[1]?.score || 0,
      data.reviews?.[1]?.count || 0,
      data.reviews?.[2]?.score || 0,
      data.reviews?.[2]?.count || 0
    );
  }, 300); // simula carregamento
}