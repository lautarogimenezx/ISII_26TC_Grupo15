import { supabaseClient } from '../capaDeDatos/supabaseClient.js';

/**
 * Entidad que representa a un jugador del club.
 * Gestiona la información del cliente y su persistencia en la base de datos.
 * @class
 */
export class Jugador {
    /**
     * Crea una instancia de Jugador.
     * @param {number|null} id_jugador - ID único del jugador generado por la BD.
     * @param {string} nombre - Nombre completo del jugador.
     * @param {string} email - Correo electrónico del jugador.
     * @param {string} telefono - Teléfono de contacto.
     */
    constructor(id_jugador, nombre, email, telefono) {
        this.id_jugador = id_jugador;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
    }

    /**
     * Obtiene todos los jugadores registrados en el sistema.
     * @returns {Promise<Jugador[]>} Lista de todos los jugadores instanciados.
     */
    static async obtenerTodosJugadores() {
        const { data, error } = await supabaseClient.from('jugadores').select('*');
        if (error) return [];
        return data.map(d => new Jugador(d.id_jugador, d.nombre, d.email, d.telefono));
    }

    /**
     * Busca un jugador por su correo electrónico.
     * @param {string} email - El correo a buscar.
     * @returns {Promise<Jugador|null>} La instancia del jugador si existe, o null.
     */
    static async buscarJugador(email) {
        const { data, error } = await supabaseClient
            .from('jugadores')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !data) return null;
        return new Jugador(data.id_jugador, data.nombre, data.email, data.telefono);
    }

    /**
     * Registra un nuevo jugador en la base de datos usando el procedimiento almacenado.
     * @param {string} email - Correo electrónico.
     * @param {string} nombre - Nombre completo.
     * @param {string} telefono - Teléfono de contacto.
     * @returns {Promise<Jugador>} La nueva instancia del jugador con su ID asignado.
     * @throws {Error} Si falla la inserción en la BD.
     */
    static async crearJugador(email, nombre, telefono) {
        const { data, error } = await supabaseClient
            .rpc('crear_jugador', {
                p_email: email,
                p_nombre: nombre,
                p_telefono: telefono
            });
        
        if (error) throw new Error("Error creando jugador: " + error.message);
        if (!data || data.length === 0) throw new Error("Error creando jugador: no se retornaron datos.");
        
        const d = data[0];
        return new Jugador(d.id_jugador, d.nombre, d.email, d.telefono);
    }

    /**
     * Actualiza la información de un jugador existente en la base de datos usando el procedimiento almacenado.
     * @param {string} email - Correo electrónico del jugador.
     * @param {string} nombre - Nuevo nombre completo.
     * @param {string} telefono - Nuevo teléfono de contacto.
     * @returns {Promise<Jugador>} La instancia del jugador actualizado.
     * @throws {Error} Si falla la actualización en la BD.
     */
    static async actualizarJugador(email, nombre, telefono) {
        const { data, error } = await supabaseClient
            .rpc('actualizar_jugador', {
                p_email: email,
                p_nombre: nombre,
                p_telefono: telefono
            });

        if (error) throw new Error("Error al actualizar jugador: " + error.message);
        if (!data || data.length === 0) throw new Error("Error al actualizar jugador: jugador no encontrado o no se retornaron datos.");

        const d = data[0];
        return new Jugador(d.id_jugador, d.nombre, d.email, d.telefono);
    }
}

