# Turnos YA - Reserva de Canchas

Una aplicación web moderna, rápida y responsiva diseñada para facilitar la gestión y reserva de canchas deportivas. Construida con un enfoque minimalista y optimizada tanto para administradores como para clientes.

## Características Principales

- **Interfaz Intuitiva y Moderna**: Diseño responsivo y amigable para dispositivos móviles usando TailwindCSS.
- **Reserva de Turnos**: Selección de fechas, canchas y horarios disponibles con formularios simples.
- **Panel de Administrador**: Gestión de configuración, disponibilidad, canchas y visualización de reservas.
- **Arquitectura Multicapa**: Código refactorizado y organizado en capas claras para maximizar la mantenibilidad (Presentación, Lógica, Datos).
- **Gestión de Base de Datos y Autenticación**: Impulsado por Supabase.

## Arquitectura del Proyecto

El proyecto está diseñado bajo un estricto patrón de **Arquitectura Multicapa (Multi-Tier)**, dividiendo las responsabilidades en capas claras para favorecer la escalabilidad, separación de intereses (SoC) y la fácil mantenibilidad.

### Mapa de Directorios (Distribución de Archivos)

```text
Turnos_YA/
├── capaDePresentacion/          # Capa Nivel 1: Interfaz de Usuario (UI)
│   ├── configuracion.html       # Interfaz de alta de canchas y definición de datos comerciales
│   ├── login.html               # Formulario de autenticación administrativa
│   ├── style.css                # Hoja de estilos complementaria (Tailwind)
│   └── ui.js                    # Utilidades de DOM globales (Renderizado de alertas y dialogos)
│
├── capaDeLogica/                # Capa Nivel 2: Reglas de Negocio y Controladores
│   ├── canchaController.js      # Controlador encargado del CRUD de Canchas
│   ├── authService.js           # Validador y gestor seguro de las sesiones
│   ├── configController.js      # Gestiona datos y configuraciones estables del sistema
│   ├── canchaFactory.js         # Implementación del patrón Factory Method para estructurar canchas
│   └── cancha.js                # Modelo abstracto del dominio
│
└── capaDeDatos/                 # Capa Nivel 3: Persistencia y Acceso a Datos
    ├── supabaseClient.js        # Patrón Singleton para conexión a BD y funciones SQL
    └── tablas_sql/              # Scripts SQL para inicializar la base de datos
```

**¿Cómo es el flujo de las cosas?**
1. Los archivos ubicados en la `capaDePresentacion` (Vistas) capturan la intención del usuario a través del DOM y eventos HTML.
2. Estos eventos son delegados inmediatamente a los **Controladores** y **Servicios** correspondientes dentro de la `capaDeLogica`, garantizando que la UI no decida nada.
3. La lógica examina el negocio (por ejemplo, usando `validarSolapamiento`), y si está todo en orden, se comunica bidireccionalmente con la `capaDeDatos` donde se orquestan las consultas asíncronas de Supabase.

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Estilos**: [TailwindCSS](https://tailwindcss.com/)
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com/) (Base de datos PostgreSQL y Autenticación)
- **Iconografía**: Google Material Symbols

## Vistas Principales

- `/Capa_de_Presentacion/login.html` -> Ingreso seguro para el personal/administradores.
- `/Capa_de_Presentacion/configuracion.html` -> Ajuste de reglas de negocio, horarios del predio y datos de pago.

---
_Desarrollado para optimizar la gestión de centros deportivos._
