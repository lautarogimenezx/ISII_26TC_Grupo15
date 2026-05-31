import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

export class ReservaController {

    static async obtenerTodosJugadores() {
        const { data, error } = await supabaseClient.from('jugadores').select('*');
        if (error) return [];
        return data;
    }

    static async buscarJugador(email) {
        const { data, error } = await supabaseClient
            .from('jugadores')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !data) return null;
        return data;
    }

    static async crearJugador(email, nombre, telefono) {
        const { data, error } = await supabaseClient
            .from('jugadores')
            .insert([{ email, nombre, telefono }])
            .select()
            .single();
        
        if (error) throw new Error("Error creando jugador: " + error.message);
        return data;
    }

    static obtenerHorarios(id_cancha, horaApertura, horaCierre) {
        // Genera bloques de 1 hora
        const bloques = [];
        let [aperturaHora] = horaApertura.split(':').map(Number);
        let [cierreHora] = horaCierre.split(':').map(Number);

        // Si la hora de cierre es 00:00 (medianoche) o menor, asumimos que pasa al día siguiente
        if (cierreHora <= aperturaHora) {
             cierreHora += 24;
        }

        for (let h = aperturaHora; h < cierreHora; h++) {
            const hReal = h % 24;
            const horaStr = hReal.toString().padStart(2, '0') + ':00:00';
            bloques.push({
                hora: horaStr,
                disponible: true // Inicialmente todo disponible
            });
        }
        return bloques;
    }

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

    static calcularDisponibilidad(horarios, ocupados) {
        horarios.forEach(b => {
            if (ocupados.includes(b.hora)) {
                b.disponible = false;
            }
        });
        return horarios;
    }

    // Método orquestador para la UI (Sigue el orden de la Conversación 4)
    static async calcularDisponibilidadUI(cancha, fecha) {
        const horarios = this.obtenerHorarios(cancha.id_cancha, cancha.hora_apertura, cancha.hora_cierre);
        const ocupados = await this.buscarOcupacion(cancha.id_cancha, fecha);
        return this.calcularDisponibilidad(horarios, ocupados);
    }

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

    static async crearReserva(id_jugador, total, id_estado) {
        const { data: reserva, error } = await supabaseClient
            .from('reserva')
            .insert([{ id_jugador, id_estado, total }])
            .select()
            .single();
        if (error) throw error;
        return reserva;
    }

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

    static async generarDetalle(id_reserva, id_pago, id_cancha, fecha, hora, monto_total) {
        const { error } = await supabaseClient
            .from('detalle_reserva')
            .insert([{
                id_reserva: id_reserva,
                id_pago: id_pago,
                id_cancha: id_cancha,
                fecha_reserva: fecha,
                hora_reserva: hora,
                monto_total: monto_total
            }]);
        if (error) throw error;
    }

    static async confirmarReservaCompleta(email, nombre, telefono, turno, metodoPago) {
        try {
            // 1. Verificar Doble Reserva (Double-Booking Control)
            const estaOcupado = await this.validarSolapamiento(turno.id_cancha, turno.fecha, turno.hora);
            if (estaOcupado) {
                return { success: false, error: "Este horario acaba de ser ocupado por otra persona. Recarga la agenda e intenta con otro." };
            }

            // 2. Gestionar Jugador (Buscar o Crear)
            let jugador = await this.buscarJugador(email);
            if (!jugador) {
                if(!nombre || !telefono) {
                    return { success: false, error: "Como es tu primera vez, necesitamos tu Nombre y Teléfono." };
                }
                jugador = await this.crearJugador(email, nombre, telefono);
            }

            // 3. Obtener Estado Pendiente
            let { data: estadoReserva } = await supabaseClient
                .from('estado_reserva')
                .select('id_estado')
                .ilike('descripcion', 'Pendiente')
                .maybeSingle();

            if (!estadoReserva) {
                const { data: nuevoEstado } = await supabaseClient.from('estado_reserva').insert([{ descripcion: 'Pendiente' }]).select('id_estado').single();
                estadoReserva = nuevoEstado;
            }

            // 4. Secuencia estricta según Contexto.md (Conversación 5)
            const reserva = await this.crearReserva(jugador.id_jugador, turno.precio, estadoReserva.id_estado);
            
            try {
                const id_pago = await this.generarEstadoPago('Pendiente', metodoPago);
                await this.generarDetalle(reserva.id_reserva, id_pago, turno.id_cancha, turno.fecha, turno.hora, turno.precio);
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

    static async obtenerReservasActivasPorEmail(email) {
        try {
            const jugador = await this.buscarJugador(email);
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

    static async modificarEstadoReserva(id_reserva, id_estado) {
        const { error } = await supabaseClient
            .from('reserva')
            .update({ id_estado })
            .eq('id_reserva', id_reserva);

        if (error) throw error;
    }

    static async liberarBloque(id_reserva) {
        const { error } = await supabaseClient
            .from('detalle_reserva')
            .delete()
            .eq('id_reserva', id_reserva);

        if (error) throw error;
    }

    static async cancelarReserva(id_reserva) {
        try {
            // Sigue la secuencia de Conversación 6 del Contexto.md
            await this.verificarEstado(id_reserva);
            const id_estado = await this.obtenerEstado('Cancelado');
            await this.modificarEstadoReserva(id_reserva, id_estado);
            await this.liberarBloque(id_reserva);
            
            return { success: true };
        } catch (e) {
            console.error("Error al cancelar la reserva:", e);
            return { success: false, error: e.message };
        }
    }
}
