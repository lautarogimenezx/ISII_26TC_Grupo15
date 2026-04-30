CREATE TABLE public.jugadores (
    id_jugador uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    email text,
    telefono text NOT NULL
);
