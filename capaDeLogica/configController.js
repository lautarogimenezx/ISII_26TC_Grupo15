import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Controlador global para la configuración de la UI (ej. nombre del club).
 * @class
 */
export class ConfigController {
    /**
     * Obtiene la configuración del club desde BD.
     * @returns {Promise<Object>}
     */
    static async getConfig() {
        const { data, error } = await supabaseClient
            .from('club_config')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error("Error obteniendo configuración del club:", error);
            return null;
        }
        return data;
    }

    /**
     * Actualiza la configuración visual del club en BD.
     * @param {Object} datos - Atributos de configuración.
     * @returns {Promise<Object>} {success, error}
     */
    static async updateConfig(datos) {
        const { error } = await supabaseClient
            .from('club_config')
            .update({
                nombre: datos.nombre,
                telefono_whatsapp: datos.telefono_whatsapp,
                detalles_bancarios: datos.detalles_bancarios
            })
            .eq('id', 1);

        if (error) {
            console.error("Error actualizando club_config:", error);
            return { success: false, error: error.message };
        }
        return { success: true };
    }
}
