import { supabaseClient } from '../capaDeDatos/supabaseClient.js';
import { Jugador } from './jugador.js';
import { Estado_Pago } from './estado_pago.js';
import { Estado_Reserva } from './estado_reserva.js';
import { Detalle_Reserva } from './detalle_reserva.js';

/**
 * Entidad que representa la reserva de una cancha.
 * Gestiona el ciclo de vida y estado de un turno reservado por un jugador.
 * @class
 */
export class Reserva {
    /**
     * Crea una instancia de Reserva.
     * @param {number|null} id_reserva - ID de la reserva.
     * @param {number} total - Monto total de la reserva.
     * @param {number} id_jugador - ID del jugador que reserva.
     * @param {number} id_estado - ID del estado de la reserva.
     */
    constructor(id_reserva, total, id_jugador, id_estado) {
        this.id_reserva = id_reserva;
        this.total = total;
        this.id_jugador = id_jugador;
        this.id_estado = id_estado;
    }

    /**
     * Registra una nueva reserva en la base de datos.
     * @param {number} id_jugador - FK del jugador.
     * @param {number} total - Precio total.
     * @param {number} id_estado - FK del estado (ej. Pendiente).
     * @returns {Promise<Reserva>} Instancia de la reserva creada.
     */
    static async crearReserva(id_jugador, total, id_estado) {
        // Instanciamos el objeto en memoria
        const reservaTemp = new Reserva(null, total, id_jugador, id_estado);

        const { data: reserva, error } = await supabaseClient
            .from('reserva')
            .insert([{ 
                id_jugador: reservaTemp.id_jugador, 
                id_estado: reservaTemp.id_estado, 
                total: reservaTemp.total 
            }])
            .select()
            .single();
        if (error) throw error;
        
        reservaTemp.id_reserva = reserva.id_reserva;
        return reservaTemp;
    }

    /**
     * Verifica que la reserva no esté previamente cancelada.
     * @param {number} id_reserva - ID de la reserva a verificar.
     * @returns {Promise<boolean>} True si es válida.
     * @throws {Error} Si la reserva ya está cancelada.
     */
    static async verificarEstado(id_reserva) {
        const { data, error } = await supabaseClient
            .from('reserva')
            .select(`
                estado_reserva (descripcion)
            `)
            .eq('id_reserva', id_reserva)
            .single();
        
        if (error) throw new Error("Error verificando estado: " + error.message);
        if (data && data.estado_reserva && data.estado_reserva.descripcion === 'Cancelado') {
            throw new Error("La reserva ya se encuentra cancelada.");
        }
        return true;
    }

    /**
     * Modifica el estado de una reserva existente.
     * @param {number} id_reserva - ID de la reserva.
     * @param {number} id_estado - Nuevo ID de estado.
     * @returns {Promise<void>}
     */
    static async modificarEstadoReserva(id_reserva, id_estado) {
        const { error } = await supabaseClient
            .from('reserva')
            .update({ id_estado })
            .eq('id_reserva', id_reserva);

        if (error) throw error;
    }

    /**
     * Desarrolla el contrato principal de confirmación de turnos.
     * Firma: confirmarReserva(id_jugador, id_cancha, fecha, hora, monto_total, id_estado)
     * @param {number} id_jugador 
     * @param {number} id_cancha 
     * @param {string} fecha 
     * @param {string} hora 
     * @param {number} monto_total 
     * @param {number} id_estado 
     * @returns {Promise<Reserva>} Instancia de la reserva creada
     */
    static async confirmarReserva(id_jugador, id_cancha, fecha, hora, monto_total, id_estado) {
        if (id_jugador === null || id_jugador === undefined) {
            throw new Error("El jugador no está identificado (id_jugador nulo).");
        }

        // 1. Validar solapamiento atómico
        const estaOcupado = await Detalle_Reserva.validarSolapamiento(id_cancha, fecha, hora);
        if (estaOcupado) {
            throw new Error("Aborta transacción por solapamiento y retorna error");
        }

        // 2. Crear la reserva
        const reserva = await this.crearReserva(id_jugador, monto_total, id_estado);

        // 3. Generar el pago y el detalle
        try {
            // Genera el estado de pago pendiente en efectivo (por defecto)
            const id_pago = await Estado_Pago.generarEstadoPago('Pendiente', 'Efectivo');
            // Genera el detalle
            await Detalle_Reserva.generarDetalle(reserva.id_reserva, id_pago, id_cancha, fecha, hora, monto_total);
        } catch (err) {
            // Compensación manual (Rollback) si falla la inserción de pago o detalle
            await supabaseClient.from('reserva').delete().eq('id_reserva', reserva.id_reserva);
            throw err;
        }

        return reserva;
    }

