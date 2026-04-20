export class Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        this.nombre = nombre;
        this.tipo_deporte = tipo_deporte;
        this.hora_apertura = hora_apertura;
        this.hora_cierre = hora_cierre;
        this.precio = parseFloat(precio);
    }

    obtenerRequisitos() {
        return `Uso de calzado adecuado para ${this.tipo_deporte}`;
    }
}

export class CanchaFutbol extends Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
    }

    obtenerRequisitos() {
        return super.obtenerRequisitos() + ". Canilleras obligatorias.";
    }
}

export class CanchaPadel extends Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
    }

    obtenerRequisitos() {
        return super.obtenerRequisitos() + ". Uso de paleta reglamentaria.";
    }
}

export class CanchaTenis extends Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
    }

    obtenerRequisitos() {
        return super.obtenerRequisitos() + ". Polvo de ladrillo: calzado especial requerido.";
    }
}
