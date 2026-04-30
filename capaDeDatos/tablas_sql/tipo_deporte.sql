CREATE TABLE public.tipo_deporte (
    id_deporte uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion text NOT NULL
);
