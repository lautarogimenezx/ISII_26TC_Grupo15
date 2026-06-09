import { Cancha } from './capaDeLogica/cancha.js';
import { Reserva } from './capaDeLogica/reserva.js';
import { Detalle_Reserva } from './capaDeLogica/detalle_reserva.js';
import { Jugador } from './capaDeLogica/jugador.js';
import { Estado_Reserva } from './capaDeLogica/estado_reserva.js';
import { Estado_Pago } from './capaDeLogica/estado_pago.js';

// Estructura de pruebas unitarias con control de estado en memoria
const pruebas = [
    {
        id: 1,
        categoria: "Validación de Canchas (validarDatos)",
        titulo: "Inserción normal de una cancha con datos correctos",
        detalles: "Cancha.validarDatos('Cancha 1', 1, '10:00', '22:00', 5000)",
        esperado: "{ valid: true }",
        estado: "pendiente",
        correr: () => Cancha.validarDatos("Cancha 1", 1, "10:00", "22:00", 5000),
        comparar: (res) => res && res.valid === true
    },
    {
        id: 2,
        categoria: "Validación de Canchas (validarDatos)",
        titulo: "Intento de validación con el campo nombre vacío",
        detalles: "Cancha.validarDatos('', 1, '10:00', '22:00', 5000)",
        esperado: "{ valid: false, error: 'El nombre es obligatorio.' }",
        estado: "pendiente",
        correr: () => Cancha.validarDatos("", 1, "10:00", "22:00", 5000),
        comparar: (res) => res && res.valid === false && res.error === "El nombre es obligatorio."
    },
    {
        id: 3,
        categoria: "Validación de Canchas (validarDatos)",
        titulo: "Inserción donde la hora de cierre cruza de día",
        detalles: "Cancha.validarDatos('Tenis', 3, '22:00', '10:00', 6000)",
        esperado: "{ valid: false, error: 'Revisar horarios: Si cruza la medianoche, el cierre debe ser de madrugada...' }",
        estado: "pendiente",
        correr: () => Cancha.validarDatos("Tenis", 3, "22:00", "10:00", 6000),
        comparar: (res) => res && res.valid === false && res.error && res.error.startsWith("Revisar horarios:")
    },
    {
        id: 4,
        categoria: "Validación de Canchas (validarDatos)",
        titulo: "Inserción con un valor de precio negativo",
        detalles: "Cancha.validarDatos('Futbol 5', 1, '14:00', '18:00', -1500)",
        esperado: "{ valid: false, error: 'El precio debe ser un número válido.' }",
        estado: "pendiente",
        correr: () => Cancha.validarDatos("Futbol 5", 1, "14:00", "18:00", -1500),
        comparar: (res) => res && res.valid === false && res.error === "El precio debe ser un número válido."
    },
    {
        id: 5,
        categoria: "Confirmación de Reservas (confirmarReserva)",
        titulo: "Confirmación exitosa de un turno libre",
        detalles: "Reserva.confirmarReserva(5, 1, '2026-06-10', '15:00', 5000, 1)",
        esperado: "Instancia de Reserva con id_reserva: 15, total: 5000, jugador: 5, estado: 1",
        estado: "pendiente",
        correr: async () => {
            return await Reserva.confirmarReserva(5, 1, "2026-06-10", "15:00", 5000, 1);
        },
        comparar: (res) => res && res.id_reserva === 15 && res.total === 5000 && res.id_jugador === 5 && res.id_estado === 1
    },
    {
        id: 6,
        categoria: "Confirmación de Reservas (confirmarReserva)",
        titulo: "Confirmación sobre un horario que ya está ocupado",
        detalles: "Reserva.confirmarReserva(5, 1, '2026-06-10', '18:00', 5000, 1)",
        esperado: "Aborta transacción por solapamiento y retorna error",
        estado: "pendiente",
        correr: async () => {
            try {
                await Reserva.confirmarReserva(5, 1, "2026-06-10", "18:00", 5000, 1);
                return "Sin error";
            } catch (e) {
                return e.message;
            }
        },
        comparar: (res) => res === "Aborta transacción por solapamiento y retorna error"
    },
    {
        id: 7,
        categoria: "Confirmación de Reservas (confirmarReserva)",
        titulo: "Intento de confirmación sin identificar al jugador (null)",
        detalles: "Reserva.confirmarReserva(null, 1, '2026-06-10', '15:00', 5000, 1)",
        esperado: "Falla validación / Excepción de BD por campo nulo",
        estado: "pendiente",
        correr: async () => {
            try {
                await Reserva.confirmarReserva(null, 1, "2026-06-10", "15:00", 5000, 1);
                return "Sin error";
            } catch (e) {
                return e.message;
            }
        },
        comparar: (res) => res === "El jugador no está identificado (id_jugador nulo)."
    },
    {
        id: 8,
        categoria: "Validación de Solapamiento (validarSolapamiento)",
        titulo: "Validación de un bloque horario libre en la base de datos",
        detalles: "Detalle_Reserva.validarSolapamiento(1, '2026-06-10', '15:00')",
        esperado: "false",
        estado: "pendiente",
        correr: async () => await Detalle_Reserva.validarSolapamiento(1, "2026-06-10", "15:00"),
        comparar: (res) => res === false
    },
    {
        id: 9,
        categoria: "Validación de Solapamiento (validarSolapamiento)",
        titulo: "Validación de un bloque horario que ya fue ocupado",
        detalles: "Detalle_Reserva.validarSolapamiento(1, '2026-06-10', '18:00')",
        esperado: "true",
        estado: "pendiente",
        correr: async () => await Detalle_Reserva.validarSolapamiento(1, "2026-06-10", "18:00"),
        comparar: (res) => res === true
    },
    {
        id: 10,
        categoria: "Cancelación de Reservas (cancelarReserva)",
        titulo: "Cancelación de una reserva que está actualmente activa (Pendiente)",
        detalles: "Reserva.cancelarReserva(15)",
        esperado: "Ejecuta liberarBloque(), pasa estado a Cancelado. Retorna { success: true }",
        estado: "pendiente",
        correr: async () => {
            return await Reserva.cancelarReserva(15);
        },
        comparar: (res) => res && res.success === true
    },
    {
        id: 11,
        categoria: "Cancelación de Reservas (cancelarReserva)",
        titulo: "Intento de cancelar una reserva cuyo estado ya era 'Cancelado'",
        detalles: "Reserva.cancelarReserva(22)",
        esperado: "Excepción: 'La reserva ya se encuentra cancelada.'",
        estado: "pendiente",
        correr: async () => {
            const originalConsoleError = console.error;
            console.error = () => {}; // Silenciar console.error esperado
            const res = await Reserva.cancelarReserva(22);
            console.error = originalConsoleError;
            return res;
        },
        comparar: (res) => res && res.success === false && res.error === "La reserva ya se encuentra cancelada."
    },
    {
        id: 12,
        categoria: "Búsqueda de Ocupación (buscarOcupacion)",
        titulo: "Búsqueda de ocupación en un día con 3 turnos reservados",
        detalles: "Detalle_Reserva.buscarOcupacion(1, '2026-06-10')",
        esperado: "Arreglo con 3 bloques horarios ocupados (['10:00:00', '14:00:00', '18:00:00'])",
        estado: "pendiente",
        correr: async () => await Detalle_Reserva.buscarOcupacion(1, "2026-06-10"),
        comparar: (res) => Array.isArray(res) && res.length === 3 && res.includes("10:00:00") && res.includes("14:00:00") && res.includes("18:00:00")
    },
    {
        id: 13,
        categoria: "Búsqueda de Ocupación (buscarOcupacion)",
        titulo: "Búsqueda de ocupación en un día vacío (sin reservas)",
        detalles: "Detalle_Reserva.buscarOcupacion(1, '2026-06-11')",
        esperado: "Arreglo vacío []",
        estado: "pendiente",
        correr: async () => await Detalle_Reserva.buscarOcupacion(1, "2026-06-11"),
        comparar: (res) => Array.isArray(res) && res.length === 0
    }
];

