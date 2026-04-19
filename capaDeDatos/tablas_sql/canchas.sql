CREATE TABLE public.canchas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    tipo_deporte text NOT NULL,
    hora_apertura time NOT NULL,
    hora_cierre time NOT NULL,
    precio numeric NOT NULL,
    creado_en timestamp with time zone DEFAULT now(),
    club_id integer REFERENCES public.club_config(id)
);
