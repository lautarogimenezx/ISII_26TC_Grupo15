CREATE TABLE IF NOT EXISTS public.estado_pago (
    id_pago uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    estado text NOT NULL,
    fecha_pago date DEFAULT CURRENT_DATE,
    id_metodo uuid REFERENCES public.metodo_pago(id_metodo) ON DELETE CASCADE
);
