# Turnos YA - Reserva de Canchas

Una aplicación web moderna, rápida y responsiva diseñada para facilitar la gestión y reserva de canchas deportivas. Construida con un enfoque minimalista y optimizada tanto para administradores como para clientes.

## Cambios Recientes (Adaptación a Cátedra)

El sistema ha sido refactorizado para cumplir estrictamente con los diagramas de Entidad-Relación (ER) y de Secuencia provistos por la cátedra:
- **Normalización de Base de Datos**: Implementación de tablas maestras para `tipo_deporte` y `estado_reserva`.
- **Relaciones Relacionales**: Reestructuración de la tabla `canchas` y `reserva` (antes `reservas`) para usar claves foráneas normalizadas e integridad referencial.
- **Validación de Negocio**: Incorporación de `validarDatos()` en la clase `Cancha` antes de la persistencia.
- **Flujo de Interfaz**: Refactorización de `configuracion.html` para seguir el flujo de carga dinámica de deportes y formularios dinámicos.

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
│   ├── configuracion.html       # Interfaz dinámica de gestión de canchas y club
│   ├── login.html               # Formulario de autenticación administrativa
│   ├── style.css                # Hoja de estilos complementaria (Tailwind)
│   └── ui.js                    # Utilidades de DOM globales (Renderizado de alertas y dialogos)
│
├── capaDeLogica/                # Capa Nivel 2: Reglas de Negocio y Controladores
│   ├── canchaController.js      # Controlador encargado del CRUD y validación de Canchas
│   ├── tipoDeporte.js           # Servicio para gestión de tipos de deportes desde BD
│   ├── authService.js           # Validador y gestor seguro de las sesiones
│   ├── configController.js      # Gestiona datos y configuraciones globales
│   ├── canchaFactory.js         # Implementación del patrón Factory Method
│   └── cancha.js                # Modelo de dominio con validaciones estáticas
│
└── capaDeDatos/                 # Capa Nivel 3: Persistencia y Acceso a Datos
    ├── supabaseClient.js        # Patrón Singleton y funciones de inserción relacional
    └── tablas_sql/              # Scripts SQL normalizados (ER compliant)
```

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Estilos**: [TailwindCSS](https://tailwindcss.com/)
- **BaaS**: [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- **Iconografía**: Google Material Symbols

---
_Desarrollado para optimizar la gestión de centros deportivos siguiendo lineamientos académicos._
