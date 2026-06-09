import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Entidad que representa el estado de un pago.
 * @class
 */
export class Estado_Pago {
    /**
     * @param {number|null} id_pago
     * @param {string} estado
     * @param {string|Date} fecha_pago
     * @param {number} id_metodo
     */
    constructor(id_pago, estado, fecha_pago, id_metodo) {
        this.id_pago = id_pago;
        this.estado = estado;
        this.fecha_pago = fecha_pago;
        this.id_metodo = id_metodo;
    }

    /**
     * Genera un nuevo registro de estado de pago.
     * @param {string} estado 
     * @param {string} metodoPago 
     * @returns {Promise<number>} ID del estado de pago insertado.
     */
    static async generarEstadoPago(estado, metodoPago) {
        let { data: metodoData } = await supabaseClient
            .from('metodo_pago')
            .select('id_metodo')
            .ilike('descripcion', metodoPago)
            .maybeSingle();
        
        if (!metodoData) {
            const { data: nuevoMetodo, error: errInsertMetodo } = await supabaseClient
                .from('metodo_pago')
                .insert([{ descripcion: metodoPago }])
                .select('id_metodo')
                .single();
            if (errInsertMetodo) throw new Error(`Error al registrar método '${metodoPago}': ` + errInsertMetodo.message);
            metodoData = nuevoMetodo;
        }

        const { data: estadoPagoData, error: errEstadoPago } = await supabaseClient
            .from('estado_pago')
            .insert([{ estado: estado, id_metodo: metodoData.id_metodo }])
            .select('id_pago')
            .single();
        
        if (errEstadoPago) throw errEstadoPago;
        return estadoPagoData.id_pago;
    }
}