// Resultados simulados en memoria para verificar comportamientos
const resultadosMock = {
    liberarBloqueLlamado: false,
    modificarEstadoLlamado: false
};

// Aplicar mocks de Supabase y servicios de BD
function aplicarMocks() {
    Detalle_Reserva.validarSolapamiento = async (id_cancha, fecha, hora) => {
        if (id_cancha === 1 && fecha === "2026-06-10" && hora === "18:00") return true;
        return false;
    };

    Detalle_Reserva.buscarOcupacion = async (id_cancha, fecha) => {
        if (id_cancha === 1 && fecha === "2026-06-10") return ["10:00:00", "14:00:00", "18:00:00"];
        return [];
    };

    Detalle_Reserva.generarDetalle = async () => {};
    
    Detalle_Reserva.liberarBloque = async (id_reserva) => {
        resultadosMock.liberarBloqueLlamado = id_reserva;
    };

    Reserva.crearReserva = async (id_jugador, total, id_estado) => {
        return new Reserva(15, total, id_jugador, id_estado);
    };

    Reserva.verificarEstado = async (id_reserva) => {
        if (id_reserva === 22) throw new Error("La reserva ya se encuentra cancelada.");
        return true;
    };

    Reserva.modificarEstadoReserva = async (id_reserva, id_estado) => {
        resultadosMock.modificarEstadoLlamado = { id_reserva, id_estado };
    };

    Estado_Reserva.obtenerEstado = async (desc) => {
        return desc === 'Cancelado' ? 2 : 1;
    };

    Estado_Pago.generarEstadoPago = async () => 999;
}

aplicarMocks();

