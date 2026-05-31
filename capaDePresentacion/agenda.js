import { ReservaController } from '../capaDeLogica/reservaController.js';
import { CanchaController } from '../capaDeLogica/canchaController.js';
import { ConfigController } from '../capaDeLogica/configController.js';
import { UI } from './ui.js';

let currentDate = new Date();
let selectedDateStr = "";
let canchasData = [];
let ocupacionData = [];
let clubConfig = null;
let todosLosJugadores = [];

let turnoSeleccionado = null; // { id_cancha, nombre_cancha, fecha, hora, precio }
let detallesTimeout = null; // Para manejar la transición visual del autocompletado sin parpadeos


document.addEventListener('DOMContentLoaded', async () => {
    // 1. REGISTRO SÍNCRONO E INMEDIATO DE LISTENERS (NADA DE AWAIT ANTES DE ESTO)
    const btnMisReservas = document.getElementById('btn-mis-reservas');
    if (btnMisReservas) {
        btnMisReservas.addEventListener('click', () => {
            window.abrirModalMisReservas();
        });
    }
    const btnCerrarMisReservas = document.getElementById('btn-cerrar-mis-reservas');
    if (btnCerrarMisReservas) {
        btnCerrarMisReservas.addEventListener('click', () => {
            window.cerrarModalMisReservas();
        });
    }

    inicializarCalendario();
    
    // Cargar config global
    clubConfig = await ConfigController.getConfig();
    if (clubConfig) {
        document.getElementById('club-title').innerText = clubConfig.nombre || "Turnos YA";
        
        // Parsear detalles bancarios (espera formato: Alias: X \n CBU: Y \n Titular: Z)
        // Por simplicidad, tomamos todo el texto para mostrarlo o lo dividimos
        const detalles = clubConfig.detalles_bancarios || "";
        const lines = detalles.split('\n');
        document.getElementById('club-alias').innerText = lines[0] || "cancha.mp";
        document.getElementById('club-titular').innerText = lines.length > 1 ? lines[1] : "Titular";
    }

    // Cargar canchas y jugadores pre-fetched para autocompletado instantáneo
    canchasData = await CanchaController.getCanchas();
    todosLosJugadores = await ReservaController.obtenerTodosJugadores();
    seleccionarFecha(currentDate);

    // Configurar listener email interactivo en tiempo real
    const emailInput = document.getElementById('jugador-email');
    emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim().toLowerCase();
        const detallesDiv = document.getElementById('jugador-detalles');
        
        // Regex básico para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Buscar si coincide exactamente con un jugador existente
        const jugador = todosLosJugadores.find(j => j.email.toLowerCase() === email);
        
        // Cancelar cualquier timeout de transición previo para evitar conflictos visuales
        if (detallesTimeout) {
            clearTimeout(detallesTimeout);
            detallesTimeout = null;
        }
        
        if (jugador) {
            // Es un jugador existente
            document.getElementById('jugador-nombre').value = jugador.nombre;
            document.getElementById('jugador-telefono').value = jugador.telefono;
            
            if (detallesDiv.classList.contains('hidden')) {
                detallesDiv.classList.remove('hidden');
                // Un pequeño delay para que la transición de opacidad se aplique correctamente
                setTimeout(() => detallesDiv.classList.remove('opacity-0'), 10);
            }
        } else if (emailRegex.test(email)) {
            // Es un email con formato válido pero no existe en la base de datos (jugador nuevo)
            document.getElementById('jugador-nombre').value = "";
            document.getElementById('jugador-telefono').value = "";
            
            if (detallesDiv.classList.contains('hidden')) {
                detallesDiv.classList.remove('hidden');
                setTimeout(() => detallesDiv.classList.remove('opacity-0'), 10);
            }
        } else {
            // No es un email válido ni coincide con nadie, limpiamos y ocultamos de manera fluida
            if (!detallesDiv.classList.contains('hidden')) {
                detallesDiv.classList.add('opacity-0');
                detallesTimeout = setTimeout(() => {
                    detallesDiv.classList.add('hidden');
                    document.getElementById('jugador-nombre').value = "";
                    document.getElementById('jugador-telefono').value = "";
                }, 500); // 500ms coincide con transition-opacity duration-500 del HTML
            } else {
                document.getElementById('jugador-nombre').value = "";
                document.getElementById('jugador-telefono').value = "";
            }
        }
    });

});

