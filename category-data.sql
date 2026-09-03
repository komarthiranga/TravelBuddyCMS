--
-- PostgreSQL database dump
--

\restrict Sqh7qyMqPKJ7VqyEHLLanEYQkhMV0v9RVKZCbhrCmHOeb9l5us8BT0hOAC4xWJb

-- Dumped from database version 17.11 (Homebrew)
-- Dumped by pg_dump version 17.11 (Homebrew)

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
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (1, 'Park', 'Attraction', 'PARK', '2026-09-02 12:55:06.45376+05:30', '2026-09-02 12:55:06.45376+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (2, 'Religious Place', 'Attraction', 'RELIGIOUS_PLACE', '2026-09-02 12:58:08.796558+05:30', '2026-09-02 12:58:08.796558+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (4, 'Waterfall', 'Attraction', 'WATERFALL', '2026-09-02 19:11:13.325533+05:30', '2026-09-02 19:11:13.325533+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (5, 'Viewpoint', 'Attraction', 'VIEWPOINT', '2026-09-02 19:12:41.471073+05:30', '2026-09-02 19:12:41.471073+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (6, 'Lake and Dam', 'Attraction', 'LAKE_AND_DAM', '2026-09-02 19:13:00.726346+05:30', '2026-09-02 19:13:00.726346+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (7, 'Museum', 'Attraction', 'MUSEUM', '2026-09-02 19:13:18.061656+05:30', '2026-09-02 19:13:18.061656+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (8, 'Historical Place', 'Attraction', 'HISTORICAL_PLACE', '2026-09-02 19:13:40.836314+05:30', '2026-09-02 19:13:40.836314+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (10, 'Garden', 'Attraction', 'GARDEN', '2026-09-02 19:14:23.076795+05:30', '2026-09-02 19:14:23.076795+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (12, 'Wildlife', 'Attraction', 'WILDLIFE', '2026-09-02 19:15:06.04518+05:30', '2026-09-02 19:15:06.04518+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (13, 'Adventure', 'Attraction', 'ADVENTURE', '2026-09-02 19:15:32.461605+05:30', '2026-09-02 19:15:32.461605+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (14, 'Market', 'Attraction', 'MARKET', '2026-09-02 19:15:57.535362+05:30', '2026-09-02 19:15:57.535362+05:30');
INSERT INTO public.category (id, name, category_type, code, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES (9, 'Tea Plantation', 'Attraction', 'TEA_PLANTATION', '2026-09-02 19:14:06.145144+05:30', '2026-09-02 19:51:36.347+05:30');


--
-- Name: category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.category_id_seq', 14, true);


--
-- PostgreSQL database dump complete
--

\unrestrict Sqh7qyMqPKJ7VqyEHLLanEYQkhMV0v9RVKZCbhrCmHOeb9l5us8BT0hOAC4xWJb

