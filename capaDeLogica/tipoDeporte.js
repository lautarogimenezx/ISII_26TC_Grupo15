import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

export class Tipo_Deporte {
    /**
     * Obtiene la lista de tipos de deporte desde la base de datos
     */
    static async obtenerTiposCancha() {
        const { data, error } = await supabaseClient
            .from('tipo_deporte')
            .select('id_deporte, descripcion')
            .order('descripcion', { ascending: true });
        
        if (error) {
            console.error("Error obteniendo tipos de deporte:", error);
            return [];
        }
        return data;
    }
}
