/**
 * @file Lógica del panel administrativo privado.
 * @description Permite a los administradores gestionar canchas, parámetros globales y visualizar cancelaciones.
 */
import { Cancha } from '../capaDeLogica/cancha.js';
import { ConfigController } from '../capaDeLogica/configController.js';
import { AuthService } from '../capaDeLogica/authService.js';
import { Tipo_Deporte } from '../capaDeLogica/tipoDeporte.js';
import { UI } from './ui.js';

let globalCanchas = [];
let editandoId = null;

// Guardián de seguridad (Auth Guard)
window.addEventListener('load', async () => {
    await AuthService.requireAuth('login.html');
    window.cargarConfigGlobal();
    window.cargarTiposCancha();
});

window.cerrarSesion = async () => {
    await AuthService.logout();
    window.location.href = 'login.html';
};

// Configuración Global del Club
window.cargarConfigGlobal = async () => {
    const config = await ConfigController.getConfig();
    if (config) {
        document.getElementById('club-global-name').value = config.nombre;
        document.getElementById('club-global-ws').value = config.telefono_whatsapp;
        document.getElementById('club-global-bank').value = config.detalles_bancarios;
    }
};

window.abrirAgregarCancha = () => {
    window.cargarFormulario(); // Reset form
    const section = document.getElementById('court-form-section');
    if (section.classList.contains('hidden')) {
        window.toggleSection('court-form-section');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.toggleSection = (id) => {
    const section = document.getElementById(id);
    const icon = document.getElementById(id.replace('-section', '-icon'));
    const isHidden = section.classList.contains('hidden');
    
    if (isHidden) {
        section.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        section.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
};

window.cargarTiposCancha = async () => {
    const tipos = await Tipo_Deporte.obtenerTiposCancha();
    const select = document.getElementById('court-type');
    if (tipos && tipos.length > 0) {
        select.innerHTML = '<option value="">Selecciona un deporte</option>' + tipos.map(t => `<option value="${t.id_deporte}">${t.descripcion}</option>`).join('');
    } else {
        select.innerHTML = '<option value="">No hay deportes disponibles</option>';
    }
};

window.guardarConfigGlobal = async () => {
    const btn = document.getElementById('btn-save-global');
    btn.innerHTML = "Guardando...";
    btn.disabled = true;

    const datos = {
        nombre: document.getElementById('club-global-name').value.trim(),
        telefono_whatsapp: document.getElementById('club-global-ws').value.trim(),
        detalles_bancarios: document.getElementById('club-global-bank').value.trim()
    };

    const result = await ConfigController.updateConfig(datos);
    if(result.success) {
        UI.alert("Configuración comercial actualizada correctamente.", "Éxito", "success");
        window.toggleSection('club-config-section');
    } else {
        UI.alert("Error de permisos operando club_config: " + result.error, "Error", "error");
    }

    btn.innerHTML = "Actualizar Datos del Club";
    btn.disabled = false;
};

// Hacer disponible la función globalmente para el form
window.guardarCancha = async () => {
    const btn = document.getElementById('btn-save');
    const originalText = btn.innerHTML;
    btn.innerHTML = editandoId ? "Actualizando..." : "Guardando...";
    btn.disabled = true;

    const selectTipo = document.getElementById('court-type');
    const id_deporte = selectTipo.value;
    const nombre_deporte = selectTipo.options[selectTipo.selectedIndex] ? selectTipo.options[selectTipo.selectedIndex].text : '';

    const datos = {
        nombre: document.getElementById('court-name').value.trim(),
        id_deporte: id_deporte,
        nombre_deporte: nombre_deporte,
        hora_apertura: document.getElementById('court-open').value,
        hora_cierre: document.getElementById('court-close').value,
        precio: document.getElementById('court-price').value
    };

    let result;
    if (editandoId) {
        result = await Cancha.actualizarCancha(editandoId, datos);
    } else {
        result = await Cancha.agregarCancha(datos.nombre, datos.id_deporte, datos.nombre_deporte, datos.hora_apertura, datos.hora_cierre, datos.precio);
    }

    btn.innerHTML = editandoId ? "Actualizar Cancha" : "Guardar Cancha";
    btn.disabled = false;

    if (result.success) {
        UI.alert(editandoId ? "Cancha actualizada con éxito." : "Cancha registrada con éxito.", "Guardado Exitoso", "success");
        window.cargarFormulario();
        window.cargarListaCanchas();
        window.toggleSection('court-form-section');
    } else {
        UI.alert("Error al " + (editandoId ? "actualizar" : "guardar") + ": " + result.error, "Fallo al guardar", "error");
    }
};

window.cargarListaCanchas = async () => {
    const container = document.getElementById('courts-list');
    const countLabel = document.getElementById('courts-count');
    globalCanchas = await Cancha.getCanchas();

    if (globalCanchas.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 py-4">No hay canchas configuradas en la base de datos.</p>';
        countLabel.innerHTML = "0 canchas registradas";
        return;
    }

    countLabel.innerHTML = `${globalCanchas.length} canchas registradas`;
    
    // Agrupar canchas por deporte
    const canchasPorDeporte = {};
    globalCanchas.forEach(c => {
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

    let html = '';
    for (const [deporte, canchas] of Object.entries(canchasPorDeporte)) {
        html += `<h3 class="text-lg font-bold text-gray-800 mt-6 mb-3 px-1 border-b pb-2"><span class="material-symbols-rounded align-middle mr-1 text-brand">${getIconoDeporte(deporte)}</span>${deporte}</h3>`;
        html += `<div class="space-y-3">`;
        html += canchas.map(c => `
            <div class="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                <div>
                    <p class="font-bold text-gray-900">${c.nombre}</p>
                    <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">${c.hora_apertura ? c.hora_apertura.substring(0, 5) : ''} a ${c.hora_cierre ? c.hora_cierre.substring(0, 5) : ''} • $${c.precio}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.cargarFormulario('${c.id_cancha}')" class="text-blue-500 hover:text-blue-700 bg-white shadow-sm rounded-full p-2 border border-gray-100 transition-colors" title="Editar Cancha">
                        <span class="material-symbols-rounded block text-sm">edit</span>
                    </button>
                    <button onclick="window.borrarCancha('${c.id_cancha}')" class="text-red-400 hover:text-red-600 bg-white shadow-sm rounded-full p-2 border border-gray-100 transition-colors" title="Eliminar Cancha">
                        <span class="material-symbols-rounded block text-sm">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
        html += `</div>`;
    }
    container.innerHTML = html;
};

window.cargarFormulario = (id_cancha) => {
    if (!id_cancha) {
        // Caso Agregar Cancha
        editandoId = null;
        document.getElementById('court-form').reset();
        document.getElementById('form-title').innerHTML = `<span class="material-symbols-rounded text-brand">add_circle</span> Nueva Cancha`;
        document.getElementById('btn-save').innerHTML = "Guardar Cancha";
        document.getElementById('btn-save').classList.remove('bg-blue-600', 'hover:bg-blue-700');
        document.getElementById('btn-save').classList.add('bg-brand', 'hover:bg-green-500');
        document.getElementById('btn-cancel').classList.add('hidden');
        return;
    }

    const cancha = globalCanchas.find(c => c.id_cancha === id_cancha);
    if(!cancha) return;

    editandoId = id_cancha;
    document.getElementById('court-name').value = cancha.nombre;
    document.getElementById('court-type').value = cancha.id_deporte;
    document.getElementById('court-open').value = cancha.hora_apertura;
    document.getElementById('court-close').value = cancha.hora_cierre;
    document.getElementById('court-price').value = cancha.precio;

    document.getElementById('form-title').innerHTML = `<span class="material-symbols-rounded text-blue-500">edit</span> Editar Cancha`;
    document.getElementById('btn-save').innerHTML = "Actualizar Cancha";
    document.getElementById('btn-save').classList.remove('bg-brand', 'hover:bg-green-500');
    document.getElementById('btn-save').classList.add('bg-blue-600', 'hover:bg-blue-700');
    document.getElementById('btn-cancel').classList.remove('hidden');

    // Abrir la sección si está cerrada
    const section = document.getElementById('court-form-section');
    if (section.classList.contains('hidden')) {
        window.toggleSection('court-form-section');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelarEdicion = () => {
    window.cargarFormulario();
};

window.borrarCancha = (id_cancha) => {
    UI.confirm(
        "¿Estás seguro de eliminar esta cancha? Si tiene reservas asignadas, se producirá un error debido a la integridad referencial.",
        async () => {
            const result = await Cancha.eliminarCancha(id_cancha);
            if (result.success) {
                window.cargarListaCanchas();
            } else {
                UI.alert("Error RLS o Integridad Relacional: " + result.error, "No se pudo borrar", "error");
            }
        },
        "Borrar Cancha"
    );
};

// Carga inicial
window.cargarListaCanchas();
