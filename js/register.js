const API_URL = 'http://localhost:3000/api';

// Helper para incluir JWT token en las peticiones (si fuera necesario en el futuro)
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = {'Content-Type': 'application/json'};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Register.js cargado correctamente');
    
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Validar coincidencia de contraseñas en tiempo real
    confirmPasswordInput.addEventListener('input', validarCoincidenciaPasswords);
    passwordInput.addEventListener('input', validarCoincidenciaPasswords);
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }
        
        // Mostrar loading
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;
        
        try {
            const formData = {
                dni: parseInt(document.getElementById('dni').value.trim(), 10),
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                mail: document.getElementById('mail').value.trim(),
                username: document.getElementById('username').value.trim(),
                password: passwordInput.value,
                rol: 'cliente'
            };
            
            console.log('Enviando datos de registro:', { ...formData, password: '***' });
            
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Respuesta del backend:', data);

            if (response.ok && data.success) {
                mostrarMensaje('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'index.html?registro=exitoso';
                }, 2000);
            } else {
                const errorMsg = data.message || 'Error en el registro. Intente nuevamente.';
                mostrarMensaje(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            mostrarMensaje('Error de conexión. Verifique que el servidor esté funcionando en localhost:3000', 'error');
        } finally {
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Validar DNI en tiempo real (solo números)
    document.getElementById('dni').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
});

function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const email = document.getElementById('mail').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validaciones básicas
    if (!nombre || !apellido || !dni || !email || !username || !password) {
        mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
        return false;
    }
    
    if (dni.length < 7 || dni.length > 8) {
        mostrarMensaje('El DNI debe tener entre 7 y 8 dígitos', 'error');
        return false;
    }
    
    if (password.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        mostrarMensaje('Las contraseñas no coinciden', 'error');
        return false;
    }
    
    if (!validarEmail(email)) {
        mostrarMensaje('Por favor ingrese un email válido', 'error');
        return false;
    }
    
    return true;
}

function validarCoincidenciaPasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#e74c3c';
    } else if (confirmPassword && password === confirmPassword) {
        confirmInput.style.borderColor = '#27ae60';
    } else {
        confirmInput.style.borderColor = '#1ba97a';
    }
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
