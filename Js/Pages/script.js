// Função para validar o formulário
function validateForm(event) {
  event.preventDefault(); 
  let isValid = true;
  localStorage.setItem('UserPass', false)
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const emailError = document.getElementById('emailError');
  const senhaError = document.getElementById('senhaError');
  const USER = {
    email: "admin@gmail.com",
    senha: "123456"
  }

  // Limpar mensagens de erro anteriores
  emailError.textContent = '';
  senhaError.textContent = '';
  
  // Validar email
  if (!emailInput.value) {
    emailError.textContent = 'Por favor, informe seu email';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
    emailError.textContent = 'Por favor, informe um email válido';
    isValid = false;
  }
  
  // Validar senha
  if (!senhaInput.value) {
    senhaError.textContent = 'Por favor, informe sua senha';
    isValid = false;
  } else if (senhaInput.value.length < 6) {
    senhaError.textContent = 'A senha deve ter pelo menos 6 caracteres';
    isValid = false;
  }
  
// Se algum campo está inválido, não prossegue
if (!isValid) {
  event.preventDefault();
  return false;
}

// Verificar usuário e senha fixos
if (
  emailInput.value === USER.email &&
  senhaInput.value === USER.senha
) {
  // Login bem-sucedido
  alert("Login realizado com sucesso!");
  localStorage.setItem('UserPass', true)
  window.location.href = "Pages/inicio.html";
  return true;
} else {
  // Login inválido
  senhaError.textContent = 'Email ou senha inválidos';
  event.preventDefault(); // Impede o envio do formulário
  return false;
}
}

// Mostrar ou esconder a senha
function togglePasswordVisibility() {
  const senhaInput = document.getElementById('senha');
  const isChecked = document.getElementById('mostrarSenha').checked;
  
  senhaInput.type = isChecked ? 'text' : 'password';
}

// Configurar manipuladores de eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  
  // Adicionar listener para mostrar/esconder senha
  document.getElementById('mostrarSenha').addEventListener('change', togglePasswordVisibility);
  
  
  
  // Adicionar listener para validação do formulário
  document.getElementById('loginForm').addEventListener('submit', validateForm);
  
  // Adicionar listener para recuperação de senha
  document.getElementById('recuperarSenha').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert(`Um link de recuperação será enviado para: ${email}`);
    } else {
      document.getElementById('emailError').textContent = 'Informe um email válido para recuperar sua senha';
    }
  });

});



