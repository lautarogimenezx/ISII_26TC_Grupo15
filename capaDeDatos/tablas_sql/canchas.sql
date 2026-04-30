CREATE TABLE public.canchas (
    id_cancha uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    hora_apertura time NOT NULL,
    hora_cierre time NOT NULL,
    precio numeric NOT NULL,
    id_deporte uuid REFERENCES public.tipo_deporte(id_deporte) ON DELETE CASCADE
);
