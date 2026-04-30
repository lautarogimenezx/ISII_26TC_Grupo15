CREATE TABLE public.reserva (
    id_reserva uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    total numeric NOT NULL,
    id_jugador uuid REFERENCES public.jugadores(id_jugador) ON DELETE CASCADE,
    id_estado uuid REFERENCES public.estado_reserva(id_estado) ON DELETE CASCADE
);
