const webAppUrl = 'https://script.google.com/macros/s/AKfycbzC5n-4jHw5HzNwy3KHR6dPTRyj6wU5TCNLmlFxRyyQ0xRaUEr7Kwd6Crmi-XNv_fUk/exec';

const salasVermelhas = ['01', '02', '03', '06', '10', '16', '19'];
const salasAmarelas  = ['07', '11', '13', '15', '17', '18'];
const salasVerdes    = ['08', '09', '12', '14'];

function obterEmojiCurso(curso) {
  if (!curso) return '';
  const mapa = {
    'Administração': '📊',
    'Análises Clínicas': '🧪',
    'Enfermagem': '🩺',
    'Farmácia': '💊',
    'Instrumentação Cirúrgica': '🗡️',
    'Radiologia': '☢️',
    'Edificações': '🏗️',
    'Eletrotécnica': '⚡',
    'Segurança do Trabalho': '🦺',
    'Flebotomia': '💉'
  };
  return mapa[curso.trim()] || '';
}

// Função para determinar o status da sala
function determinarStatus(sala) {
  return sala.status?.toLowerCase() || 'livre';
}

// Função para extrair o número da sala
function extrairNumeroSala(nome) {
  const match = nome.match(/\d+/);
  return match ? match[0] : '';
}

// Função para formatar a data para o formato brasileiro
function formatarDataBrasileira(dataISO) {
  const date = new Date(dataISO);
  const semana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return `Data: ${semana[date.getDay()]}, ${date.toLocaleDateString('pt-BR')}`;
}

// Função para filtrar as salas com base no filtro de pesquisa
function filtrarSalas() {
  const termo = document.getElementById('filtro').value.toLowerCase();
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const texto = card.innerText.toLowerCase();
    card.style.display = texto.includes(termo) ? 'block' : 'none';
  });
}

