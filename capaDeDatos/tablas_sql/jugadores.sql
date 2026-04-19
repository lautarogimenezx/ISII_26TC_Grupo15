CREATE TABLE public.jugadores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    email text,
    telefono text NOT NULL,
    creado_en timestamp with time zone DEFAULT now()
);
