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
     * Registra un nuevo jugador en la base de datos.
     * @param {string} email - Correo electrónico.
     * @param {string} nombre - Nombre completo.
     * @param {string} telefono - Teléfono de contacto.
     * @returns {Promise<Jugador>} La nueva instancia del jugador con su ID asignado.
     * @throws {Error} Si falla la inserción en la BD.
     */
    static async crearJugador(email, nombre, telefono) {
        // Instanciamos el objeto en memoria primero usando el constructor (id null porque aún no se generó)
        const jugadorTemporal = new Jugador(null, nombre, email, telefono);

        const { data, error } = await supabaseClient
            .from('jugadores')
            .insert([{ 
                email: jugadorTemporal.email, 
                nombre: jugadorTemporal.nombre, 
                telefono: jugadorTemporal.telefono 
            }])
            .select()
            .single();
        
        if (error) throw new Error("Error creando jugador: " + error.message);
        
        // Le asignamos el ID real generado por la BD al objeto instanciado
        jugadorTemporal.id_jugador = data.id_jugador;
        return jugadorTemporal;
    }
}
