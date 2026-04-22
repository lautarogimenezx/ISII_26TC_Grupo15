export class Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        this.nombre = nombre;
        this.tipo_deporte = tipo_deporte;
        this.hora_apertura = hora_apertura;
        this.hora_cierre = hora_cierre;
        this.precio = parseFloat(precio);
    }
}

export class CanchaFutbol extends Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
    }
}

export class CanchaPadel extends Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
    }
}

export class CanchaTenis extends Cancha {
    constructor(nombre, tipo_deporte, hora_apertura, hora_cierre, precio) {
        super(nombre, tipo_deporte, hora_apertura, hora_cierre, precio);
    }
}