    /**
     * Coordina la creación completa de una reserva interactuando con Detalle, Jugador y Pago.
     * @param {string} email - Email del usuario.
     * @param {string} nombre - Nombre del usuario.
     * @param {string} telefono - Teléfono del usuario.
     * @param {Object} turno - Objeto con datos del turno (fecha, hora, cancha).
     * @param {string} metodoPago - Método de pago seleccionado.
     * @returns {Promise<Object>} Resultado de la transacción {success, error|reserva}.
     */
    static async confirmarReservaCompleta(email, nombre, telefono, turno, metodoPago) {
        try {
            // 1. Validar Solapamiento mediante Detalle_Reserva
            const estaOcupado = await Detalle_Reserva.validarSolapamiento(turno.id_cancha, turno.fecha, turno.hora);
            if (estaOcupado) {
                return { success: false, error: "Este horario acaba de ser ocupado por otra persona. Recarga la agenda e intenta con otro." };
            }

            // 2. Gestionar Jugador (Buscar o Crear)
            let jugador = await Jugador.buscarJugador(email);
            if (!jugador) {
                if(!nombre || !telefono) {
                    return { success: false, error: "Como es tu primera vez, necesitamos tu Nombre y Teléfono." };
                }
                jugador = await Jugador.crearJugador(email, nombre, telefono);
            }

            // 3. Obtener Estado Pendiente
            const id_estado = await Estado_Reserva.obtenerEstado('Pendiente');

            // 4. Secuencia estricta según Contexto.md (Conversación 5)
            const reserva = await this.crearReserva(jugador.id_jugador, turno.precio, id_estado);
            
            try {
                const id_pago = await Estado_Pago.generarEstadoPago('Pendiente', metodoPago);
                await Detalle_Reserva.generarDetalle(reserva.id_reserva, id_pago, turno.id_cancha, turno.fecha, turno.hora, turno.precio);
            } catch (err) {
                // Compensación manual (Rollback)
                await supabaseClient.from('reserva').delete().eq('id_reserva', reserva.id_reserva);
                throw err;
            }

            return { success: true, reserva };

        } catch (error) {
            console.error("Error al procesar reserva completa:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene el listado de reservas activas asociadas a un email.
     * @param {string} email - Correo del jugador.
     * @returns {Promise<Array>} Lista de objetos planos con datos consolidados para la UI.
     */
    static async obtenerReservasActivasPorEmail(email) {
        try {
            const jugador = await Jugador.buscarJugador(email);
            if (!jugador) return [];

            const { data: reservas, error } = await supabaseClient
                .from('reserva')
                .select(`
                    id_reserva,
                    total,
                    estado_reserva!inner(id_estado, descripcion),
                    detalle_reserva(
                        fecha_reserva,
                        hora_reserva,
                        canchas(nombre),
                        estado_pago(estado, metodo_pago(descripcion))
                    )
                `)
                .eq('id_jugador', jugador.id_jugador)
                .neq('estado_reserva.descripcion', 'Cancelado');

            if (error) throw error;
            
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            const todayStr = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

            return (reservas || []).map(r => {
                const det = r.detalle_reserva && r.detalle_reserva[0];
                return {
                    id_reserva: r.id_reserva,
                    total: r.total,
                    estado: r.estado_reserva?.descripcion,
                    fecha: det?.fecha_reserva,
                    hora: det?.hora_reserva,
                    cancha: det?.canchas?.nombre || 'Cancha',
                    estadoPago: det?.estado_pago?.estado || 'Pendiente',
                    metodoPago: det?.estado_pago?.metodo_pago?.descripcion || 'No definido'
                };
            }).filter(r => r.estado !== 'Cancelado' && r.fecha && r.fecha >= todayStr);
        } catch (e) {
            console.error("Error al obtener reservas por email:", e);
            throw e;
        }
    }

    /**
     * Cancela una reserva, libera su bloque horario y cambia su estado.
     * @param {number} id_reserva - ID de la reserva a cancelar.
     * @returns {Promise<Object>} Resultado {success, error}.
     */
    static async cancelarReserva(id_reserva) {
        try {
            // Sigue la secuencia de Conversación 6 del Contexto.md
            await this.verificarEstado(id_reserva);
            const id_estado = await Estado_Reserva.obtenerEstado('Cancelado');
            await this.modificarEstadoReserva(id_reserva, id_estado);
            await Detalle_Reserva.liberarBloque(id_reserva);
            
            return { success: true };
        } catch (e) {
            console.error("Error al cancelar la reserva:", e);
            return { success: false, error: e.message };
        }
    }
}
