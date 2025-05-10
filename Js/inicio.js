async function cotarDolar() {
  try {
    const resposta = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
    const dados = await resposta.json();

    const valorAtual = parseFloat(dados.USDBRL.bid);
    const valorMaior = parseFloat(dados.USDBRL.high);
    const valorMenor = parseFloat(dados.USDBRL.low);
    const valorChance = parseFloat(dados.USDBRL.ask);

    const formatar = valor => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const container = document.getElementById('cotarDolar');
    container.innerHTML = `
      <strong>Cotação Atual:</strong> ${formatar(valorAtual)}<br>
      <strong>Maior do Dia:</strong> ${formatar(valorMaior)}<br>
      <strong>Menor do Dia:</strong> ${formatar(valorMenor)}<br>
      <strong>Valor de Venda:</strong> ${formatar(valorChance)}
    `;
  } catch (error) {
    document.getElementById('cotarDolar').innerText = 'Erro ao buscar cotação do dólar.';
    console.error('Erro ao buscar cotação:', error);
  }
}

async function carregarJogoDoMes() {
  try {
    const resposta = await fetch('https://api.isthereanydeal.com/deals/v2?key=bc111ff70ce3ebaf6447395372d4f06d401d151f&region=br&country=BR&limit=1&sort=rank');
    const dados = await resposta.json();

    const jogo = dados.list[0]; // <- Aqui está o acesso correto!

    if (!jogo || !jogo.deal) {
      console.error('Jogo inválido ou sem deal:', jogo);
      return;
    }

    const titulo = jogo.title;
    const imagem = jogo.assets.banner300 || jogo.assets.banner145;
    const precoAtual = jogo.deal.price.amount;
    const precoAntigo = jogo.deal.regular.amount;
    const precoMaisBaixo = jogo.deal.historyLow.amount;
    const precoMaisBaixo3M = jogo.deal.historyLow_3m.amount;
    const precoMaisBaixo1Y = jogo.deal.historyLow_1y.amount;
    const desconto = jogo.deal.cut;
    const link = jogo.deal.url;
    const plataforma = jogo.deal.shop.name || 'Outros';
    const tagHTML = `<span class="tag plataforma-${plataforma.toLowerCase()}">${plataforma}</span>`;
    const tagDesconto = `<span class="tag desconto">${desconto}% OFF</span>`;

    // Exibe no contêiner
    const container = document.getElementById('jogo-do-mes');
    container.innerHTML = `
      <img src="${imagem}" alt="${titulo}" loading="lazy" />
      ${tagHTML}
      ${tagDesconto}
      <div>
        <h3>${titulo}</h3>
        <div class="popup-pricing">
        <p class="preco-antigo">R$ ${precoAntigo}</p> <p class="preco-novo">R$ ${precoAtual}</p>
        </div>
        <button class="btn ver-oferta">Ver Oferta</button>
      </div>
    `;

    // Renderiza gráfico
    renderizarGrafico(precoAntigo, precoAtual, precoMaisBaixo, precoMaisBaixo3M, precoMaisBaixo1Y);

  } catch (error) {
    console.error('Erro ao carregar o jogo do mês:', error);
  }
}

document.addEventListener('DOMContentLoaded', carregarJogoDoMes);
document.addEventListener('DOMContentLoaded', cotarDolar);

