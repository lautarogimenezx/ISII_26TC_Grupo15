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
