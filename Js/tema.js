// Alternar menu de temas
function toggleThemeMenu() {
  document.getElementById('themeMenu').classList.toggle('show');
}

// Fechar o menu de temas ao clicar fora dele
function handleOutsideClick(event) {
  const themeMenu = document.getElementById('themeMenu');
  const themeBtn = document.getElementById('themeToggleBtn');
  
  if (themeMenu.classList.contains('show') && 
      !themeMenu.contains(event.target) && 
      !themeBtn.contains(event.target)) {
    themeMenu.classList.remove('show');
  }
}

// Aplicar tema
function applyTheme(theme) {
  const isDark = theme === 'Dark';
  const themeSwitch = document.getElementById('theme-switch');
  
  // Aplicar classe de tema escuro ao body
  document.body.classList.toggle('dark-mode', isDark);
  
  // Atualizar estado do switch
  themeSwitch.checked = isDark;
  
  // Salvar preferência
  localStorage.setItem('theme', theme);
}

// Detectar tema preferido do sistema
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
}

// Inicializar tema
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  
  if (!savedTheme || savedTheme === 'Auto') {
    // Usar tema do sistema se não houver preferência salva ou estiver em "Auto"
    applyTheme(getSystemTheme());
  } else {
    // Aplicar tema salvo
    applyTheme(savedTheme);
  }
}

// Configurar manipuladores de eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar tema
  initTheme();
  // Adicionar listener para o botão de tema
  document.getElementById('themeToggleBtn').addEventListener('click', toggleThemeMenu);
  
  // Adicionar listeners para as opções de tema
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      const theme = this.getAttribute('data-theme');
      
      if (theme === 'Auto') {
        localStorage.setItem('theme', 'Auto');
        applyTheme(getSystemTheme());
      } else {
        applyTheme(theme);
      }
      
      // Fechar o menu após seleção
      document.getElementById('themeMenu').classList.remove('show');
    });
  });
  // Adicionar listener para cliques fora do menu de tema
  document.addEventListener('click', handleOutsideClick);
  
  // Adicionar listener para mudanças na preferência de tema do sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    if (localStorage.getItem('theme') === 'Auto') {
      applyTheme(getSystemTheme());
    }
  });
});