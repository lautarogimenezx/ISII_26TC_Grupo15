CREATE TABLE public.reservas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cancha_id uuid REFERENCES public.canchas(id) ON DELETE CASCADE,
    jugador_id uuid REFERENCES public.jugadores(id) ON DELETE CASCADE,
    fecha date NOT NULL,
    hora text NOT NULL,
    precio numeric NOT NULL,
    estado text DEFAULT 'pendiente'::text,
    creado_en timestamp with time zone DEFAULT now(),
    UNIQUE (cancha_id, fecha, hora)
);