function inicializarCalendario() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = "";
    
    const hoy = new Date();
    
    // Generar 14 días
    for (let i = 0; i < 14; i++) {
        const d = new Date(hoy);
        d.setDate(hoy.getDate() + i);
        
        const dayStr = d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
        const dateNum = d.getDate();
        
        const card = document.createElement('div');
        card.className = `day-card flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 cursor-pointer bg-white select-none`;
        card.innerHTML = `
            <span class="text-xs font-bold opacity-70 mb-1">${dayStr}</span>
            <span class="text-2xl font-black">${dateNum}</span>
        `;
        
        card.onclick = (e) => {
            if (window.isDraggingDay) {
                e.preventDefault();
                return;
            }
            document.querySelectorAll('.day-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            seleccionarFecha(d);
        };
        
        // Seleccionar hoy por defecto
        if (i === 0) card.classList.add('selected');
        
        container.appendChild(card);
    }

    // Funcionalidad de drag-to-scroll para PC
    let isDown = false;
    let startX;
    let scrollLeft;
    window.isDraggingDay = false;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        window.isDraggingDay = false;
        container.classList.add('cursor-grabbing');
        container.classList.remove('cursor-grab');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('cursor-grabbing');
        container.classList.add('cursor-grab');
    });
    
    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('cursor-grabbing');
        container.classList.add('cursor-grab');
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Multiplicador de velocidad de arrastre
        if (Math.abs(walk) > 5) window.isDraggingDay = true;
        container.scrollLeft = scrollLeft - walk;
    });
    
    // Cursor visual de agarrar
    container.classList.add('cursor-grab');
}

async function seleccionarFecha(dateObj) {
    // Formato YYYY-MM-DD local
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
    selectedDateStr = (new Date(dateObj - tzoffset)).toISOString().split('T')[0];
    
    const labelOptions = { day: 'numeric', month: 'long' };
    document.getElementById('selected-date-label').innerText = dateObj.toLocaleDateString('es-ES', labelOptions);
    
    await renderizarCanchas();
}

