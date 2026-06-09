import { Cancha, CanchaFutbol, CanchaPadel, CanchaTenis } from './cancha.js';

/**
 * Factory Method para instanciar subclases de Cancha según el deporte.
 * @class
 */
export class CanchaFactory {
    /**
     * Crea la instancia correspondiente de Cancha.
     * @param {number|null} id_cancha 
     * @param {string} nombre 
     * @param {number} id_deporte 
     * @param {string} nombre_deporte 
     * @param {string} hora_apertura 
     * @param {string} hora_cierre 
     * @param {number} precio 
     * @returns {Cancha} Una instancia de CanchaFutbol, CanchaPadel, CanchaTenis o genérica.
     */
    static crearCancha(id_cancha, nombre, id_deporte, nombre_deporte, hora_apertura, hora_cierre, precio) {
        const tipoLower = nombre_deporte ? nombre_deporte.toLowerCase() : '';

        if (tipoLower.includes('futbol') || tipoLower.includes('fútbol')) {
            return new CanchaFutbol(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
        } else if (tipoLower.includes('padel') || tipoLower.includes('pádel')) {
            return new CanchaPadel(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
        } else if (tipoLower.includes('tenis')) {
            return new CanchaTenis(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
        } else {
            // Fallback genérico a Cancha
            return new Cancha(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
        }
    }
}
