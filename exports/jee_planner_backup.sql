--
-- PostgreSQL database dump
--

\restrict lMvStBZax2iSqyPAXFWm31mdR7wGebsInDloBVnsGtd3Oe6lw5srGwUdb74nSEj

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.holidays (
    id integer NOT NULL,
    name text NOT NULL,
    date text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.holidays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: holidays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.holidays_id_seq OWNED BY public.holidays.id;


--
-- Name: monthly_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_goals (
    id integer NOT NULL,
    title text NOT NULL,
    subject text DEFAULT 'Custom'::text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: monthly_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.monthly_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: monthly_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.monthly_goals_id_seq OWNED BY public.monthly_goals.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    theme text DEFAULT 'dark'::text NOT NULL,
    accent_color text DEFAULT '#6366f1'::text NOT NULL,
    jee_main_date text DEFAULT '2026-01-22'::text NOT NULL,
    jee_advanced_date text DEFAULT '2026-05-18'::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: syllabus_chapters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.syllabus_chapters (
    id integer NOT NULL,
    subject text NOT NULL,
    track text NOT NULL,
    chapter text NOT NULL,
    status text DEFAULT 'not_started'::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: syllabus_chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.syllabus_chapters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: syllabus_chapters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.syllabus_chapters_id_seq OWNED BY public.syllabus_chapters.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title text NOT NULL,
    subject text DEFAULT 'Custom'::text NOT NULL,
    chapter text,
    due_date text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tests (
    id integer NOT NULL,
    name text NOT NULL,
    date text NOT NULL,
    "time" text NOT NULL,
    type text DEFAULT 'mock'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: tests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tests_id_seq OWNED BY public.tests.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: holidays id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays ALTER COLUMN id SET DEFAULT nextval('public.holidays_id_seq'::regclass);


--
-- Name: monthly_goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_goals ALTER COLUMN id SET DEFAULT nextval('public.monthly_goals_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: syllabus_chapters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.syllabus_chapters ALTER COLUMN id SET DEFAULT nextval('public.syllabus_chapters_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: tests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests ALTER COLUMN id SET DEFAULT nextval('public.tests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.holidays (id, name, date, created_at) FROM stdin;
13	Bakrid	2026-05-28	2026-07-01 12:38:16.947299
14	Independence Day	2026-08-15	2026-07-01 12:38:16.947299
15	Varamahalakshmi Vrata	2026-08-21	2026-07-01 12:38:16.947299
16	Ganesha Chathurthi	2026-09-14	2026-07-01 12:38:16.947299
17	Gandhi Jayanti	2026-10-02	2026-07-01 12:38:16.947299
18	Mahalaya Amavasye	2026-10-10	2026-07-01 12:38:16.947299
19	Dasara	2026-10-19	2026-07-01 12:38:16.947299
20	Dasara	2026-10-20	2026-07-01 12:38:16.947299
21	Dasara	2026-10-21	2026-07-01 12:38:16.947299
22	Deepavali	2026-11-09	2026-07-01 12:38:16.947299
23	Deepavali	2026-11-10	2026-07-01 12:38:16.947299
24	Christmas	2026-12-25	2026-07-01 12:38:16.947299
\.


--
-- Data for Name: monthly_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.monthly_goals (id, title, subject, month, year, priority, completed, notes, created_at, user_id) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
kzZIHIrLUweJhXOg3orgM13lVDBiTVoG	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-04T10:50:49.898Z","httpOnly":true,"path":"/","sameSite":"lax"},"userId":3,"username":"alice_test"}	2026-08-04 10:51:00
GWn49qFyFssYE_K6ef8h6Be0GKS71Mzw	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-04T10:50:50.286Z","httpOnly":true,"path":"/","sameSite":"lax"},"userId":4,"username":"bob_test"}	2026-08-04 10:51:00
UdYaRnDgZhIaXrj5YaLMVkBlddixHql6	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-04T10:54:22.812Z","httpOnly":true,"path":"/","sameSite":"lax"},"userId":5,"username":"Test"}	2026-08-05 14:23:00
8vUd-rT0klEIGG-4wNF_J_HszW3iV1px	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-04T10:31:59.220Z","httpOnly":true,"path":"/","sameSite":"lax"},"userId":2,"username":"verifyuser"}	2026-08-04 10:32:00
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, theme, accent_color, jee_main_date, jee_advanced_date, updated_at, user_id) FROM stdin;
4	dark	#4aff00	2027-01-22	2027-05-18	2026-07-05 10:54:22.769176	5
\.


--
-- Data for Name: syllabus_chapters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.syllabus_chapters (id, subject, track, chapter, status, updated_at, user_id) FROM stdin;
208	Physics	01	Vectors	not_started	2026-07-05 10:54:22.795582	5
209	Physics	01	Rectilinear Motion	not_started	2026-07-05 10:54:22.795582	5
210	Physics	01	Projectile Motion	not_started	2026-07-05 10:54:22.795582	5
211	Physics	01	Relative Motion	not_started	2026-07-05 10:54:22.795582	5
212	Physics	01	Circular Kinematics	not_started	2026-07-05 10:54:22.795582	5
213	Physics	01	Work, Power, and Energy	not_started	2026-07-05 10:54:22.795582	5
214	Physics	01	COM, Momentum, and Collision	not_started	2026-07-05 10:54:22.795582	5
215	Physics	01	Rigid Body Mechanics	not_started	2026-07-05 10:54:22.795582	5
216	Physics	01	Simple Harmonic Motion	not_started	2026-07-05 10:54:22.795582	5
217	Physics	01	Gravitation	not_started	2026-07-05 10:54:22.795582	5
218	Physics	02	Basic Mathematics	not_started	2026-07-05 10:54:22.795582	5
219	Physics	02	Units and Measurements, Errors, and Experiments	not_started	2026-07-05 10:54:22.795582	5
220	Physics	02	Newton's Laws of Motion	not_started	2026-07-05 10:54:22.795582	5
221	Physics	02	Mechanical Properties of Solids (Elasticity)	not_started	2026-07-05 10:54:22.795582	5
222	Physics	02	Thermometry	not_started	2026-07-05 10:54:22.795582	5
223	Physics	02	Thermal Expansion	not_started	2026-07-05 10:54:22.795582	5
224	Physics	02	Calorimetry	not_started	2026-07-05 10:54:22.795582	5
225	Physics	02	Heat Transfer	not_started	2026-07-05 10:54:22.795582	5
226	Physics	02	Kinetic Theory of Gases	not_started	2026-07-05 10:54:22.795582	5
227	Physics	02	Thermodynamics	not_started	2026-07-05 10:54:22.795582	5
228	Physics	02	Fluid Mechanics	not_started	2026-07-05 10:54:22.795582	5
229	Physics	02	Transverse Waves (String Waves)	not_started	2026-07-05 10:54:22.795582	5
230	Physics	02	Longitudinal Waves (Sound Waves)	not_started	2026-07-05 10:54:22.795582	5
231	Chemistry	01	Atomic Structure	not_started	2026-07-05 10:54:22.795582	5
232	Chemistry	01	Chemical Bonding	not_started	2026-07-05 10:54:22.795582	5
233	Chemistry	01	Gaseous States	not_started	2026-07-05 10:54:22.795582	5
234	Chemistry	01	Liquids	not_started	2026-07-05 10:54:22.795582	5
235	Chemistry	01	Thermodynamics	not_started	2026-07-05 10:54:22.795582	5
236	Chemistry	01	Thermochemistry	not_started	2026-07-05 10:54:22.795582	5
237	Chemistry	01	Chemical Equilibrium	not_started	2026-07-05 10:54:22.795582	5
238	Chemistry	01	Ionic Equilibrium	not_started	2026-07-05 10:54:22.795582	5
239	Chemistry	01	Redox Reactions	not_started	2026-07-05 10:54:22.795582	5
240	Chemistry	01	Equivalent Concept and Volumetric Analysis	not_started	2026-07-05 10:54:22.795582	5
241	Chemistry	02	Some Basic Concepts of Chemistry (Mole Concept)	not_started	2026-07-05 10:54:22.795582	5
242	Chemistry	02	Periodic Classification	not_started	2026-07-05 10:54:22.795582	5
243	Chemistry	02	IUPAC Nomenclature	not_started	2026-07-05 10:54:22.795582	5
244	Chemistry	02	Physical Properties, Qualitative and Quantitative Analysis	not_started	2026-07-05 10:54:22.795582	5
245	Chemistry	02	GOC-I	not_started	2026-07-05 10:54:22.795582	5
246	Chemistry	02	GOC-II	not_started	2026-07-05 10:54:22.795582	5
247	Chemistry	02	Stereochemistry	not_started	2026-07-05 10:54:22.795582	5
248	Chemistry	02	Hydrocarbons	not_started	2026-07-05 10:54:22.795582	5
249	Chemistry	02	Hydrogen	not_started	2026-07-05 10:54:22.795582	5
250	Chemistry	02	s-Block Elements	not_started	2026-07-05 10:54:22.795582	5
251	Chemistry	02	Environmental Chemistry	not_started	2026-07-05 10:54:22.795582	5
252	Chemistry	02	p-Block Elements	not_started	2026-07-05 10:54:22.795582	5
253	Maths	01	Basic Maths	not_started	2026-07-05 10:54:22.795582	5
254	Maths	01	Trigonometric Ratios and Identities	not_started	2026-07-05 10:54:22.795582	5
255	Maths	01	Trigonometric Equations and Inequalities	not_started	2026-07-05 10:54:22.795582	5
256	Maths	01	Properties of Triangles	not_started	2026-07-05 10:54:22.795582	5
257	Maths	01	Introduction to Co-ordinate Geometry	not_started	2026-07-05 10:54:22.795582	5
258	Maths	01	Straight Lines	not_started	2026-07-05 10:54:22.795582	5
259	Maths	01	Introduction to 3D Geometry	not_started	2026-07-05 10:54:22.795582	5
260	Maths	01	Pair of Lines	not_started	2026-07-05 10:54:22.795582	5
261	Maths	01	Circles	not_started	2026-07-05 10:54:22.795582	5
262	Maths	01	Conic Sections	not_started	2026-07-05 10:54:22.795582	5
263	Maths	01	Statistics	not_started	2026-07-05 10:54:22.795582	5
264	Maths	01	Limits	not_started	2026-07-05 10:54:22.795582	5
265	Maths	01	Methods of Differentiation	not_started	2026-07-05 10:54:22.795582	5
266	Maths	02	Sets	not_started	2026-07-05 10:54:22.795582	5
267	Maths	02	Relations	not_started	2026-07-05 10:54:22.795582	5
268	Maths	02	Introduction to Functions	not_started	2026-07-05 10:54:22.795582	5
269	Maths	02	Linear Inequalities	not_started	2026-07-05 10:54:22.795582	5
270	Maths	02	Fundamentals of Mathematics	not_started	2026-07-05 10:54:22.795582	5
271	Maths	02	Quadratic Equations and Expressions	not_started	2026-07-05 10:54:22.795582	5
272	Maths	02	Sequence and Series	not_started	2026-07-05 10:54:22.795582	5
273	Maths	02	Binomial Theorem	not_started	2026-07-05 10:54:22.795582	5
274	Maths	02	Permutations and Combinations	not_started	2026-07-05 10:54:22.795582	5
275	Maths	02	Functions	not_started	2026-07-05 10:54:22.795582	5
276	Maths	02	Probability	not_started	2026-07-05 10:54:22.795582	5
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, title, subject, chapter, due_date, priority, completed, notes, created_at, user_id) FROM stdin;
\.


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tests (id, name, date, "time", type, notes, created_at, user_id) FROM stdin;
133	Weekly Test - Physics 1	2026-04-27	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
134	Weekly Test - Chemistry 1	2026-05-04	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
135	Weekly Test - Maths 1	2026-05-11	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
136	Main Test 1	2026-05-24	09:00	mock	\N	2026-07-05 10:54:22.791227	5
137	Weekly Test - Physics 2	2026-06-01	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
138	Weekly Test - Chemistry 2	2026-06-08	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
139	Main Test 2	2026-06-21	09:00	mock	\N	2026-07-05 10:54:22.791227	5
140	Weekly Test - Maths 2	2026-06-29	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
141	Weekly Test - Physics 3	2026-07-06	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
142	Main Test 3	2026-07-19	09:00	mock	\N	2026-07-05 10:54:22.791227	5
143	Advanced Test 1 (One paper)	2026-07-19	14:00	jee	One paper	2026-07-05 10:54:22.791227	5
144	Weekly Test - Chemistry 3	2026-07-27	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
145	1st Quarterly Exam & CET-1	2026-08-03	09:00	school	3 Aug – 7 Aug 2026	2026-07-05 10:54:22.791227	5
146	Main Test 4	2026-08-23	09:00	mock	\N	2026-07-05 10:54:22.791227	5
147	Advanced Test 2 (One paper)	2026-08-23	14:00	jee	One paper	2026-07-05 10:54:22.791227	5
148	Weekly Test - Maths 3	2026-08-31	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
149	Weekly Test - Physics 4	2026-09-07	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
150	Main Test 5	2026-09-19	09:00	mock	\N	2026-07-05 10:54:22.791227	5
151	Advanced Test 3 (Two papers)	2026-09-20	09:00	jee	Two papers	2026-07-05 10:54:22.791227	5
152	Midterm Exam & CET-2	2026-09-25	09:00	school	25 Sep – 9 Oct 2026	2026-07-05 10:54:22.791227	5
153	Weekly Test - Chemistry 4	2026-11-02	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
154	Main Test 6	2026-11-21	09:00	mock	\N	2026-07-05 10:54:22.791227	5
155	Advanced Test 4 (Two papers)	2026-11-22	09:00	jee	Two papers	2026-07-05 10:54:22.791227	5
156	Weekly Test - Maths 4	2026-11-30	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
157	2nd Quarterly Exam & CET-3	2026-12-10	09:00	school	10 Dec – 15 Dec 2026	2026-07-05 10:54:22.791227	5
158	Weekly Test - Physics 5	2026-12-21	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
159	Main Test 7	2027-01-02	09:00	mock	\N	2026-07-05 10:54:22.791227	5
160	Advanced Test 5 (Two papers)	2027-01-03	09:00	jee	Two papers	2026-07-05 10:54:22.791227	5
161	Weekly Test - Chemistry 5	2027-01-11	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
162	Weekly Test - Maths 5	2027-01-18	09:00	coaching	\N	2026-07-05 10:54:22.791227	5
163	Main Test 8	2027-01-27	09:00	mock	\N	2026-07-05 10:54:22.791227	5
164	Advanced Test 6 (Two papers)	2027-01-28	09:00	jee	Two papers	2026-07-05 10:54:22.791227	5
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, created_at) FROM stdin;
5	Test	$2b$12$Uv6lbmOejwTv6qfiuqXj8.xuyp9zir4Pkqd8c0v.YKTUZIr8Kr0he	2026-07-05 10:54:22.759078+00
\.


--
-- Name: holidays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.holidays_id_seq', 24, true);


--
-- Name: monthly_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.monthly_goals_id_seq', 1, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 4, true);


--
-- Name: syllabus_chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.syllabus_chapters_id_seq', 276, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tasks_id_seq', 9, true);


--
-- Name: tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tests_id_seq', 164, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: monthly_goals monthly_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_goals
    ADD CONSTRAINT monthly_goals_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: settings settings_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_unique UNIQUE (user_id);


--
-- Name: syllabus_chapters syllabus_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.syllabus_chapters
    ADD CONSTRAINT syllabus_chapters_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: monthly_goals monthly_goals_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_goals
    ADD CONSTRAINT monthly_goals_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: settings settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: syllabus_chapters syllabus_chapters_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.syllabus_chapters
    ADD CONSTRAINT syllabus_chapters_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tests tests_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict lMvStBZax2iSqyPAXFWm31mdR7wGebsInDloBVnsGtd3Oe6lw5srGwUdb74nSEj

