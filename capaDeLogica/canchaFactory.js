import { Cancha, CanchaFutbol, CanchaPadel, CanchaTenis, CanchaBasquet, CanchaVoley } from './cancha.js';

// Objeto que asocia el nombre exacto del deporte (según el select de la UI) con la clase de dominio.
const RegistroDeCanchas = {
    'Fútbol': CanchaFutbol,
    'Pádel': CanchaPadel,
    'Tenis': CanchaTenis,
    'Básquet': CanchaBasquet,
    'Vóley': CanchaVoley
};

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
     * @returns {Cancha} Una instancia específica de la cancha o genérica.
     */
    static crearCancha(id_cancha, nombre, id_deporte, nombre_deporte, hora_apertura, hora_cierre, precio) {
        // 1. Buscamos la clase en el registro usando la descripción literal del deporte
        const ClaseAInstanciar = RegistroDeCanchas[nombre_deporte];

        // 2. Si el deporte no está registrado, utilizamos la clase genérica Cancha
        const ClaseFinal = ClaseAInstanciar ? ClaseAInstanciar : Cancha;

        // 3. Instanciamos dinámicamente y retornamos el objeto sin usar condicionales
        return new ClaseFinal(id_cancha, nombre, hora_apertura, hora_cierre, precio, id_deporte);
    }
}
