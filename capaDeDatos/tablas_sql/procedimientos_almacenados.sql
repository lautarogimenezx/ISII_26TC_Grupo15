-- =========================================================================
-- ARCHIVO DE PROCEDIMIENTOS ALMACENADOS / FUNCIONES SQL (Supabase / PostgreSQL)
-- =========================================================================

-- 1. Obtener Reservas Activas por Email
-- Este procedimiento reemplaza la consulta compleja en `reserva.js`.
-- Filtra automáticamente las reservas canceladas y las de fechas anteriores a hoy.

-- Borramos versiones previas para evitar conflictos de tipos de retorno
DROP FUNCTION IF EXISTS obtener_reservas_activas_por_email(VARCHAR);
DROP FUNCTION IF EXISTS obtener_reservas_activas_por_email(TEXT);

CREATE OR REPLACE FUNCTION obtener_reservas_activas_por_email(p_email TEXT)
RETURNS TABLE (
    id_reserva UUID,
    total NUMERIC,
    estado TEXT,
    fecha DATE,
    hora TEXT,
    cancha TEXT,
    estado_pago TEXT,
    metodo_pago TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_reserva,
        r.total,
        er.descripcion AS estado,
        dr.fecha_reserva AS fecha,
        dr.hora_reserva AS hora,
        c.nombre AS cancha,
        ep.estado AS estado_pago,
        mp.descripcion AS metodo_pago
    FROM 
        jugadores j
    JOIN 
        reserva r ON j.id_jugador = r.id_jugador
    JOIN 
        estado_reserva er ON r.id_estado = er.id_estado
    JOIN 
        detalle_reserva dr ON r.id_reserva = dr.id_reserva
    JOIN 
        canchas c ON dr.id_cancha = c.id_cancha
    JOIN 
        estado_pago ep ON dr.id_pago = ep.id_pago
    JOIN 
        metodo_pago mp ON ep.id_metodo = mp.id_metodo
    WHERE 
        j.email = p_email
        AND er.descripcion != 'Cancelado'
        AND dr.fecha_reserva >= CURRENT_DATE
    ORDER BY 
        dr.fecha_reserva ASC, dr.hora_reserva ASC;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo: SELECT * FROM obtener_reservas_activas_por_email('cliente@gmail.com');

-- 2. Crear Jugador
-- Inserta un nuevo jugador y devuelve la fila correspondiente.
CREATE OR REPLACE FUNCTION crear_jugador(
    p_email TEXT,
    p_nombre TEXT,
    p_telefono TEXT
)
RETURNS TABLE (
    id_jugador UUID,
    nombre TEXT,
    email TEXT,
    telefono TEXT
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.jugadores (email, nombre, telefono)
    VALUES (p_email, p_nombre, p_telefono)
    RETURNING jugadores.id_jugador, jugadores.nombre, jugadores.email, jugadores.telefono;
END;
$$ LANGUAGE plpgsql;

-- 3. Actualizar Jugador
-- Actualiza el nombre y teléfono de un jugador por su email y devuelve la fila.
CREATE OR REPLACE FUNCTION actualizar_jugador(
    p_email TEXT,
    p_nombre TEXT,
    p_telefono TEXT
)
RETURNS TABLE (
    id_jugador UUID,
    nombre TEXT,
    email TEXT,
    telefono TEXT
) AS $$
BEGIN
    RETURN QUERY
    UPDATE public.jugadores
    SET nombre = p_nombre,
        telefono = p_telefono
    WHERE jugadores.email = p_email
    RETURNING jugadores.id_jugador, jugadores.nombre, jugadores.email, jugadores.telefono;
END;
$$ LANGUAGE plpgsql;

