--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.0

-- Started on 2026-06-09 21:32:52

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 120 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 120
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 514 (class 1255 OID 33743)
-- Name: actualizar_jugador(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_jugador(p_email text, p_nombre text, p_telefono text) RETURNS TABLE(id_jugador uuid, nombre text, email text, telefono text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    UPDATE public.jugadores
    SET nombre = p_nombre,
        telefono = p_telefono
    WHERE jugadores.email = p_email
    RETURNING jugadores.id_jugador, jugadores.nombre, jugadores.email, jugadores.telefono;
END;
$$;


--
-- TOC entry 513 (class 1255 OID 33742)
-- Name: crear_jugador(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.crear_jugador(p_email text, p_nombre text, p_telefono text) RETURNS TABLE(id_jugador uuid, nombre text, email text, telefono text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.jugadores (email, nombre, telefono)
    VALUES (p_email, p_nombre, p_telefono)
    RETURNING jugadores.id_jugador, jugadores.nombre, jugadores.email, jugadores.telefono;
END;
$$;


--
-- TOC entry 512 (class 1255 OID 33736)
-- Name: obtener_reservas_activas_por_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.obtener_reservas_activas_por_email(p_email text) RETURNS TABLE(id_reserva uuid, total numeric, estado text, fecha date, hora text, cancha text, estado_pago text, metodo_pago text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_reserva,
        r.total,
        er.descripcion AS estado,
        dr.fecha_reserva AS fecha,
        dr.hora_reserva AS hora,
        c.nombre AS cancha,
        ep.estado AS estado_pago,
        mp.descripcion AS metodo_pago
    FROM 
        jugadores j
    JOIN 
        reserva r ON j.id_jugador = r.id_jugador
    JOIN 
        estado_reserva er ON r.id_estado = er.id_estado
    JOIN 
        detalle_reserva dr ON r.id_reserva = dr.id_reserva
    JOIN 
        canchas c ON dr.id_cancha = c.id_cancha
    JOIN 
        estado_pago ep ON dr.id_pago = ep.id_pago
    JOIN 
        metodo_pago mp ON ep.id_metodo = mp.id_metodo
    WHERE 
        j.email = p_email
        AND er.descripcion != 'Cancelado'
        AND dr.fecha_reserva >= CURRENT_DATE
    ORDER BY 
        dr.fecha_reserva ASC, dr.hora_reserva ASC;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 396 (class 1259 OID 22333)
-- Name: canchas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.canchas (
    id_cancha uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    hora_apertura time without time zone NOT NULL,
    hora_cierre time without time zone NOT NULL,
    precio numeric NOT NULL,
    id_deporte uuid
);


--
-- TOC entry 394 (class 1259 OID 19969)
-- Name: club_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_config (
    id integer DEFAULT 1 NOT NULL,
    nombre text DEFAULT 'Club Deportivo Central'::text NOT NULL,
    telefono_whatsapp text DEFAULT ''::text NOT NULL,
    detalles_bancarios text DEFAULT ''::text NOT NULL,
    CONSTRAINT single_row CHECK ((id = 1))
);


--
-- TOC entry 400 (class 1259 OID 22380)
-- Name: detalle_reserva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_reserva (
    id_detalle uuid DEFAULT gen_random_uuid() NOT NULL,
    id_reserva uuid,
    id_cancha uuid,
    fecha_reserva date NOT NULL,
    hora_reserva text NOT NULL,
    id_pago uuid,
    monto_total numeric
);


--
-- TOC entry 402 (class 1259 OID 33582)
-- Name: estado_pago; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_pago (
    id_pago uuid DEFAULT gen_random_uuid() NOT NULL,
    estado text NOT NULL,
    fecha_pago date DEFAULT CURRENT_DATE,
    id_metodo uuid
);


--
-- TOC entry 398 (class 1259 OID 22354)
-- Name: estado_reserva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_reserva (
    id_estado uuid DEFAULT gen_random_uuid() NOT NULL,
    descripcion text NOT NULL
);


--
-- TOC entry 397 (class 1259 OID 22346)
-- Name: jugadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jugadores (
    id_jugador uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    email text,
    telefono text NOT NULL
);


--
-- TOC entry 401 (class 1259 OID 33572)
-- Name: metodo_pago; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metodo_pago (
    id_metodo uuid DEFAULT gen_random_uuid() NOT NULL,
    descripcion text NOT NULL
);


--
-- TOC entry 399 (class 1259 OID 22362)
-- Name: reserva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reserva (
    id_reserva uuid DEFAULT gen_random_uuid() NOT NULL,
    total numeric NOT NULL,
    id_jugador uuid,
    id_estado uuid
);


--
-- TOC entry 395 (class 1259 OID 22325)
-- Name: tipo_deporte; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_deporte (
    id_deporte uuid DEFAULT gen_random_uuid() NOT NULL,
    descripcion text NOT NULL
);


--
-- TOC entry 3901 (class 0 OID 22333)
-- Dependencies: 396
-- Data for Name: canchas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.canchas VALUES ('fcaf2494-53a3-448f-89ac-a2cc17abed1e', 'Cancha 1', '13:00:00', '21:00:00', 16000, '099aa7ff-6070-45e7-95fc-58f79cfd976f');
INSERT INTO public.canchas VALUES ('28a656c7-40c9-457c-9210-54925c649427', 'Cancha 3', '12:15:00', '22:30:00', 25000, '4434da0d-c5b8-46fd-b5ee-3595ec5378b9');
INSERT INTO public.canchas VALUES ('f5f3240e-3433-4aab-8a4c-3e8f561bb177', 'Cancha 12', '20:00:00', '02:00:00', 16000, '7ab3182c-057d-4c3e-83ec-b5bcbff91895');
INSERT INTO public.canchas VALUES ('dd01b880-76d5-440a-a88f-a886c0d6229c', 'Cancha 2', '13:00:00', '22:00:00', 15000, '7ab3182c-057d-4c3e-83ec-b5bcbff91895');


--
-- TOC entry 3899 (class 0 OID 19969)
-- Dependencies: 394
-- Data for Name: club_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.club_config VALUES (1, 'Turnos YA Demo', '3777622526', 'turnosya
TurnosYa_SRL');


--
-- TOC entry 3905 (class 0 OID 22380)
-- Dependencies: 400
-- Data for Name: detalle_reserva; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.detalle_reserva VALUES ('50f96652-24de-490b-b1e4-25c810d384d2', '653874e7-16d0-4920-ba1d-1c14b74f8679', 'dd01b880-76d5-440a-a88f-a886c0d6229c', '2026-05-30', '17:00:00', 'bfb086fe-1649-4b72-8343-9cd6939084cb', 15000);
INSERT INTO public.detalle_reserva VALUES ('dc29a429-4416-4559-9749-9cf74f2da093', '0effa08f-38a2-4ca4-9aff-38805ab16af0', 'dd01b880-76d5-440a-a88f-a886c0d6229c', '2026-05-30', '12:00:00', '5ce9e849-388e-4cb9-bcaf-2bdc36f2b657', 15000);
INSERT INTO public.detalle_reserva VALUES ('52f8ce26-d278-4073-9238-171f076b930f', 'bb4b8684-0413-4add-ac0c-35f85e5b2831', 'dd01b880-76d5-440a-a88f-a886c0d6229c', '2026-05-30', '16:00:00', '68b15c03-a6f8-4de2-9487-8b9a04f1bc3f', 15000);
INSERT INTO public.detalle_reserva VALUES ('064d0518-118b-4fd3-a5e2-387162782bab', 'c2220c98-7d26-4672-9e8d-98b4428234c7', 'dd01b880-76d5-440a-a88f-a886c0d6229c', '2026-05-31', '12:00:00', '4ac2b97b-b7bb-44cd-bdb1-f1294f59084e', 15000);
INSERT INTO public.detalle_reserva VALUES ('62962ab0-750b-4776-948e-2fbff8801dea', '4f6dbbec-8d0d-4f96-a04e-d3245a3b84fe', 'dd01b880-76d5-440a-a88f-a886c0d6229c', '2026-06-04', '12:00:00', '0380c36f-9b0a-411b-a8ef-f87aa60ca3ac', 15000);
INSERT INTO public.detalle_reserva VALUES ('68e91e3f-0569-47a7-9b69-4bea8149edef', '28a368e1-e343-4239-820e-fcb1cc5c763c', 'dd01b880-76d5-440a-a88f-a886c0d6229c', '2026-06-04', '15:00:00', 'c4ff6467-3e05-4b4c-b708-d334de433b67', 15000);
INSERT INTO public.detalle_reserva VALUES ('062e4975-8c0c-451f-94e9-7f6969604db1', 'd4c34185-4fb7-4237-9e91-61eb987fe118', 'fcaf2494-53a3-448f-89ac-a2cc17abed1e', '2026-06-04', '15:00:00', '74e1bd23-c035-4432-8c92-1562c30795d3', 16000);
INSERT INTO public.detalle_reserva VALUES ('a6809f86-fc42-41b7-ade2-061ed93cd032', '001023ff-7b74-44fd-8c52-cac28be3378f', 'fcaf2494-53a3-448f-89ac-a2cc17abed1e', '2026-06-04', '16:00:00', '8070f60b-b1e2-4cca-9aab-5856fa302885', 16000);
INSERT INTO public.detalle_reserva VALUES ('63ab5189-2085-4f8b-853b-65e84a51ef88', '286828ec-9d43-4f71-929d-ed55cf27d44e', '28a656c7-40c9-457c-9210-54925c649427', '2026-06-04', '12:00:00', '98513d0d-2ac4-406e-876f-15b08ab7043d', 25000);
INSERT INTO public.detalle_reserva VALUES ('dd45ee31-6bb2-4885-a7de-8dc14bb25c26', 'fa8fa641-bfbc-4016-b5b3-c817c5f9a102', 'fcaf2494-53a3-448f-89ac-a2cc17abed1e', '2026-06-04', '14:00:00', 'e55a620b-98f5-4c80-bcac-da7d55f0e875', 16000);
INSERT INTO public.detalle_reserva VALUES ('2e2d71da-8745-4485-8afe-478af7700882', '8461adfa-371d-4feb-927a-c1173acc8bc8', 'fcaf2494-53a3-448f-89ac-a2cc17abed1e', '2026-06-09', '18:00:00', 'd49dddb7-decb-4e76-af69-adcf474b9449', 16000);
INSERT INTO public.detalle_reserva VALUES ('ee4fc086-1726-40b0-a378-e8db8862c277', '2ba59b3a-dd84-4498-b9ef-6b728d0499aa', 'fcaf2494-53a3-448f-89ac-a2cc17abed1e', '2026-06-09', '17:00:00', '50e85d9f-de46-40de-ba2d-993dc94c7aa6', 16000);
INSERT INTO public.detalle_reserva VALUES ('dd8fc7d2-55b9-47b1-8007-fd217c0cf2af', 'c5c3c268-6418-4460-8d85-ac8408ae7fdb', 'fcaf2494-53a3-448f-89ac-a2cc17abed1e', '2026-06-09', '14:00:00', '2b6b672e-1bbf-4cd4-8210-839af0f59819', 16000);
INSERT INTO public.detalle_reserva VALUES ('5f7bff8d-7854-401a-b320-c45c5b524f43', '56e16e61-5e55-45a0-9a30-f9bb6bb841b6', 'f5f3240e-3433-4aab-8a4c-3e8f561bb177', '2026-06-09', '22:00:00', 'de5ba578-41ed-4608-b1c4-66f48de83e1e', 16000);
INSERT INTO public.detalle_reserva VALUES ('19774b2d-d2c1-426e-9281-f47127765cad', '7e0ea9f3-84ac-4072-bfbd-7c7b7576a491', 'fcaf2494-53a3-448f-89ac-a2cc17abed1e', '2026-06-09', '16:00:00', '78e197a8-316b-44ce-bfa3-427a3a354856', 16000);
INSERT INTO public.detalle_reserva VALUES ('1b86f22b-f839-40f0-8659-548f16eec418', '5a4916e4-fb36-4434-9c8a-d60adcb807f0', '28a656c7-40c9-457c-9210-54925c649427', '2026-06-09', '14:00:00', '87f758d5-6f62-46e6-8b54-e91e4d31fedc', 25000);


--
-- TOC entry 3907 (class 0 OID 33582)
-- Dependencies: 402
-- Data for Name: estado_pago; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estado_pago VALUES ('ab4a7664-a6e3-4954-b367-428f9ee855c3', 'Pendiente', '2026-05-31', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('3d21f840-db85-4c09-8741-94d44f48fc0f', 'Pendiente', '2026-05-31', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('bfb086fe-1649-4b72-8343-9cd6939084cb', 'Pendiente', '2026-05-31', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('5ce9e849-388e-4cb9-bcaf-2bdc36f2b657', 'Pendiente', '2026-05-31', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('68b15c03-a6f8-4de2-9487-8b9a04f1bc3f', 'Pendiente', '2026-05-31', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('62c59c18-af09-4974-b914-c74ea390ff1a', 'Pendiente', '2026-05-31', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('d0a28a7f-9d6f-4ab5-8c8d-b3fbfa50bdfb', 'Pendiente', '2026-05-31', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('4ac2b97b-b7bb-44cd-bdb1-f1294f59084e', 'Pendiente', '2026-05-31', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('9f94f038-6be1-48ac-899a-adb798ccc4fd', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('9c1b90ae-6e6e-4031-b1c4-05b019b20e81', 'Pendiente', '2026-06-04', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('c2ceed41-f274-448d-8f30-f842a64cccfc', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('0380c36f-9b0a-411b-a8ef-f87aa60ca3ac', 'Pendiente', '2026-06-04', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('c4ff6467-3e05-4b4c-b708-d334de433b67', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('74e1bd23-c035-4432-8c92-1562c30795d3', 'Pendiente', '2026-06-04', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('8070f60b-b1e2-4cca-9aab-5856fa302885', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('9af78c1d-cd95-4205-a101-83c7c17e5500', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('cfdb5a61-1298-420b-8b5b-f33b9c3421aa', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('d1e81bbf-a77a-42ec-a761-982a82f2928c', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('5db9386b-c25f-405c-a91f-a56d1bf8b60a', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('98513d0d-2ac4-406e-876f-15b08ab7043d', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('e55a620b-98f5-4c80-bcac-da7d55f0e875', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('15f4c865-eaf9-4ba8-8bb0-1e7cfe0624bb', 'Pendiente', '2026-06-04', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('06b78ad9-5608-4165-9cf5-8c363908ba45', 'Pendiente', '2026-06-09', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('d49dddb7-decb-4e76-af69-adcf474b9449', 'Pendiente', '2026-06-09', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('51d0eea1-b292-4d8e-8d8a-853e715bf4e6', 'Pendiente', '2026-06-09', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('50e85d9f-de46-40de-ba2d-993dc94c7aa6', 'Pendiente', '2026-06-09', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('2b6b672e-1bbf-4cd4-8210-839af0f59819', 'Pendiente', '2026-06-09', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('de5ba578-41ed-4608-b1c4-66f48de83e1e', 'Pendiente', '2026-06-09', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');
INSERT INTO public.estado_pago VALUES ('78e197a8-316b-44ce-bfa3-427a3a354856', 'Pendiente', '2026-06-10', 'd27adec3-d24a-4bd6-be9a-8536a501ac6f');
INSERT INTO public.estado_pago VALUES ('87f758d5-6f62-46e6-8b54-e91e4d31fedc', 'Pendiente', '2026-06-10', 'b0b44ad6-710b-44c3-820f-9b9c7c2f1758');


--
-- TOC entry 3903 (class 0 OID 22354)
-- Dependencies: 398
-- Data for Name: estado_reserva; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estado_reserva VALUES ('4b270868-b3ed-4875-9101-94291c5c3a5a', 'Pendiente');
INSERT INTO public.estado_reserva VALUES ('fe7db6f7-74a6-459f-baa9-c0ae28a17d3e', 'Confirmada');
INSERT INTO public.estado_reserva VALUES ('25d3e21a-ef9e-4c7e-986d-fe9574a8c425', 'Cancelada');
INSERT INTO public.estado_reserva VALUES ('00f5f3d4-7280-4e8b-9ed5-822c57b0c015', 'Cancelado');


--
-- TOC entry 3902 (class 0 OID 22346)
-- Dependencies: 397
-- Data for Name: jugadores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.jugadores VALUES ('47285fb0-20b3-4ac8-ab49-50500d826d3b', 'Lautaro', 'lautarogimez@gmail.com', '3777625234');
INSERT INTO public.jugadores VALUES ('9a509c55-0974-4689-8941-1e6ce7415c61', 'Lautaro N Giménez', 'lautarogimenezx@gmail.com', '3777609204');
INSERT INTO public.jugadores VALUES ('ae71db15-626b-4cb8-9aa6-45bc7e90610f', 'Pepito', 'pepito@gmail.com', '3777625232');
INSERT INTO public.jugadores VALUES ('2ced5427-af2d-4dba-bd1d-52f08f9eb50a', 'Pedro', 'hola@gmail.com', '3777620526');
INSERT INTO public.jugadores VALUES ('03b73cb2-18b7-4eb6-91d8-c5d180203ddd', 'Juanjo', 'ejemplo@email.com', '3888726');
INSERT INTO public.jugadores VALUES ('61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', 'Tomi', 'tomiitodo@gmail.com', '3777622526');
INSERT INTO public.jugadores VALUES ('f12c9e65-aca4-496a-8aa2-dd9f2058bedb', 'Tom', 'Tomas@gmail.com', '3777623321');
INSERT INTO public.jugadores VALUES ('ff4c521c-0b8e-465a-a3ff-4cb7f7bb3d69', 'Pepito', 'hola1@gmail.com', '377726134');
INSERT INTO public.jugadores VALUES ('9631ea47-a340-419e-90bf-7334849b2fcc', 'Lauti', 'lautarogimez23@gmail.com', '3777625263');


--
-- TOC entry 3906 (class 0 OID 33572)
-- Dependencies: 401
-- Data for Name: metodo_pago; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.metodo_pago VALUES ('b0b44ad6-710b-44c3-820f-9b9c7c2f1758', 'Efectivo');
INSERT INTO public.metodo_pago VALUES ('d27adec3-d24a-4bd6-be9a-8536a501ac6f', 'Transferencia');


--
-- TOC entry 3904 (class 0 OID 22362)
-- Dependencies: 399
-- Data for Name: reserva; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.reserva VALUES ('653874e7-16d0-4920-ba1d-1c14b74f8679', 15000, '47285fb0-20b3-4ac8-ab49-50500d826d3b', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('bf5726bf-8619-454e-b3e5-1fb06614b8c9', 15000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('0effa08f-38a2-4ca4-9aff-38805ab16af0', 15000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('bb4b8684-0413-4add-ac0c-35f85e5b2831', 15000, '47285fb0-20b3-4ac8-ab49-50500d826d3b', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('d4d32d67-71ec-4fb4-9529-360311465cfc', 15000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('c912b3f3-dd3e-4276-a32a-fd916362d1c3', 15000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('94e531a5-a492-4bb5-8fd0-0ca108ba9488', 16000, '9a509c55-0974-4689-8941-1e6ce7415c61', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('c2220c98-7d26-4672-9e8d-98b4428234c7', 15000, '9a509c55-0974-4689-8941-1e6ce7415c61', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('6189ab8c-46c0-4be5-8f12-a9b6659b4b52', 15000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('4f6dbbec-8d0d-4f96-a04e-d3245a3b84fe', 15000, '47285fb0-20b3-4ac8-ab49-50500d826d3b', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('28a368e1-e343-4239-820e-fcb1cc5c763c', 15000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('e8ced583-7944-41d2-bbe6-288555755432', 16000, '47285fb0-20b3-4ac8-ab49-50500d826d3b', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('d4c34185-4fb7-4237-9e91-61eb987fe118', 16000, 'ae71db15-626b-4cb8-9aa6-45bc7e90610f', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('001023ff-7b74-44fd-8c52-cac28be3378f', 16000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('bf9d4903-3b0e-447c-8314-af9cc16fdce5', 16000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('614da1f0-14d8-41b7-9291-b702959d5a42', 16000, '9a509c55-0974-4689-8941-1e6ce7415c61', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('8219c3ee-09e3-4384-bf2a-0fe87cf9e7ea', 16000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('fa5b88fd-a634-48b0-981c-6085148e0916', 16000, '9a509c55-0974-4689-8941-1e6ce7415c61', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('286828ec-9d43-4f71-929d-ed55cf27d44e', 25000, '9a509c55-0974-4689-8941-1e6ce7415c61', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('fa8fa641-bfbc-4016-b5b3-c817c5f9a102', 16000, '2ced5427-af2d-4dba-bd1d-52f08f9eb50a', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('e8179260-7769-476c-81d0-be23f482fdb1', 16000, '03b73cb2-18b7-4eb6-91d8-c5d180203ddd', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('8461adfa-371d-4feb-927a-c1173acc8bc8', 16000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('2ba59b3a-dd84-4498-b9ef-6b728d0499aa', 16000, '9a509c55-0974-4689-8941-1e6ce7415c61', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('7a8b43a3-e734-4d66-a8e4-6b9545df9c0e', 16000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('5af6f9a6-6a93-4fbe-9f3a-a926c021531c', 15000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '00f5f3d4-7280-4e8b-9ed5-822c57b0c015');
INSERT INTO public.reserva VALUES ('c5c3c268-6418-4460-8d85-ac8408ae7fdb', 16000, '61274b58-20f3-4ea4-a836-d3ce6b8d7f5c', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('56e16e61-5e55-45a0-9a30-f9bb6bb841b6', 16000, 'f12c9e65-aca4-496a-8aa2-dd9f2058bedb', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('7e0ea9f3-84ac-4072-bfbd-7c7b7576a491', 16000, 'ff4c521c-0b8e-465a-a3ff-4cb7f7bb3d69', '4b270868-b3ed-4875-9101-94291c5c3a5a');
INSERT INTO public.reserva VALUES ('5a4916e4-fb36-4434-9c8a-d60adcb807f0', 25000, '9631ea47-a340-419e-90bf-7334849b2fcc', '4b270868-b3ed-4875-9101-94291c5c3a5a');


--
-- TOC entry 3900 (class 0 OID 22325)
-- Dependencies: 395
-- Data for Name: tipo_deporte; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tipo_deporte VALUES ('7ab3182c-057d-4c3e-83ec-b5bcbff91895', 'Pádel');
INSERT INTO public.tipo_deporte VALUES ('4434da0d-c5b8-46fd-b5ee-3595ec5378b9', 'Fútbol');
INSERT INTO public.tipo_deporte VALUES ('40075637-9fb3-41c6-9bbb-f89ffcd2cebc', 'Tenis');
INSERT INTO public.tipo_deporte VALUES ('b8afcf76-178e-491a-8dab-955f3c3b9cb4', 'Básquet');
INSERT INTO public.tipo_deporte VALUES ('099aa7ff-6070-45e7-95fc-58f79cfd976f', 'Vóley');


--
-- TOC entry 3722 (class 2606 OID 22340)
-- Name: canchas canchas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT canchas_pkey PRIMARY KEY (id_cancha);


--
-- TOC entry 3718 (class 2606 OID 19980)
-- Name: club_config club_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_config
    ADD CONSTRAINT club_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 22387)
-- Name: detalle_reserva detalle_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_reserva
    ADD CONSTRAINT detalle_reserva_pkey PRIMARY KEY (id_detalle);


--
-- TOC entry 3736 (class 2606 OID 33590)
-- Name: estado_pago estado_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_pago
    ADD CONSTRAINT estado_pago_pkey PRIMARY KEY (id_pago);


--
-- TOC entry 3726 (class 2606 OID 22361)
-- Name: estado_reserva estado_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_reserva
    ADD CONSTRAINT estado_reserva_pkey PRIMARY KEY (id_estado);


--
-- TOC entry 3724 (class 2606 OID 22353)
-- Name: jugadores jugadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_pkey PRIMARY KEY (id_jugador);


--
-- TOC entry 3732 (class 2606 OID 33581)
-- Name: metodo_pago metodo_pago_descripcion_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT metodo_pago_descripcion_key UNIQUE (descripcion);


--
-- TOC entry 3734 (class 2606 OID 33579)
-- Name: metodo_pago metodo_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT metodo_pago_pkey PRIMARY KEY (id_metodo);


--
-- TOC entry 3728 (class 2606 OID 22369)
-- Name: reserva reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_pkey PRIMARY KEY (id_reserva);


--
-- TOC entry 3720 (class 2606 OID 22332)
-- Name: tipo_deporte tipo_deporte_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_deporte
    ADD CONSTRAINT tipo_deporte_pkey PRIMARY KEY (id_deporte);


--
-- TOC entry 3737 (class 2606 OID 22341)
-- Name: canchas canchas_id_deporte_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT canchas_id_deporte_fkey FOREIGN KEY (id_deporte) REFERENCES public.tipo_deporte(id_deporte) ON DELETE CASCADE;


--
-- TOC entry 3740 (class 2606 OID 22393)
-- Name: detalle_reserva detalle_reserva_id_cancha_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_reserva
    ADD CONSTRAINT detalle_reserva_id_cancha_fkey FOREIGN KEY (id_cancha) REFERENCES public.canchas(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 3741 (class 2606 OID 33596)
-- Name: detalle_reserva detalle_reserva_id_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_reserva
    ADD CONSTRAINT detalle_reserva_id_pago_fkey FOREIGN KEY (id_pago) REFERENCES public.estado_pago(id_pago) ON DELETE CASCADE;


--
-- TOC entry 3742 (class 2606 OID 22388)
-- Name: detalle_reserva detalle_reserva_id_reserva_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_reserva
    ADD CONSTRAINT detalle_reserva_id_reserva_fkey FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 3743 (class 2606 OID 33591)
-- Name: estado_pago estado_pago_id_metodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_pago
    ADD CONSTRAINT estado_pago_id_metodo_fkey FOREIGN KEY (id_metodo) REFERENCES public.metodo_pago(id_metodo) ON DELETE CASCADE;


--
-- TOC entry 3738 (class 2606 OID 22375)
-- Name: reserva reserva_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estado_reserva(id_estado) ON DELETE CASCADE;


--
-- TOC entry 3739 (class 2606 OID 22370)
-- Name: reserva reserva_id_jugador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_id_jugador_fkey FOREIGN KEY (id_jugador) REFERENCES public.jugadores(id_jugador) ON DELETE CASCADE;


--
-- TOC entry 3895 (class 3256 OID 19983)
-- Name: club_config Admin Insert Club Config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin Insert Club Config" ON public.club_config FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- TOC entry 3894 (class 3256 OID 19982)
-- Name: club_config Admin Update Club Config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin Update Club Config" ON public.club_config FOR UPDATE USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));


--
-- TOC entry 3896 (class 3256 OID 19984)
-- Name: club_config Bloqueo Borrado Club Config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Bloqueo Borrado Club Config" ON public.club_config FOR DELETE USING (false);


--
-- TOC entry 3893 (class 3256 OID 19981)
-- Name: club_config Lectura pública info club; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Lectura pública info club" ON public.club_config FOR SELECT USING (true);


--
-- TOC entry 3897 (class 3256 OID 33744)
-- Name: jugadores Permitir update publico; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir update publico" ON public.jugadores FOR UPDATE USING (true) WITH CHECK (true);


--
-- TOC entry 3892 (class 0 OID 19969)
-- Dependencies: 394
-- Name: club_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_config ENABLE ROW LEVEL SECURITY;

-- Completed on 2026-06-09 21:33:14

--
-- PostgreSQL database dump complete
--

