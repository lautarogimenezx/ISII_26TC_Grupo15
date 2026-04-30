CREATE TABLE public.detalle_reserva (
    id_detalle uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_reserva uuid REFERENCES public.reserva(id_reserva) ON DELETE CASCADE,
    id_cancha uuid REFERENCES public.canchas(id_cancha) ON DELETE CASCADE,
    fecha_reserva date NOT NULL,
    hora_reserva text NOT NULL
);
