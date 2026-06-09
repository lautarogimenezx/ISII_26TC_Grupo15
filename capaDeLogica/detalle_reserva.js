import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Entidad encargada de mapear el detalle horario y de costo de cada reserva.
 * @class
 */
export class Detalle_Reserva {
    /**
     * @param {number|null} id_detalle
     * @param {string} fecha_reserva
     * @param {string} hora_reserva
     * @param {number} monto_total
     * @param {number} id_reserva
     * @param {number} id_pago
     * @param {number} id_cancha
     */
    constructor(id_detalle, fecha_reserva, hora_reserva, monto_total, id_reserva, id_pago, id_cancha) {
        this.id_detalle = id_detalle;
        this.fecha_reserva = fecha_reserva;
        this.hora_reserva = hora_reserva;
        this.monto_total = monto_total;
        this.id_reserva = id_reserva;
        this.id_pago = id_pago;
        this.id_cancha = id_cancha;
    }

    /**
     * Devuelve las horas ocupadas de una cancha en una fecha.
     * @param {number} id_cancha 
     * @param {string} fecha 
     * @returns {Promise<Array<string>>}
     */
    static async buscarOcupacion(id_cancha, fecha) {
        const { data: ocupados, error } = await supabaseClient
            .from('detalle_reserva')
            .select('hora_reserva')
            .eq('id_cancha', id_cancha)
            .eq('fecha_reserva', fecha);

        if (error) {
            console.error("Error buscando ocupación:", error);
            return [];
        }
        return ocupados.map(o => o.hora_reserva);
    }

    /**
     * Valida atómicamente si una hora específica está libre para evitar concurrencia.
     * @param {number} id_cancha 
     * @param {string} fecha 
     * @param {string} hora 
     * @returns {Promise<boolean>} True si está ocupado, False si está libre.
     */
    static async validarSolapamiento(id_cancha, fecha, hora) {
        const { count, error } = await supabaseClient
            .from('detalle_reserva')
            .select('*', { count: 'exact', head: true })
            .eq('id_cancha', id_cancha)
            .eq('fecha_reserva', fecha)
            .eq('hora_reserva', hora);
        
        if (error) throw new Error("Error validando solapamiento");
        return count > 0;
    }

    /**
     * Genera el detalle en base de datos.
     * @param {number} id_reserva 
     * @param {number} id_pago 
     * @param {number} id_cancha 
     * @param {string} fecha 
     * @param {string} hora 
     * @param {number} monto_total 
     * @returns {Promise<void>}
     */
    static async generarDetalle(id_reserva, id_pago, id_cancha, fecha, hora, monto_total) {
        // Instanciar usando el constructor primero
        const detalle = new Detalle_Reserva(null, fecha, hora, monto_total, id_reserva, id_pago, id_cancha);

        const { error } = await supabaseClient
            .from('detalle_reserva')
            .insert([{
                id_reserva: detalle.id_reserva,
                id_pago: detalle.id_pago,
                id_cancha: detalle.id_cancha,
                fecha_reserva: detalle.fecha_reserva,
                hora_reserva: detalle.hora_reserva,
                monto_total: detalle.monto_total
            }]);
        if (error) throw error;
    }

    /**
     * Elimina el bloque cuando la reserva es cancelada.
     * @param {number} id_reserva 
     * @returns {Promise<void>}
     */
    static async liberarBloque(id_reserva) {
        const { error } = await supabaseClient
            .from('detalle_reserva')
            .delete()
            .eq('id_reserva', id_reserva);

        if (error) throw error;
    }
}
