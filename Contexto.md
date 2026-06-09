Contexto de Desarrollo: Sistema "Turnos YA" - Funcionalidad 2

Objetivo para el Agente IA: El objetivo de este documento es proporcionar el contexto arquitectónico, el modelo de datos y las reglas de negocio necesarias para desarrollar la Funcionalidad 2 (Motor de Reservas) del sistema "Turnos YA". Debes seguir estrictamente los nombres de métodos, entidades e interacciones definidos en los diagramas de secuencia y contratos.

1. Arquitectura y Tecnologías

Capa de Presentación (Frontend): Maquetado Visual HTML/CSS. Interacción del usuario, calendarios y formularios.

Capa de Lógica (Cliente): Gestor de eventos en Vanilla JS. Validación de reglas de negocio y llamadas asíncronas (Fetch).

Capa de Datos (BaaS): Base de Datos PostgreSQL gestionada a través de Supabase (API REST).

2. Modelo de Datos (Diagrama Entidad-Relación)

Este es el esquema exacto de la base de datos que la aplicación debe respetar.

erDiagram
    jugadores {
        int id_jugador PK
        string nombre
        string email
        string telefono
    }
    estado_reserva {
        int id_estado PK
        string descripcion
    }
    metodo_pago {
        int id_metodo PK
        string descripcion
    }
    tipo_deporte {
        int id_deporte PK
        string descripcion
    }
    cancha {
        int id_cancha PK
        string nombre
        time hora_apertura
        time hora_cierre
        float precio
        int id_deporte FK
    }
    reserva {
        int id_reserva PK
        float total
        int id_jugador FK
        int id_estado FK
    }
    estado_pago {
        int id_pago PK
        string estado
        date fecha_pago
        int id_metodo FK
    }
    detalle_reserva {
        int id_detalle PK
        date fecha_reserva
        time hora_reserva
        float monto_total
        int id_reserva FK
        int id_pago FK
        int id_cancha FK
    }

    jugadores ||--o{ reserva : "tiene"
    estado_reserva ||--o{ reserva : "posee"
    tipo_deporte ||--o{ cancha : "clasifica"
    reserva ||--o{ detalle_reserva : "contiene"
    estado_pago ||--o{ detalle_reserva : "asociado_a"
    metodo_pago ||--o{ estado_pago : "utiliza"
    cancha ||--o{ detalle_reserva : "incluye"


3. Contexto Previo: Funcionalidad 1 (Gestión de Canchas)

Para entender cómo interactúa la arquitectura, estos son los flujos ya implementados para la Funcionalidad 1. La Funcionalidad 2 debe seguir este mismo patrón de interacción (Actor -> INTERFAZ -> ENTIDAD).

3.1 Agregar Cancha

sequenceDiagram
    actor Administrador
    participant INTERFAZ
    participant CANCHA
    participant TIPO_DEPORTE

    Administrador->>INTERFAZ: selecciona "Agregar Cancha"
    INTERFAZ->>CANCHA: abrir vista "Agregar Cancha"
    CANCHA->>TIPO_DEPORTE: solicita tipos de deporte
    TIPO_DEPORTE->>TIPO_DEPORTE: obtenerTiposCancha()
    TIPO_DEPORTE-->>CANCHA: devuelve lista de tipos
    CANCHA->>CANCHA: cargarFormulario()
    CANCHA-->>INTERFAZ: muestra formulario de carga
    Administrador->>INTERFAZ: completa campos y presiona botón "Guardar Cancha"
    INTERFAZ->>CANCHA: agrega cancha
    CANCHA->>CANCHA: validarDatos(nombre,tipo,apertura,cierre,precio)
    CANCHA->>CANCHA: agregarCancha()
    CANCHA-->>INTERFAZ: limpia formulario y muestra mensaje "Cancha registrada con éxito"


3.2 Editar Cancha

sequenceDiagram
    actor Administrador
    participant INTERFAZ
    participant CANCHA
    participant TIPO_DEPORTE

    Administrador->>INTERFAZ: presiona botón "Editar" de la cancha seleccionada
    INTERFAZ->>CANCHA: comunica cancha a editar
    CANCHA->>TIPO_DEPORTE: solicita tipos de deporte
    TIPO_DEPORTE->>TIPO_DEPORTE: obtenerTiposCancha()
    TIPO_DEPORTE-->>CANCHA: devuelve lista de tipos de deporte
    CANCHA->>CANCHA: cargarFormulario(cancha_id)
    CANCHA-->>INTERFAZ: muestra formulario con los datos actuales de la cancha
    Administrador->>INTERFAZ: edita los datos y presiona "Actualizar Cancha"
    INTERFAZ->>CANCHA: actualiza cancha
    CANCHA->>CANCHA: validarDatos(nombre,tipo,apertura,cierre,precio)
    CANCHA->>CANCHA: actualizarCancha()
    CANCHA-->>INTERFAZ: muestra la lista de canchas con los datos actualizados


3.3 Eliminar Cancha

sequenceDiagram
    actor Administrador
    participant INTERFAZ
    participant CANCHA

    Administrador->>INTERFAZ: presiona botón "Eliminar" de la cancha seleccionada
    INTERFAZ->>CANCHA: comunica cancha a eliminar
    CANCHA->>CANCHA: validarDatos(id_cancha)
    CANCHA-->>INTERFAZ: solicita confirmación de eliminación
    Administrador->>INTERFAZ: confirma la operación
    INTERFAZ->>CANCHA: elimina cancha
    CANCHA->>CANCHA: eliminarCancha()
    CANCHA-->>INTERFAZ: muestra lista de canchas actualizado


4. Objetivo a Desarrollar: Funcionalidad 2 (Motor de Reservas)

4.1 Requerimientos Funcionales Relacionados

#RF2 - Visualización de Disponibilidad: Permitir al jugador visualizar un calendario interactivo con horarios disponibles en tiempo real.

#RF3 - Gestión de Reserva: Permitir al jugador confirmar la reserva de un turno.

#RF4 - Control de Solapamiento: Validar estrictamente que una nueva reserva no se superponga con un turno previamente confirmado (Evitar Double-Booking).

4.2 Casos de Uso: Conversaciones

Conversación 4: Ver calendario de turnos

Actor: Jugador

A: selecciona una fecha y una cancha específica para visualizar a través de la interfaz.

S: ejecuta obtenerHorarios(id_cancha) y buscarOcupacion(id_cancha, fecha) para consultar la información registrada. (Curso alternativo: si la cancha no tiene horarios configurados o está inactiva, muestra un mensaje indicando que no hay disponibilidad).

S: calcula la matriz de disponibilidad mediante calcularDisponibilidad().

S: muestra el calendario con los bloques horarios disponibles al usuario.

Fin del caso de uso.

Conversación 5: Reservar Turno

Actor: Jugador

A: selecciona un turno disponible en la interfaz y presiona "Confirmar Reserva".

S: ejecuta la validación estricta de disponibilidad mediante validarSolapamiento(id_cancha, fecha, hora). (Curso alternativo: si el turno fue ocupado por concurrencia, aborta la operación, recarga el calendario y muestra error). Si es exitoso, ejecuta crearReserva(id_jugador, total, id_estado) asociando el jugador y el estado inicial.

S: genera el registro de pago mediante generarEstadoPago(pendiente) y obtiene el id_pago.

S: guarda el detalle del turno en el sistema ejecutando generarDetalle(id_reserva, id_pago, id_cancha, fecha, hora, monto_total).

S: limpia la vista y muestra el mensaje "Reserva confirmada con éxito".

Fin del caso de uso.

Conversación 6: Cancelar turno

Actor: Jugador

A: selecciona una reserva activa en la interfaz y presiona "Cancelar".

S: comprueba la validez mediante verificarEstado(id_reserva) y solicita confirmación al usuario.

A: confirma la operación. (Curso alternativo: A cancela la operación y se cierra el diálogo). S: obtiene el identificador del estado cancelado mediante obtenerEstado(Cancelado).

S: actualiza la reserva ejecutando modificarEstadoReserva(id_estado) y libera el horario en el calendario de la cancha mediante liberarBloque(id_reserva).

S: actualiza la lista de reservas y muestra el mensaje "Cancelación exitosa".

Fin del caso de uso.

4.3 Contratos de Operaciones Críticas

Contrato: confirmarReserva

Firma: confirmarReserva(id_jugador: int, id_cancha: int, fecha: date, hora: time, monto_total: decimal, id_estado: int)

Responsabilidades: Registrar una reserva asegurando que el horario cumpla reglas de negocio, generando un estado de pago pendiente y el detalle sin solapamientos.

Excepciones: * Si validarSolapamiento() detecta un registro en Detalle_Reserva, aborta la transacción.

Si la hora solicitada está fuera del rango de apertura/cierre, se cancela.

Pre-condiciones: Jugador autenticado; Cancha activa con horarios configurados.

Post-condiciones: Instancia de Reserva creada. Instancia de Estado_Pago creada (pendiente). Registro en Detalle_Reserva creado (bloqueando fecha y hora). Interfaz limpia y calendario actualizado.

Contrato: cancelarReserva

Firma: cancelarReserva(id_reserva: int)

Responsabilidades: Dar de baja una reserva activa, actualizando estado a cancelado y liberando el bloque horario.

Excepciones: Si verificarEstado() indica que ya está Cancelado/Finalizado, aborta y notifica.

Pre-condiciones: Jugador autenticado; la reserva existe y le pertenece.

Post-condiciones: Reserva apuntando al id_estado Cancelado. Bloque liberado en Detalle_Reserva mediante liberarBloque(id_reserva). Lista actualizada en UI.

4.4 Diagramas de Secuencia (Funcionalidad 2 a Desarrollar)

Ver calendario de turnos

sequenceDiagram
    actor Jugador
    participant INTERFAZ
    participant CANCHA
    participant DETALLE_RESERVA

    Jugador->>INTERFAZ: selecciona fecha y cancha específica
    INTERFAZ->>CANCHA: solicita disponibilidad de la cancha
    CANCHA->>CANCHA: obtenerHorarios(id_cancha)
    CANCHA->>DETALLE_RESERVA: solicita turnos ocupados
    DETALLE_RESERVA->>DETALLE_RESERVA: buscarOcupacion(id_cancha, fecha)
    DETALLE_RESERVA-->>CANCHA: devuelve lista de turnos ocupados
    CANCHA->>CANCHA: calcularDisponibilidad()
    CANCHA-->>INTERFAZ: devuelve matriz de disponibilidad
    INTERFAZ-->>Jugador: muestra calendario con bloques horarios disponibles


Reservar Turno

sequenceDiagram
    actor Jugador
    participant INTERFAZ
    participant RESERVA
    participant ESTADO_PAGO
    participant DETALLE_RESERVA

    Jugador->>INTERFAZ: selecciona turno disponible y presiona "Confirmar Reserva"
    INTERFAZ->>RESERVA: comunica intento de reserva
    RESERVA->>DETALLE_RESERVA: solicita validar disponibilidad
    DETALLE_RESERVA->>DETALLE_RESERVA: validarSolapamiento(id_cancha, fecha, hora)
    DETALLE_RESERVA-->>RESERVA: devuelve confirmación de disponibilidad
    RESERVA->>RESERVA: crearReserva(id_jugador, total, id_estado)
    RESERVA->>ESTADO_PAGO: solicita registrar estado de pago
    ESTADO_PAGO->>ESTADO_PAGO: generarEstadoPago(pendiente)
    ESTADO_PAGO-->>RESERVA: devuelve id_pago
    RESERVA->>DETALLE_RESERVA: asocia detalle al turno
    DETALLE_RESERVA->>DETALLE_RESERVA: generarDetalle(id_reserva, id_pago, id_cancha, fecha, hora, monto_total)
    DETALLE_RESERVA-->>RESERVA: confirma detalle guardado
    RESERVA-->>INTERFAZ: confirma reserva exitosa
    INTERFAZ-->>Jugador: limpia vista y muestra mensaje "Reserva confirmada con éxito"


Cancelar Turno

sequenceDiagram
    actor Jugador
    participant INTERFAZ
    participant RESERVA
    participant ESTADO_RESERVA
    participant DETALLE_RESERVA

    Jugador->>INTERFAZ: selecciona reserva activa y presiona "Cancelar"
    INTERFAZ->>RESERVA: comunica reserva a cancelar
    RESERVA->>RESERVA: verificarEstado(id_reserva)
    RESERVA-->>INTERFAZ: solicita confirmación de cancelación
    Jugador->>INTERFAZ: confirma la operación
    INTERFAZ->>RESERVA: cancela reserva
    RESERVA->>ESTADO_RESERVA: solicita estado cancelado
    ESTADO_RESERVA->>ESTADO_RESERVA: obtenerEstado(Cancelado)
    ESTADO_RESERVA-->>RESERVA: devuelve id_estado
    RESERVA->>RESERVA: modificarEstadoReserva(id_estado)
    RESERVA->>DETALLE_RESERVA: solicita liberar horario
    DETALLE_RESERVA->>DETALLE_RESERVA: liberarBloque(id_reserva)
    DETALLE_RESERVA-->>RESERVA: confirma horario liberado
    RESERVA-->>INTERFAZ: confirma cancelación exitosa
    INTERFAZ-->>Jugador: actualiza lista y muestra mensaje "Cancelación exitosa"