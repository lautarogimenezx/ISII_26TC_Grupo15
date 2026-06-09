import { Detalle_Reserva } from './detalle_reserva.js';
import { CanchaFactory } from './canchaFactory.js';
import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Entidad base de Dominio para una Cancha.
 * Gestiona validaciones, horarios y operaciones CRUD en BD.
 * @class
 */
export class Cancha {
    /**
     * @param {number|null} id_cancha
     * @param {string} nombre
     * @param {string} hora_apertura
     * @param {string} hora_cierre
     * @param {number} precio
     * @param {number} id_deporte
     */
    constructor(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte) {
        this.id_cancha = id_cancha;
        this.nombre = nombre;
        this.hora_apertura = hora_apertura;
        this.hora_cierre = hora_cierre;
        this.precio = parseFloat(precio);
        this.id_deporte = id_deporte;
    }

    /**
     * Valida los datos estructurales y de negocio de la cancha.
     * @param {string} nombre 
     * @param {number} tipo 
     * @param {string} apertura 
     * @param {string} cierre 
     * @param {number} precio 
     * @returns {Object} {valid: boolean, error: string}
     */
    static validarDatos(nombre, tipo, apertura, cierre, precio) {
        if (!nombre || String(nombre).trim() === '') return { valid: false, error: "El nombre es obligatorio." };
        if (tipo === undefined || tipo === null || String(tipo).trim() === '') return { valid: false, error: "El tipo de deporte es obligatorio." };
        if (!apertura) return { valid: false, error: "La hora de apertura es obligatoria." };
        if (!cierre) return { valid: false, error: "La hora de cierre es obligatoria." };
        
        let [aperturaHora, aperturaMinuto] = apertura.toString().split(':').map(Number);
        let [cierreHora, cierreMinuto] = cierre.toString().split(':').map(Number);
        let aperturaTotal = aperturaHora * 60 + (aperturaMinuto || 0);
        let cierreTotal = cierreHora * 60 + (cierreMinuto || 0);

        if (aperturaTotal === cierreTotal) {
            return { valid: false, error: "La apertura y el cierre no pueden ser a la misma hora." };
        } else if (aperturaTotal > cierreTotal) {
            // El turno cruza la medianoche
            if (cierreHora >= 7) {
                 return { valid: false, error: "Revisar horarios: Si cruza la medianoche, el cierre debe ser de madrugada (antes de las 07:00 AM)." };
            }
        }

        if (precio === undefined || precio === null || isNaN(precio) || parseFloat(precio) < 0) return { valid: false, error: "El precio debe ser un número válido." };
        return { valid: true };
    }

    /**
     * Genera los bloques horarios de una cancha.
     * @param {number} id_cancha 
     * @param {string} horaApertura 
     * @param {string} horaCierre 
     * @returns {Array} Matriz inicial de bloques horarios disponibles
     */
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

    /**
     * Cruza los horarios con los bloques ocupados.
     * @param {Array} horarios 
     * @param {Array} ocupados 
     * @returns {Array} Matriz calculada final.
     */
    static calcularDisponibilidad(horarios, ocupados) {
        horarios.forEach(b => {
            if (ocupados.includes(b.hora)) {
                b.disponible = false;
            }
        });
        return horarios;
    }

    /**
     * Obtiene la disponibilidad para la UI cruzando con Detalle_Reserva.
     * @param {Object} cancha 
     * @param {string} fecha 
     * @returns {Promise<Array>}
     */
    static async calcularDisponibilidadUI(cancha, fecha) {
        const horarios = this.obtenerHorarios(cancha.id_cancha, cancha.hora_apertura, cancha.hora_cierre);
        const ocupados = await Detalle_Reserva.buscarOcupacion(cancha.id_cancha, fecha);
        return this.calcularDisponibilidad(horarios, ocupados);
    }

    /**
     * Persiste una nueva cancha en la BD.
     * @returns {Promise<Object>} Resultado de la transacción
     */
    static async agregarCancha(nombre, id_deporte, nombre_deporte, apertura, cierre, precio) {
        try {
            const validacion = this.validarDatos(nombre, id_deporte, apertura, cierre, precio);
            if (!validacion.valid) {
                return { success: false, error: validacion.error };
            }

            const nuevaCanchaObj = CanchaFactory.crearCancha(null, nombre, id_deporte, nombre_deporte, apertura, cierre, precio);

            const { data, error } = await supabaseClient
                .from('canchas')
                .insert([{
                    nombre: nuevaCanchaObj.nombre,
                    id_deporte: nuevaCanchaObj.id_deporte,
                    hora_apertura: nuevaCanchaObj.hora_apertura,
                    hora_cierre: nuevaCanchaObj.hora_cierre,
                    precio: nuevaCanchaObj.precio
                }])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return { success: true, data };
        } catch (err) {
            console.error("Error en Cancha:", err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Devuelve la lista de canchas instanciadas.
     * @returns {Promise<Cancha[]>}
     */
    static async getCanchas() {
        const { data, error } = await supabaseClient
            .from('canchas')
            .select('*, tipo_deporte(descripcion)');
        
        if (error) {
            console.error("Error obteniendo canchas:", error);
            return [];
        }
        return data.map(c => {
            const cancha = CanchaFactory.crearCancha(c.id_cancha, c.nombre, c.id_deporte, c.tipo_deporte?.descripcion, c.hora_apertura, c.hora_cierre, c.precio);
            cancha.tipo_deporte = c.tipo_deporte; // Conservar objeto para UI
            return cancha;
        });
    }

    /**
     * Elimina lógicamente o físicamente una cancha si no tiene reservas.
     * @param {number} id_cancha 
     * @returns {Promise<Object>}
     */
    static async eliminarCancha(id_cancha) {
        const { error } = await supabaseClient
            .from('canchas')
            .delete()
            .eq('id_cancha', id_cancha);

        if (error) {
            console.error("Error eliminando cancha:", error);
            return { success: false, error: error.message };
        }
        return { success: true };
    }

    /**
     * Actualiza la información de una cancha existente.
     * @returns {Promise<Object>}
     */
    static async actualizarCancha(id_cancha, datosFormulario) {
        try {
            const validacion = this.validarDatos(
                datosFormulario.nombre, 
                datosFormulario.id_deporte, 
                datosFormulario.hora_apertura, 
                datosFormulario.hora_cierre, 
                datosFormulario.precio
            );
            if (!validacion.valid) {
                return { success: false, error: validacion.error };
            }

            const canchaObj = CanchaFactory.crearCancha(
                id_cancha,
                datosFormulario.nombre,
                datosFormulario.id_deporte,
                datosFormulario.nombre_deporte,
                datosFormulario.hora_apertura,
                datosFormulario.hora_cierre,
                datosFormulario.precio
            );

            const { data, error } = await supabaseClient
                .from('canchas')
                .update({
                    nombre: canchaObj.nombre,
                    id_deporte: canchaObj.id_deporte,
                    hora_apertura: canchaObj.hora_apertura,
                    hora_cierre: canchaObj.hora_cierre,
                    precio: canchaObj.precio
                })
                .eq('id_cancha', id_cancha)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return { success: true, data };
        } catch (err) {
            console.error("Error al actualizar la cancha:", err);
            return { success: false, error: err.message };
        }
    }
}

/** @class */
export class CanchaFutbol extends Cancha {
    constructor(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte) {
        super(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
    }
}

/** @class */
export class CanchaPadel extends Cancha {
    constructor(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte) {
        super(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
    }
}

/** @class */
export class CanchaTenis extends Cancha {
    constructor(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte) {
        super(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
    }
}