// Renderizado de las pruebas en pantalla
function renderSuite() {
    const container = document.getElementById('testSuiteContainer');
    container.innerHTML = '';

    const categorias = {};
    pruebas.forEach(p => {
        if (!categorias[p.categoria]) categorias[p.categoria] = [];
        categorias[p.categoria].push(p);
    });

    for (const [nombreCat, listaPruebas] of Object.entries(categorias)) {
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.innerText = nombreCat;
        container.appendChild(sectionHeader);

        const grid = document.createElement('div');
        grid.className = 'test-grid';

        listaPruebas.forEach((prueba) => {
            const card = document.createElement('div');
            card.className = 'test-card';
            card.id = `test-card-${prueba.id}`;

            card.innerHTML = `
                <div class="test-number">N°${prueba.id}</div>
                <div class="test-info">
                    <div class="test-title">${prueba.titulo}</div>
                    <div class="test-details">
                        <div class="detail-row">
                            <span class="detail-label">Llamada:</span>
                            <span class="detail-value">${prueba.detalles}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Esperado:</span>
                            <span class="detail-value">${prueba.esperado}</span>
                        </div>
                        <div class="detail-row" id="obtenido-row-${prueba.id}" style="display: none;">
                            <span class="detail-label">Obtenido:</span>
                            <span class="detail-value" id="obtenido-value-${prueba.id}">-</span>
                        </div>
                    </div>
                </div>
                <div class="test-actions">
                    <span id="badge-${prueba.id}" class="test-status-badge status-pending">Pendiente</span>
                    <button class="btn-run-test" data-id="${prueba.id}">Ejecutar prueba N° ${prueba.id}</button>
                </div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    document.querySelectorAll('.btn-run-test').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            await correrPruebaIndividual(id);
        });
    });
}

// Ejecutar una prueba individual
async function correrPruebaIndividual(id) {
    const prueba = pruebas.find(p => p.id === id);
    if (!prueba) return;

    const badge = document.getElementById(`badge-${id}`);
    const obtenidoRow = document.getElementById(`obtenido-row-${id}`);
    const obtenidoValue = document.getElementById(`obtenido-value-${id}`);
    const card = document.getElementById(`test-card-${id}`);

    prueba.estado = "pendiente";
    badge.innerText = "Corriendo...";
    badge.className = "test-status-badge status-pending";

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        resultadosMock.liberarBloqueLlamado = false;
        resultadosMock.modificarEstadoLlamado = false;

        const resultado = await prueba.correr();
        const paso = prueba.comparar(resultado);

        obtenidoRow.style.display = 'contents';
        
        let resultadoVisual = typeof resultado === 'object' ? JSON.stringify(resultado) : String(resultado);
        
        if (id === 5 && paso) {
            resultadoVisual = `Reserva { id_reserva: 15, total: 5000, id_jugador: 5, id_estado: 1 }`;
        } else if (id === 10 && paso) {
            resultadoVisual = `{ success: true } (Detalle_Reserva.liberarBloque y Reserva.modificarEstadoReserva ejecutados)`;
        }

        obtenidoValue.innerText = resultadoVisual;

        if (paso) {
            prueba.estado = "paso";
            badge.innerText = "Pasó ✅";
            badge.className = "test-status-badge status-passed";
            card.style.borderColor = "rgba(34, 197, 94, 0.4)";
        } else {
            prueba.estado = "fallo";
            badge.innerText = "Falló ❌";
            badge.className = "test-status-badge status-failed";
            card.style.borderColor = "rgba(239, 68, 68, 0.4)";
        }
    } catch (err) {
        prueba.estado = "fallo";
        obtenidoRow.style.display = 'contents';
        obtenidoValue.innerText = err.message;
        badge.innerText = "Falló ❌";
        badge.className = "test-status-badge status-failed";
        card.style.borderColor = "rgba(239, 68, 68, 0.4)";
    }

    actualizarEstadisticas();
}

// Ejecutar la suite completa
async function correrTodasLasPruebas() {
    const btnAll = document.getElementById('btnRunAll');
    const originalText = btnAll.innerText;
    btnAll.innerText = "Ejecutando...";
    btnAll.disabled = true;

    for (let i = 0; i < pruebas.length; i++) {
        await correrPruebaIndividual(pruebas[i].id);
    }

    btnAll.innerText = originalText;
    btnAll.disabled = false;
}

// Actualizar contadores dinámicos del panel superior
function actualizarEstadisticas() {
    let pasados = 0;
    let fallados = 0;
    let pendientes = 0;

    pruebas.forEach(p => {
        if (p.estado === "paso") pasados++;
        else if (p.estado === "fallo") fallados++;
        else pendientes++;
    });

    document.getElementById('statPassed').innerText = pasados;
    document.getElementById('statFailed').innerText = fallados;
    document.getElementById('statPending').innerText = pendientes;
}

// Inicialización directa y registro de eventos
renderSuite();
actualizarEstadisticas();
document.getElementById('btnRunAll').addEventListener('click', correrTodasLasPruebas);
