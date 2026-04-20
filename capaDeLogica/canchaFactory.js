import { Cancha, CanchaFutbol, CanchaPadel, CanchaTenis } from './cancha.js';

export class CanchaFactory {
    static crearCancha(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        const tipoLower = tipo_deporte.toLowerCase();

        if (tipoLower.includes('futbol') || tipoLower.includes('fútbol')) {
            return new CanchaFutbol(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
        } else if (tipoLower.includes('padel') || tipoLower.includes('pádel')) {
            return new CanchaPadel(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
        } else if (tipoLower.includes('tenis')) {
            return new CanchaTenis(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
        } else {
            // Fallback genérico a Cancha
            return new Cancha(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
        }
    }
}
