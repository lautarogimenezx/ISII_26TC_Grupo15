# Turnos YA - Reserva de Canchas

Una aplicación web moderna, rápida y responsiva diseñada para facilitar la gestión y reserva de canchas deportivas. Construida con un enfoque minimalista y optimizada tanto para administradores como para clientes.

## Descripción del Proyecto

El sistema "Turnos YA" permite a los jugadores visualizar un calendario interactivo con horarios disponibles en tiempo real y confirmar la reserva de turnos, asegurando la disponibilidad. Al mismo tiempo, ofrece a los administradores herramientas integrales para la gestión de canchas, control de disponibilidad y visualización de las reservas.

## Características Principales

- **Interfaz Intuitiva y Moderna**: Diseño responsivo y amigable para dispositivos móviles usando TailwindCSS y Glassmorphism.
- **Reserva de Turnos**: Selección de fechas, canchas y horarios disponibles con cálculo inteligente de la matriz de disponibilidad.
- **Panel de Administrador**: Gestión de configuración, disponibilidad, canchas y visualización de reservas.
- **Arquitectura Multicapa**: Código estructurado y organizado en capas claras para maximizar la mantenibilidad (Presentación, Lógica, Datos).
- **Control de Solapamiento**: Validación estricta para asegurar que cada reserva sea única en su horario.
- **BaaS PostgreSQL**: Base de datos gestionada e interconectada en tiempo real mediante Supabase.

## Arquitectura del Proyecto

El proyecto está diseñado bajo un estricto patrón de **Arquitectura Multicapa (Multi-Tier)**, dividiendo las responsabilidades en capas claras para favorecer la escalabilidad, separación de intereses (SoC) y fácil mantenibilidad.

### Mapa de Directorios (Distribución de Archivos)

```text
Turnos_YA/
├── capaDePresentacion/          # Capa Nivel 1: Interfaz de Usuario (UI)
│   ├── agenda.html              # Interfaz pública del motor de reservas y calendario
│   ├── agenda.js                # Lógica de renderizado frontend y listeners de la agenda
│   ├── configuracion.html       # Interfaz dinámica de gestión de canchas y club (Admin)
│   ├── configuracion.js         # Lógica visual del panel de configuración
│   ├── login.html               # Formulario de autenticación administrativa
│   ├── login.js                 # Lógica visual de inicio de sesión
│   ├── style.css                # Hoja de estilos complementaria (Tailwind y componentes)
│   └── ui.js                    # Utilidades de DOM globales (Renderizado de alertas y modales)
│
├── capaDeLogica/                # Capa Nivel 2: Reglas de Negocio y Controladores
│   ├── reservaController.js     # Controlador del motor de reservas, validación de solapamientos y transacciones
│   ├── canchaController.js      # Controlador encargado del CRUD y validación de Canchas
│   ├── tipoDeporte.js           # Servicio para gestión de tipos de deportes
│   ├── authService.js           # Validador y gestor seguro de las sesiones
│   ├── configController.js      # Gestiona datos y configuraciones globales
│   ├── canchaFactory.js         # Implementación del patrón Factory Method
│   └── cancha.js                # Modelo de dominio de Cancha con validaciones estáticas
│
└── capaDeDatos/                 # Capa Nivel 3: Persistencia y Acceso a Datos
    ├── supabaseClient.js        # Configuración Singleton de conexión al BaaS
    └── tablas_sql/              # Scripts SQL estructurados
```

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Estilos**: [TailwindCSS](https://tailwindcss.com/)
- **BaaS**: [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- **Iconografía**: Google Material Symbols Rounded

---
_Desarrollado para optimizar la gestión de centros deportivos._
