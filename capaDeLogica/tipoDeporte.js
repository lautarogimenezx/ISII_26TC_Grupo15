import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Entidad de catálogo para los tipos de deporte disponibles.
 * @class
 */
export class Tipo_Deporte {
    /**
     * @param {number|null} id_deporte
     * @param {string} descripcion
     */
    constructor(id_deporte, descripcion) {
        this.id_deporte = id_deporte;
        this.descripcion = descripcion;
    }

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
        return data.map(d => new Tipo_Deporte(d.id_deporte, d.descripcion));
    }
}