async function renderizarCanchas() {
    const container = document.getElementById('courts-container');
    container.innerHTML = '<div class="text-center py-10"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div></div>';
    
    if (canchasData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 font-medium py-10">No hay canchas configuradas en el sistema.</p>';
        return;
    }

    container.innerHTML = "";
    
    // Agrupar por deporte
    const canchasPorDeporte = {};
    canchasData.forEach(c => {
        const deporte = c.tipo_deporte ? c.tipo_deporte.descripcion : 'Otros Deportes';
        if (!canchasPorDeporte[deporte]) canchasPorDeporte[deporte] = [];
        canchasPorDeporte[deporte].push(c);
    });

    const getIconoDeporte = (deporte) => {
        const d = deporte.toLowerCase();
        if (d.includes('futbol') || d.includes('fútbol')) return 'sports_soccer';
        if (d.includes('tenis') || d.includes('pádel') || d.includes('padel')) return 'sports_tennis';
        if (d.includes('basquet') || d.includes('básquet')) return 'sports_basketball';
        if (d.includes('voley') || d.includes('vóley')) return 'sports_volleyball';
        return 'sports_and_outdoors';
    };

    for (const [deporte, canchas] of Object.entries(canchasPorDeporte)) {
        // Título del Deporte
        const tituloHtml = document.createElement('h2');
        tituloHtml.className = "text-xl font-black text-gray-800 mt-6 mb-4 border-b-2 border-gray-100 pb-2 flex items-center gap-2";
        tituloHtml.innerHTML = `<span class="material-symbols-rounded text-brand">${getIconoDeporte(deporte)}</span> ${deporte}`;
        container.appendChild(tituloHtml);

        for (const cancha of canchas) {
            // Obtener horarios disponibles
            const matriz = await ReservaController.calcularDisponibilidadUI(cancha, selectedDateStr);
            
            const canchaHtml = document.createElement('div');
            canchaHtml.className = "bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6";
            
            const headerHtml = `
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-lg font-extrabold text-gray-900">${cancha.nombre}</h3>
                        <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">$${cancha.precio} x Turno</p>
                    </div>
                </div>
            `;
            
            const grillaHtml = document.createElement('div');
            grillaHtml.className = "grid grid-cols-4 sm:grid-cols-6 gap-2";
            
            if (matriz.length === 0) {
                grillaHtml.innerHTML = '<p class="col-span-full text-xs text-gray-500">No hay turnos configurados para esta cancha.</p>';
            }

            matriz.forEach(bloque => {
                const btn = document.createElement('button');
                btn.className = `time-slot w-full py-2.5 rounded-xl text-sm font-bold flex justify-center items-center ${bloque.disponible ? 'available' : 'booked'}`;
                btn.innerText = bloque.hora.substring(0, 5);
                btn.disabled = !bloque.disponible;
                
                if (bloque.disponible) {
                    btn.onclick = () => abrirModalReserva(cancha, bloque.hora);
                } else {
                    btn.innerHTML += `<span class="material-symbols-rounded text-xs ml-1 opacity-50">lock</span>`;
                }
                grillaHtml.appendChild(btn);
            });
            
            canchaHtml.innerHTML = headerHtml;
            canchaHtml.appendChild(grillaHtml);
            container.appendChild(canchaHtml);
        }
    }
}

window.abrirModalReserva = (cancha, hora) => {
    turnoSeleccionado = {
        id_cancha: cancha.id_cancha,
        nombre_cancha: cancha.nombre,
        precio: cancha.precio,
        fecha: selectedDateStr,
        hora: hora
    };
    
    document.getElementById('modal-cancha-nombre').innerText = cancha.nombre;
    const dateParts = selectedDateStr.split('-'); // YYYY-MM-DD
    const fechaFormat = `${dateParts[2]}/${dateParts[1]}`;
    document.getElementById('modal-fecha-hora').innerText = `${fechaFormat} - ${hora.substring(0,5)} hs`;
    document.getElementById('modal-precio').innerText = `$${cancha.precio}`;
    
    document.getElementById('reserva-form').reset();
    if (detallesTimeout) {
        clearTimeout(detallesTimeout);
        detallesTimeout = null;
    }
    document.getElementById('jugador-detalles').classList.add('opacity-0', 'hidden');
    window.togglePagoView();
    
    const modal = document.getElementById('modal-reserva');
    const modalContent = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    // small delay to allow display block to apply before opacity/scale transitions
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
};

window.cerrarModal = () => {
    const modal = document.getElementById('modal-reserva');
    const modalContent = document.getElementById('modal-content');
    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
    turnoSeleccionado = null;
};

window.togglePagoView = () => {
    const method = document.querySelector('input[name="metodo-pago"]:checked').value;
    const infoDiv = document.getElementById('transferencia-info');
    if (method === 'Transferencia') {
        infoDiv.classList.remove('hidden');
    } else {
        infoDiv.classList.add('hidden');
    }
};

window.copiarAlias = () => {
    const alias = document.getElementById('club-alias').innerText;
    navigator.clipboard.writeText(alias);
    UI.alert('Alias copiado al portapapeles', 'Copiado', 'success');
};

