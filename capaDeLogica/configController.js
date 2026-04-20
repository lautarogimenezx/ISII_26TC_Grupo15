import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

export class ConfigController {
    /**
     * Obtiene la configuración pública global (1 fila)
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
     * Actualiza la configuración global del club (sólo Admin validado por RLS)
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
