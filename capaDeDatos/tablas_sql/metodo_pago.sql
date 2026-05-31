CREATE TABLE IF NOT EXISTS public.metodo_pago (
    id_metodo uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion text NOT NULL UNIQUE
);

INSERT INTO public.metodo_pago (descripcion) VALUES ('Efectivo'), ('Transferencia') ON CONFLICT (descripcion) DO NOTHING;
