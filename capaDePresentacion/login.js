import { AuthService } from '../capaDeLogica/authService.js';
import { UI } from './ui.js';

// Redirigir directamente si ya está logueado
window.addEventListener('load', async () => {
    if (await AuthService.isAuthenticated()) {
        window.location.href = 'configuracion.html';
    }
});

window.iniciarSesion = async () => {
    const btn = document.getElementById('btn-login');
    btn.innerHTML = "Verificando...";
    btn.disabled = true;

    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    const result = await AuthService.login(email, pass);

    if (result.success) {
        window.location.href = 'configuracion.html';
    } else {
        UI.alert(result.error, 'Error de acceso', 'error');
        btn.innerHTML = "Ingresar al Panel";
        btn.disabled = false;
    }
};
