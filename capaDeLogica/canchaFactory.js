import { Cancha, CanchaFutbol, CanchaPadel, CanchaTenis } from './cancha.js';

export class CanchaFactory {
    static crearCancha(nombre, id_deporte, nombre_deporte, hora_apertura, hora_cierre, precio) {
        const tipoLower = nombre_deporte ? nombre_deporte.toLowerCase() : '';

        if (tipoLower.includes('futbol') || tipoLower.includes('fútbol')) {
            return new CanchaFutbol(nombre, id_deporte, hora_apertura, hora_cierre, precio);
        } else if (tipoLower.includes('padel') || tipoLower.includes('pádel')) {
            return new CanchaPadel(nombre, id_deporte, hora_apertura, hora_cierre, precio);
        } else if (tipoLower.includes('tenis')) {
            return new CanchaTenis(nombre, id_deporte, hora_apertura, hora_cierre, precio);
        } else {
            // Fallback genérico a Cancha
            return new Cancha(nombre, id_deporte, hora_apertura, hora_cierre, precio);
        }
    }
}
