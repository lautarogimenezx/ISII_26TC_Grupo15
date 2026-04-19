export const SUPABASE_URL = 'https://xjkirhznqogrgcidkusj.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqa2lyaHpucW9ncmdjaWRrdXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDA4MTgsImV4cCI6MjA5MTI3NjgxOH0.qo1NEy02e1VTmBe7mqHmkTpd0p5RcoJALie1m26JUtU';

// Instancia única (Singleton) del cliente Supabase
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export async function createReserva(idJugador, idCancha, fecha, hora) {
    return await supabaseClient.from('reservas').insert([{
        jugador_id: idJugador,
        cancha_id: idCancha,
        fecha: fecha,
        hora: hora,
        precio: arguments[4] || 0 // Fallback if precio was included but technically optional for this function signature.
    }]).select().single();
}

console.log("¡Cliente Supabase (Módulo) Iniciado!");
