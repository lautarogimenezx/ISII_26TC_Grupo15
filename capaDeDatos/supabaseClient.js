export const SUPABASE_URL = 'https://xjkirhznqogrgcidkusj.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqa2lyaHpucW9ncmdjaWRrdXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDA4MTgsImV4cCI6MjA5MTI3NjgxOH0.qo1NEy02e1VTmBe7mqHmkTpd0p5RcoJALie1m26JUtU';

/**
 * Cliente Singleton inicializado y listo para ejecutar consultas SQL (Data Access Object).
 * @type {Object}
 */
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export async function createReserva(idJugador, idCancha, fecha, hora, total = 0) {
    // 1. Obtener un estado por defecto (Pendiente)
    const { data: estado } = await supabaseClient
        .from('estado_reserva')
        .select('id_estado')
        .eq('descripcion', 'Pendiente')
        .single();

    if (!estado) throw new Error("No se encontró el estado 'Pendiente' en la base de datos.");

    // 2. Insertar en la tabla maestra 'reserva'
    const { data: reserva, error: errR } = await supabaseClient
        .from('reserva')
        .insert([{
            id_jugador: idJugador,
            id_estado: estado.id_estado,
            total: total
        }])
        .select()
        .single();

    if (errR) throw errR;

    // 3. Insertar en 'detalle_reserva'
    const { data: detalle, error: errD } = await supabaseClient
        .from('detalle_reserva')
        .insert([{
            id_reserva: reserva.id_reserva,
            id_cancha: idCancha,
            fecha_reserva: fecha,
            hora_reserva: hora
        }])
        .select()
        .single();

    if (errD) throw errD;

    return { reserva, detalle };
}

console.log("¡Cliente Supabase (Módulo) Iniciado!");
