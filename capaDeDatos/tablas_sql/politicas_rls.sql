-- OPCIÓN 1 (Recomendada para Desarrollo/Entorno Académico): Desactivar RLS en las tablas del flujo de reservas
-- Esto evitará cualquier bloqueo de permisos en el cliente web anónimo.

ALTER TABLE public.metodo_pago DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_pago DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_reserva DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_reserva DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadores DISABLE ROW LEVEL SECURITY;


-- --------------------------------------------------------------------------------------
-- OPCIÓN 2: Mantener RLS y habilitar políticas de acceso público (SELECT / INSERT)
-- Usa esta opción solo si el proyecto exige mantener habilitado RLS.

/*
-- Políticas para metodo_pago
ALTER TABLE public.metodo_pago ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select publico" ON public.metodo_pago;
CREATE POLICY "Permitir select publico" ON public.metodo_pago FOR SELECT USING (true);

-- Políticas para estado_reserva
ALTER TABLE public.estado_reserva ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select publico" ON public.estado_reserva;
CREATE POLICY "Permitir select publico" ON public.estado_reserva FOR SELECT USING (true);

-- Políticas para estado_pago
ALTER TABLE public.estado_pago ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select publico" ON public.estado_pago;
DROP POLICY IF EXISTS "Permitir insert publico" ON public.estado_pago;
CREATE POLICY "Permitir select publico" ON public.estado_pago FOR SELECT USING (true);
CREATE POLICY "Permitir insert publico" ON public.estado_pago FOR INSERT WITH CHECK (true);

-- Políticas para jugadores
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select publico" ON public.jugadores;
DROP POLICY IF EXISTS "Permitir insert publico" ON public.jugadores;
DROP POLICY IF EXISTS "Permitir update publico" ON public.jugadores;
CREATE POLICY "Permitir select publico" ON public.jugadores FOR SELECT USING (true);
CREATE POLICY "Permitir insert publico" ON public.jugadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update publico" ON public.jugadores FOR UPDATE USING (true) WITH CHECK (true);


-- Políticas para reserva
ALTER TABLE public.reserva ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select publico" ON public.reserva;
DROP POLICY IF EXISTS "Permitir insert publico" ON public.reserva;
CREATE POLICY "Permitir select publico" ON public.reserva FOR SELECT USING (true);
CREATE POLICY "Permitir insert publico" ON public.reserva FOR INSERT WITH CHECK (true);

-- Políticas para detalle_reserva
ALTER TABLE public.detalle_reserva ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select publico" ON public.detalle_reserva;
DROP POLICY IF EXISTS "Permitir insert publico" ON public.detalle_reserva;
CREATE POLICY "Permitir select publico" ON public.detalle_reserva FOR SELECT USING (true);
CREATE POLICY "Permitir insert publico" ON public.detalle_reserva FOR INSERT WITH CHECK (true);
*/
