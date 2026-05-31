export class Cancha {
    constructor(nombre, id_deporte, hora_apertura, hora_cierre, precio) {
        this.nombre = nombre;
        this.id_deporte = id_deporte;
        this.hora_apertura = hora_apertura;
        this.hora_cierre = hora_cierre;
        this.precio = parseFloat(precio);
    }

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
}

export class CanchaFutbol extends Cancha {
    constructor(nombre, id_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, id_deporte, hora_apertura, hora_cierre, precio);
    }
}

export class CanchaPadel extends Cancha {
    constructor(nombre, id_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, id_deporte, hora_apertura, hora_cierre, precio);
    }
}

export class CanchaTenis extends Cancha {
    constructor(nombre, id_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, id_deporte, hora_apertura, hora_cierre, precio);
    }
}