// Função para filtrar as salas com base no turno de pesquisa
function filtrarPorTurno(turnoSelecionado) {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const turnoCard = card.getAttribute('data-turno') || '';
    if (turnoSelecionado === 'todos' || turnoCard === turnoSelecionado) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Atualiza botão ativo
  document.querySelectorAll('.btn-turno').forEach(btn => {
    if (btn.getAttribute('data-turno') === turnoSelecionado) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}


// Função para atualizar o painel de salas
async function atualizarPainel() {
  try {
    const response = await fetch(webAppUrl);
    const salas = await response.json();

    document.getElementById('terreo').innerHTML = '';
    document.getElementById('primeiro').innerHTML = '';

    salas.forEach(sala => {
      const status = determinarStatus(sala);
	  // Ocultar salas fechadas
	  if (status === 'fechada') return;
	  
      const statusTexto = {
        'em-aula': `<svg width="16" height="16" viewBox="0 0 24 24" fill="green" style="vertical-align:middle;"><path d="M20 4H4c-1.1 0-2 .9-2 2v14h2v-2h16v2h2V6c0-1.1-.9-2-2-2zm0 10H4V6h16v8z"/><path d="M4 18h16v2H4z" fill="none"/></svg> Em aula`,
        'livre': `<svg width="16" height="16" viewBox="0 0 24 24" fill="#2e7d32" style="vertical-align:middle;"><circle cx="12" cy="12" r="10"/></svg> Livre`,
        'reservado': `<svg width="16" height="16" viewBox="0 0 24 24" fill="#f57c00" style="vertical-align:middle;"><path d="M12 17a2 2 0 110-4 2 2 0 010 4zm1-9h-2V7h2v1zm1-2H10c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h1v1h2v-1h1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg> Reservado`,
        'em prova': `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1976d2" style="vertical-align:middle;"><path d="M3 3v18h18V3H3zm8 12H8v-2h3v2zm5-4H8V9h8v2zm0-4H8V5h8v2z"/></svg> Em Prova`,
        'seminário': `<svg width="16" height="16" viewBox="0 0 24 24" fill="#8e24aa" style="vertical-align:middle;"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm1-4H10V7h4v6z"/></svg> Seminário`,
        'fechada': `<svg width="16" height="16" viewBox="0 0 24 24" fill="#c62828" style="vertical-align:middle;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.29 13.88l-1.41 1.41L12 13.41l-2.88 2.88-1.41-1.41L10.59 12 7.71 9.12l1.41-1.41L12 10.59l2.88-2.88 1.41 1.41L13.41 12l2.88 2.88z"/></svg> Fechada`
      }[status] || status;

      const numeroSala = extrairNumeroSala(sala.nome);
      const card = document.createElement('div');
      card.className = 'card';
	  card.setAttribute('data-turno', sala.turno || '');

      if (sala.nome.toLowerCase().includes('lab')) card.classList.add('lab-card');
	
		const capacidade = parseInt(sala.capacidade);

		if (!isNaN(capacidade)) {
		  if (capacidade <= 30) {
			card.classList.add('sala-vermelha'); // pequena
		  } else if (capacidade <= 50) {
			card.classList.add('sala-amarela'); // média
		  } else {
			card.classList.add('sala-verde'); // grande
		  }
		} else {
		  card.classList.add('sala-cinza'); // capacidade inválida ou ausente (opcional)
		}


      let conteudo = `<h2>${sala.nome}</h2>`;
      if (status === 'em-aula') {
        conteudo += `
          <p><strong>${obterEmojiCurso(sala.curso)} ${sala.curso || '-'}</strong> - ${sala.turma || '-'}</p>
          <p><strong>Turno:</strong> ${sala.turno || '-'}</p>
          <p class="info-extra" style="display:none">
            ${formatarDataBrasileira(sala.data)}<br>
            <strong>Instrutor:</strong> ${sala.instrutor || '-'}<br>
            <strong>Capacidade:</strong> ${sala.capacidade || '-'}<br>
            <strong>Duração:</strong> ${sala.duracao || '-'}<br>
            <strong>Obs:</strong> ${sala.observacoes || '-'}
          </p>
        `;
      }
      conteudo += `<div class="status-container ${status}" >${statusTexto}</div>`;
      card.innerHTML = conteudo;

      // Adiciona evento de clique para expandir/colapsar o card
      card.addEventListener('click', function (e) {
        e.stopPropagation();
        const jaExpandido = card.classList.contains('expanded');
        document.querySelectorAll('.card.expanded').forEach(c => recolherCard(c));
        if (!jaExpandido) expandirCard(card);
      });

      // Adiciona o card ao painel
      const painelId = (sala.andar?.toLowerCase() === 'primeiro') ? 'primeiro' : 'terreo';
      document.getElementById(painelId).appendChild(card);
    });

    // Fecha o card se o usuário clicar fora
    document.body.addEventListener('click', (e) => {
      if (!e.target.closest('.card')) {
        const cardAtivo = document.querySelector('.card.expanded');
        if (cardAtivo) recolherCard(cardAtivo);
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

// Função para atualizar o relógio
function atualizarRelogio() {
  const agora = new Date();
  const semana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const data = `${semana[agora.getDay()]}, ${agora.toLocaleDateString('pt-BR')}`;
  const hora = agora.toLocaleTimeString('pt-BR');
  document.getElementById('relogio').textContent = `${data} | ${hora}`;
}

// Atualizar painel e relógio a cada intervalo
atualizarPainel();
setInterval(atualizarPainel, 60000);
atualizarRelogio();
setInterval(atualizarRelogio, 1000);

// Função de alternância do modo escuro
document.getElementById('toggle-dark').addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');
  const modoEscuroAtivo = document.body.classList.contains('dark-mode');
  this.textContent = modoEscuroAtivo ? '⚪️' : '⚫';

  const logo = document.getElementById('logo-img');
  if (logo) {
    logo.src = modoEscuroAtivo ? 'logo_white.jpg' : 'logo.jpg';
  }
});

// Botão de tela cheia
const fullscreenButton = document.getElementById("fullscreen-toggle");

fullscreenButton.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      alert(`Erro ao ativar tela cheia: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});

// Funções para expandir e recolher os cards
function expandirCard(card) {
  card.classList.add('expanded');
  const info = card.querySelector('.info-extra');
  if (info) info.style.display = 'block';
  document.getElementById('card-overlay').style.display = 'block';
}

function recolherCard(card) {
  card.classList.remove('expanded');
  const info = card.querySelector('.info-extra');
  if (info) info.style.display = 'none';
  document.getElementById('card-overlay').style.display = 'none';
}

// Evento de clique para recolher card
document.getElementById('card-overlay').addEventListener('click', () => {
  const cardAtivo = document.querySelector('.card.expanded');
  if (cardAtivo) {
    recolherCard(cardAtivo);
  }
});
