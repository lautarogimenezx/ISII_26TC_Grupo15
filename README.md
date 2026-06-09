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

El proyecto está diseñado bajo un estricto patrón de **Arquitectura Multicapa (Multi-Tier)** y **Programación Orientada a Objetos (POO)**, dividiendo las responsabilidades en capas claras y modelando las entidades para favorecer la escalabilidad, la separación de intereses (SoC) y hacer que el código coincida exactamente con los Diagramas de Clases, Diagramas de Secuencia y el DER.

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
├── capaDeLogica/                # Capa Nivel 2: Reglas de Negocio (POO)
│   ├── reserva.js               # Entidad que gestiona la lógica transaccional de reservas
│   ├── jugador.js               # Entidad que representa al cliente y su persistencia
│   ├── detalle_reserva.js       # Entidad que valida horarios y ocupación de bloques
│   ├── cancha.js                # Entidad de Cancha con validaciones estáticas y jerarquía
│   ├── canchaFactory.js         # Implementación del patrón Factory Method para canchas

│   ├── estado_pago.js           # Entidad para la facturación y estados transaccionales
│   ├── estado_reserva.js        # Entidad para catalogación del estado de la reserva
│   ├── tipoDeporte.js           # Catálogo de deportes
│   ├── authService.js           # Validador y gestor seguro de las sesiones
│   └── configController.js      # Gestiona datos y configuraciones globales
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

## Acceso al Sistema (Testing / Evaluación en Vivo)

El proyecto requiere un servidor local (como Live Server) debido al uso de módulos ES6 (`import`/`export`). Para facilitar la evaluación, **el proyecto está desplegado online en GitHub Pages**.

Para probar la funcionalidad completa del **Panel de Administración**, ingresa al siguiente enlace web:
- **URL Admin**: [Panel de Login](https://lautarogimenezx.github.io/ISII_26TC_Grupo15/capaDePresentacion/login.html)
- **Correo Electrónico**: `admin@gmail.com`
- **Contraseña**: `admin123`

Para ver la aplicación pública (Motor de Reservas), ingresa a:
- **URL Pública**: [Agenda de Turnos](https://lautarogimenezx.github.io/ISII_26TC_Grupo15/)

## Ejecución de Pruebas Unitarias (Tests)

El proyecto incluye un entorno interactivo para correr las pruebas unitarias que validan el motor de reservas y las reglas de negocio críticas. 

Dado que abrir los archivos directamente requiere un entorno de servidor, la forma más rápida de ejecutar la suite de pruebas es a través del sitio desplegado:

1. Ingresa al panel interactivo de pruebas online: [Panel de Pruebas Unitarias](https://lautarogimenezx.github.io/ISII_26TC_Grupo15/tests.html)
2. Haz clic en **"Ejecutar Todo"** para correr la suite completa o prueba cada regla de negocio de forma individual usando los botones dedicados.

---
_Desarrollado para optimizar la gestión de centros deportivos._