window.procesarReserva = async () => {
    const btn = document.getElementById('btn-confirmar');
    btn.innerHTML = '<span class="animate-spin material-symbols-rounded">refresh</span> Procesando...';
    btn.disabled = true;
    
    const email = document.getElementById('jugador-email').value.trim();
    const nombre = document.getElementById('jugador-nombre').value.trim();
    const telefono = document.getElementById('jugador-telefono').value.trim();
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
    
    try {
        const resultado = await ReservaController.confirmarReservaCompleta(
            email, nombre, telefono, 
            turnoSeleccionado, 
            metodoPago
        );
        
        if (resultado.success) {
            // Respaldamos los datos del turno seleccionado antes de cerrar el modal (que limpia la variable global)
            const turno = { ...turnoSeleccionado };
            window.cerrarModal();
            await renderizarCanchas(); // Refrescar matriz
            
            if (metodoPago === 'Transferencia') {
                const ws = clubConfig?.telefono_whatsapp || "543777622526";
                const msj = `Hola! Adjunto comprobante de pago para mi reserva en ${turno.nombre_cancha} el día ${turno.fecha} a las ${turno.hora}. Monto: $${turno.precio}.\n\nAdjunto comprobante de transferencia`;
                
                UI.showModal({
                    title: '¡Reserva Pre-confirmada!',
                    message: 'Se requiere el comprobante para validar tu pago.',
                    type: 'confirm',
                    confirmText: 'Enviar WhatsApp',
                    cancelText: 'Cerrar',
                    onConfirm: () => {
                        window.open(`https://wa.me/${ws}?text=${encodeURIComponent(msj)}`, '_blank');
                    }
                });
            } else {
                UI.alert('Tu turno está confirmado. ¡Te esperamos!', '¡Reserva Exitosa!', 'success');
            }
        } else {
            UI.alert(resultado.error, 'Error al reservar', 'error');
        }
    } catch (e) {
        UI.alert(e.message, 'Error inesperado', 'error');
    } finally {
        btn.innerHTML = 'Confirmar y Finalizar';
        btn.disabled = false;
    }
};

