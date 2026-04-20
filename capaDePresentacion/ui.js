export class UI {
    static showModal({ title, message, type = 'info', confirmText = 'Aceptar', cancelText = 'Cancelar', onConfirm = null }) {
        // Eliminar modal anterior si existe
        const existing = document.getElementById('ui-global-modal');
        if (existing) existing.remove();

        // Determinar colores y botón de confirmación basados en tipo
        let icon = 'info';
        let colorClass = 'text-blue-500';
        let bgIconClass = 'bg-blue-50';
        let btnConfirmClass = 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30';

        if (type === 'error') {
            icon = 'error';
            colorClass = 'text-red-500';
            bgIconClass = 'bg-red-50';
            btnConfirmClass = 'bg-red-600 hover:bg-red-700 shadow-red-500/30';
        } else if (type === 'success') {
            icon = 'check_circle';
            colorClass = 'text-green-500';
            bgIconClass = 'bg-green-50';
            btnConfirmClass = 'bg-green-600 hover:bg-green-700 shadow-green-500/30';
        } else if (type === 'confirm') {
            icon = 'help';
            colorClass = 'text-amber-500';
            bgIconClass = 'bg-amber-50';
            btnConfirmClass = 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 text-white';
        }

        const overlay = document.createElement('div');
        overlay.id = 'ui-global-modal';
        overlay.className = 'fixed inset-0 z-[100] bg-dark/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 opacity-0';

        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl transform scale-95 transition-all duration-300 relative';
        
        // Contenido
        modal.innerHTML = `
            <div class="w-16 h-16 ${bgIconClass} ${colorClass} rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <span class="material-symbols-rounded text-3xl">${icon}</span>
            </div>
            <h3 class="text-xl font-bold mb-2 text-center text-gray-900">${title}</h3>
            <p class="text-sm text-gray-500 font-medium mb-6 text-center leading-relaxed">${message}</p>
            <div class="flex gap-3" id="ui-modal-actions">
                ${type === 'confirm' ? `<button id="ui-btn-cancel" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm">
                    ${cancelText}
                </button>` : ''}
                <button id="ui-btn-confirm" class="flex-1 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 text-sm ${btnConfirmClass}">
                    ${confirmText}
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const closeFunc = () => {
            overlay.classList.add('opacity-0');
            modal.classList.add('scale-95');
            setTimeout(() => overlay.remove(), 300);
        };

        // Eventos
        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            modal.classList.remove('scale-95');
        });

        document.getElementById('ui-btn-confirm').addEventListener('click', () => {
            closeFunc();
            if (onConfirm) onConfirm();
        });

        if (type === 'confirm') {
            document.getElementById('ui-btn-cancel').addEventListener('click', closeFunc);
        }
    }

    static alert(message, title = 'Aviso', type = 'info') {
        this.showModal({ title, message, type });
    }

    static confirm(message, onConfirm, title = 'Confirmar Acción') {
        this.showModal({ title, message, type: 'confirm', confirmText: 'Si, seguro', onConfirm });
    }
}
