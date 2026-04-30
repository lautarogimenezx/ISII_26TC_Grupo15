export class Cancha {
    constructor(nombre, id_deporte, hora_apertura, hora_cierre, precio) {
        this.nombre = nombre;
        this.id_deporte = id_deporte;
        this.hora_apertura = hora_apertura;
        this.hora_cierre = hora_cierre;
        this.precio = parseFloat(precio);
    }

    static validarDatos(nombre, tipo, apertura, cierre, precio) {
        if (!nombre || nombre.trim() === '') return { valid: false, error: "El nombre es obligatorio." };
        if (!tipo || tipo.trim() === '') return { valid: false, error: "El tipo de deporte es obligatorio." };
        if (!apertura) return { valid: false, error: "La hora de apertura es obligatoria." };
        if (!cierre) return { valid: false, error: "La hora de cierre es obligatoria." };
        if (apertura.toString() >= cierre.toString()) return { valid: false, error: "La apertura debe ser antes del cierre." };
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
