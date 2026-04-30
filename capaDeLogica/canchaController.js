import { supabaseClient } from '../capaDeDatos/supabaseClient.js';
import { CanchaFactory } from './canchaFactory.js';
import { Cancha } from './cancha.js';

export class CanchaController {
    /**
     * Intercepta la creación de una cancha desde el formulario web
     * y utiliza la Factory para persistir el objeto adecuado en BD.
     */
    static async agregarCancha(nombre, id_deporte, nombre_deporte, apertura, cierre, precio) {
        try {
            const validacion = Cancha.validarDatos(nombre, id_deporte, apertura, cierre, precio);
            if (!validacion.valid) {
                return { success: false, error: validacion.error };
            }

            // 1. Usamiento del Patrón Factory Method
            const nuevaCanchaObj = CanchaFactory.crearCancha(
                nombre,
                id_deporte,
                nombre_deporte,
                apertura,
                cierre,
                precio
            );

            // 2. Persistencia en la Base de Datos a través de Supabase BaaS
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

            if (error) {
                throw new Error(error.message);
            }

            return { success: true, data };
        } catch (err) {
            console.error("Error en CanchaController:", err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Obtiene el listado de canchas registradas en la base de datos
     */
    static async getCanchas() {
        const { data, error } = await supabaseClient
            .from('canchas')
            .select('*, tipo_deporte(descripcion)');
        
        if (error) {
            console.error("Error obteniendo canchas:", error);
            return [];
        }
        return data;
    }

    /**
     * Elimina una cancha por su ID
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
     * Actualiza una cancha existente en base a su ID
     */
    static async actualizarCancha(id_cancha, datosFormulario) {
        try {
            const validacion = Cancha.validarDatos(
                datosFormulario.nombre, 
                datosFormulario.id_deporte, 
                datosFormulario.hora_apertura, 
                datosFormulario.hora_cierre, 
                datosFormulario.precio
            );
            if (!validacion.valid) {
                return { success: false, error: validacion.error };
            }

            // Utilizamos el factory para validar/crear el objeto actualizado
            const canchaObj = CanchaFactory.crearCancha(
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

            if (error) {
                throw new Error(error.message);
            }

            return { success: true, data };
        } catch (err) {
            console.error("Error al actualizar la cancha:", err);
            return { success: false, error: err.message };
        }
    }

}
