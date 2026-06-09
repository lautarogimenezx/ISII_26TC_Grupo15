import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Entidad que representa los posibles estados de una reserva.
 * @class
 */
export class Estado_Reserva {
    /**
     * @param {number|null} id_estado
     * @param {string} descripcion
     */
    constructor(id_estado, descripcion) {
        this.id_estado = id_estado;
        this.descripcion = descripcion;
    }

    /**
     * Obtiene o crea un estado de reserva por su descripción.
     * @param {string} descripcion - Ej: "Pendiente", "Cancelado"
     * @returns {Promise<number>} ID del estado.
     */
    static async obtenerEstado(descripcion) {
        let { data: estado } = await supabaseClient
            .from('estado_reserva')
            .select('id_estado')
            .ilike('descripcion', descripcion)
            .maybeSingle();

        if (!estado) {
            const { data: nuevoEstado, error } = await supabaseClient
                .from('estado_reserva')
                .insert([{ descripcion }])
                .select('id_estado')
                .single();
            if (error) throw error;
            estado = nuevoEstado;
        }
        return estado.id_estado;
    }
}
