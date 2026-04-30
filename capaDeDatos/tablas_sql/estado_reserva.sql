CREATE TABLE public.estado_reserva (
    id_estado uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion text NOT NULL
);