window.abrirModalMisReservas = () => {
    const modal = document.getElementById('modal-mis-reservas');
    const modalContent = document.getElementById('modal-mis-reservas-content');
    
    document.getElementById('consulta-email').value = "";
    document.getElementById('lista-reservas-container').innerHTML = `
        <div class="text-center py-8 text-gray-400">
            <span class="material-symbols-rounded text-5xl mb-2 opacity-50">calendar_today</span>
            <p class="text-sm font-medium">Ingresa tu correo arriba para buscar tus turnos activos y poder cancelarlos si lo deseas.</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
};

window.cerrarModalMisReservas = () => {
    const modal = document.getElementById('modal-mis-reservas');
    const modalContent = document.getElementById('modal-mis-reservas-content');
    
    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

window.buscarReservasActivas = async () => {
    const emailInput = document.getElementById('consulta-email');
    const email = emailInput.value.trim().toLowerCase();
    const btn = document.getElementById('btn-buscar-reservas');
    
    if (!email || !email.includes('@')) {
        UI.alert('Por favor ingresa un correo electrónico válido.', 'Correo Inválido', 'error');
        return;
    }
    
    btn.innerHTML = '<span class="animate-spin material-symbols-rounded">refresh</span>';
    btn.disabled = true;
    
    const container = document.getElementById('lista-reservas-container');
    container.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div></div>';
    
    try {
        const reservas = await ReservaController.obtenerReservasActivasPorEmail(email);
        
        if (reservas.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <span class="material-symbols-rounded text-5xl mb-2 opacity-50">event_busy</span>
                    <p class="text-sm font-medium">No encontramos ninguna reserva activa asociada a este correo.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = "";
        
        reservas.forEach(reserva => {
            const parts = reserva.fecha.split('-'); // YYYY-MM-DD
            const fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
            const horaFormateada = reserva.hora.substring(0, 5);
            
            let pagoBadgeClass = "bg-yellow-50 text-yellow-700 border-yellow-100";
            if (reserva.estadoPago.toLowerCase() === 'pagado') {
                pagoBadgeClass = "bg-green-50 text-green-700 border-green-100";
            }
            
            let btnComprobante = "";
            if (reserva.metodoPago === 'Transferencia' && reserva.estadoPago.toLowerCase() !== 'pagado') {
                const ws = clubConfig?.telefono_whatsapp || "543777622526";
                const msj = `Hola! Adjunto comprobante de pago para mi reserva en ${reserva.cancha} el día ${fechaFormateada} a las ${horaFormateada} hs. Monto: $${reserva.total}.

Adjunto comprobante de transferencia`;
                btnComprobante = `
                    <button onclick="window.open('https://wa.me/${ws}?text=${encodeURIComponent(msj)}', '_blank')" class="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                        <span class="material-symbols-rounded text-sm flex items-center justify-center">upload_file</span>
                        Enviar Comprobante
                    </button>
                `;
            }

            const card = document.createElement('div');
            card.className = "bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3 relative";
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-extrabold text-gray-800 text-sm">${reserva.cancha}</h4>
                        <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">${fechaFormateada} - ${horaFormateada} hs</p>
                    </div>
                    <span class="text-xs font-black text-gray-700 bg-white border border-gray-100 px-2.5 py-1 rounded-lg">$${reserva.total}</span>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-y-3 gap-x-2 pt-3 mt-1 border-t border-gray-100">
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md whitespace-nowrap ${pagoBadgeClass}">PAGO: ${reserva.estadoPago}</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-light/30 text-brand-dark border border-brand-light/50 rounded-md whitespace-nowrap">RESERVA: ${reserva.estado}</span>
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-2 ml-auto">
                        ${btnComprobante}
                        <button onclick="confirmarCancelarTurno('${reserva.id_reserva}', '${reserva.cancha}', '${fechaFormateada}', '${horaFormateada}')" class="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                            <span class="material-symbols-rounded text-sm flex items-center justify-center">cancel</span>
                            Cancelar
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error("Error al buscar reservas:", e);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <span class="material-symbols-rounded text-5xl mb-2 opacity-50">warning</span>
                <p class="text-sm font-medium">Ocurrió un error al consultar tus reservas. Inténtalo de nuevo.</p>
            </div>
        `;
    } finally {
        btn.innerHTML = '<span class="material-symbols-rounded flex items-center justify-center">search</span> Buscar';
        btn.disabled = false;
    }
};

window.confirmarCancelarTurno = (id_reserva, cancha, fecha, hora) => {
    UI.showModal({
        title: '¿Cancelar este turno?',
        message: `¿Estás seguro de que deseas cancelar tu reserva en <strong>${cancha}</strong> para el día <strong>${fecha}</strong> a las <strong>${hora} hs</strong>?<br><br>Esta acción liberará el horario de forma inmediata y no se puede deshacer.`,
        type: 'confirm',
        confirmText: 'Sí, Cancelar',
        cancelText: 'No, mantener',
        onConfirm: async () => {
            const container = document.getElementById('lista-reservas-container');
            container.innerHTML = '<div class="text-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-3"></div><p class="text-xs text-gray-500 font-bold">Cancelando reserva...</p></div>';
            
            try {
                const resultado = await ReservaController.cancelarReserva(id_reserva);
                if (resultado.success) {
                    UI.alert('Tu reserva ha sido cancelada correctamente y el horario ha sido liberado.', 'Cancelación Exitosa', 'success');
                    await buscarReservasActivas();
                    await renderizarCanchas();
                } else {
                    UI.alert(resultado.error, 'Error al cancelar', 'error');
                    await buscarReservasActivas();
                }
            } catch (err) {
                UI.alert(err.message, 'Error al cancelar', 'error');
                await buscarReservasActivas();
            }
        }
    });
};
