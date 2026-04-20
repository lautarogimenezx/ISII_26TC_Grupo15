import { supabaseClient } from '../capaDeDatos/supabaseClient.js';
import { CanchaFactory } from './canchaFactory.js';

export class CanchaController {
    /**
     * Intercepta la creación de una cancha desde el formulario web
     * y utiliza la Factory para persistir el objeto adecuado en BD.
     */
    static async createCancha(nombre, tipo, apertura, cierre) {
        try {
            const precio = arguments[4] || 0;

            const aperturaStr = apertura.toString();
            const cierreStr = cierre.toString();
            if (aperturaStr >= cierreStr) {
                return { success: false, error: "Datos de horario incorrectos: la apertura debe ser antes del cierre." };
            }

            // 1. Usamiento del Patrón Factory Method
            const nuevaCanchaObj = CanchaFactory.crearCancha(
                nombre,
                tipo,
                apertura,
                cierre,
                precio
            );

            // Podemos loguear requisitos si quisiéramos para validar el Factory
            console.log("Creando cancha con Factory:", nuevaCanchaObj.obtenerRequisitos());

            // Soporte para Múltiples Clubes (SaaS) - Obtener ID del club base
            const { data: clubConfig } = await supabaseClient.from('club_config').select('id').limit(1).single();
            const clubId = clubConfig ? clubConfig.id : null;

            // 2. Persistencia en la Base de Datos a través de Supabase BaaS
            const { data, error } = await supabaseClient
                .from('canchas')
                .insert([{
                    nombre: nuevaCanchaObj.nombre,
                    tipo_deporte: nuevaCanchaObj.tipo_deporte,
                    hora_apertura: nuevaCanchaObj.hora_apertura,
                    hora_cierre: nuevaCanchaObj.hora_cierre,
                    precio: nuevaCanchaObj.precio,
                    club_id: clubId
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
            .select('*')
            .order('creado_en', { ascending: true });
        
        if (error) {
            console.error("Error obteniendo canchas:", error);
            return [];
        }
        return data;
    }

    /**
     * Elimina una cancha por su ID
     */
    static async eliminarCancha(id) {
        const { error } = await supabaseClient
            .from('canchas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error eliminando cancha:", error);
            return { success: false, error: error.message };
        }
        return { success: true };
    }

    /**
     * Actualiza una cancha existente en base a su ID
     */
    static async editarCancha(id, datosFormulario) {
        try {
            // Utilizamos el factory para validar/crear el objeto actualizado
            const canchaObj = CanchaFactory.crearCancha(
                datosFormulario.nombre,
                datosFormulario.tipo_deporte,
                datosFormulario.hora_apertura,
                datosFormulario.hora_cierre,
                datosFormulario.precio
            );

            const { data, error } = await supabaseClient
                .from('canchas')
                .update({
                    nombre: canchaObj.nombre,
                    tipo_deporte: canchaObj.tipo_deporte,
                    hora_apertura: canchaObj.hora_apertura,
                    hora_cierre: canchaObj.hora_cierre,
                    precio: canchaObj.precio
                })
                .eq('id', id)
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
