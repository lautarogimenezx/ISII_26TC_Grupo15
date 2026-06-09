import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Servicio encargado de la autenticación administrativa.
 * @class
 */
export class AuthService {
    /**
     * Valida las credenciales de inicio de sesión administrativo.
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} {success, error}
     */
    static async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data };
    }

    /**
     * Cierra la sesión activa.
     */
    static async logout() {
        const { error } = await supabaseClient.auth.signOut();
        return { success: !error, error: error?.message };
    }

    /**
     * Protege rutas redireccionando si no está autenticado.
     * @param {string} redirectTo 
     */
    static async requireAuth(redirectTo = 'login.html') {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) {
            window.location.href = redirectTo;
            return null;
        }
        return user;
    }

    /**
     * Retorna verdadero si hay una sesión de admin iniciada.
     * @returns {boolean}
     */
    static async isAuthenticated() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return !!user;
    }
}
