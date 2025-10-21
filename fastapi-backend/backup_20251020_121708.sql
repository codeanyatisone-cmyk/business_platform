--
-- PostgreSQL database dump
--

\restrict 8vbwANoAZCwaQlvcWuaOYk40dqKhDjIizH0JIFsi5k2jDAGH0lvG5QyRTjG8L7W

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

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

--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."AccountType" AS ENUM (
    'bank',
    'cash',
    'card'
);


ALTER TYPE public."AccountType" OWNER TO alisherbilalov;

--
-- Name: CourseStatus; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."CourseStatus" AS ENUM (
    'draft',
    'active',
    'archived'
);


ALTER TYPE public."CourseStatus" OWNER TO alisherbilalov;

--
-- Name: Currency; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."Currency" AS ENUM (
    'KZT',
    'USD',
    'RUB',
    'EUR'
);


ALTER TYPE public."Currency" OWNER TO alisherbilalov;

--
-- Name: DependencyType; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."DependencyType" AS ENUM (
    'blocks',
    'relatedTo',
    'duplicates'
);


ALTER TYPE public."DependencyType" OWNER TO alisherbilalov;

--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'active',
    'inactive',
    'terminated'
);


ALTER TYPE public."EmployeeStatus" OWNER TO alisherbilalov;

--
-- Name: EpicStatus; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."EpicStatus" AS ENUM (
    'active',
    'completed',
    'archived'
);


ALTER TYPE public."EpicStatus" OWNER TO alisherbilalov;

--
-- Name: SprintStatus; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."SprintStatus" AS ENUM (
    'planning',
    'active',
    'completed',
    'cancelled'
);


ALTER TYPE public."SprintStatus" OWNER TO alisherbilalov;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'new',
    'inProgress',
    'review',
    'completed',
    'postponed'
);


ALTER TYPE public."TaskStatus" OWNER TO alisherbilalov;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."TransactionType" AS ENUM (
    'income',
    'expense'
);


ALTER TYPE public."TransactionType" OWNER TO alisherbilalov;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public."UserRole" AS ENUM (
    'user',
    'manager',
    'admin',
    'owner'
);


ALTER TYPE public."UserRole" OWNER TO alisherbilalov;

--
-- Name: coursestatus; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public.coursestatus AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public.coursestatus OWNER TO alisherbilalov;

--
-- Name: taskpriority; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public.taskpriority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public.taskpriority OWNER TO alisherbilalov;

--
-- Name: taskstatus; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public.taskstatus AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public.taskstatus OWNER TO alisherbilalov;

--
-- Name: transactiontype; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public.transactiontype AS ENUM (
    'INCOME',
    'EXPENSE',
    'TRANSFER'
);


ALTER TYPE public.transactiontype OWNER TO alisherbilalov;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: alisherbilalov
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'MANAGER',
    'EMPLOYEE',
    'VIEWER'
);


ALTER TYPE public.userrole OWNER TO alisherbilalov;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _CourseToProgram; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public."_CourseToProgram" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_CourseToProgram" OWNER TO alisherbilalov;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    name text NOT NULL,
    currency public."Currency" NOT NULL,
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    type public."AccountType" NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    company_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.accounts OWNER TO alisherbilalov;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_id_seq OWNER TO alisherbilalov;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO alisherbilalov;

--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.checklist_items (
    id text NOT NULL,
    task_id integer NOT NULL,
    text text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.checklist_items OWNER TO alisherbilalov;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    logo text,
    industry text,
    website text,
    email text,
    phone text,
    address text,
    tax_id text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO alisherbilalov;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_id_seq OWNER TO alisherbilalov;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    author text NOT NULL,
    author_id integer NOT NULL,
    participants integer[],
    views integer DEFAULT 0 NOT NULL,
    status public."CourseStatus" DEFAULT 'draft'::public."CourseStatus" NOT NULL,
    category text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    company_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.courses OWNER TO alisherbilalov;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.courses_id_seq OWNER TO alisherbilalov;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name text NOT NULL,
    description text,
    manager_id integer,
    parent_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO alisherbilalov;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_id_seq OWNER TO alisherbilalov;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    avatar text NOT NULL,
    email text,
    phone text,
    hire_date timestamp(3) without time zone NOT NULL,
    birth_date timestamp(3) without time zone NOT NULL,
    status public."EmployeeStatus" DEFAULT 'active'::public."EmployeeStatus" NOT NULL,
    salary numeric(12,2),
    schedule text NOT NULL,
    recruiter text,
    hr text,
    termination_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    company_id integer DEFAULT 1 NOT NULL,
    department_id integer
);


ALTER TABLE public.employees OWNER TO alisherbilalov;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_id_seq OWNER TO alisherbilalov;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: epics; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.epics (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title text NOT NULL,
    description text,
    color text DEFAULT '#3B82F6'::text,
    status public."EpicStatus" DEFAULT 'active'::public."EpicStatus" NOT NULL,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.epics OWNER TO alisherbilalov;

--
-- Name: epics_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.epics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.epics_id_seq OWNER TO alisherbilalov;

--
-- Name: epics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.epics_id_seq OWNED BY public.epics.id;


--
-- Name: knowledge_articles; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.knowledge_articles (
    id integer NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    folder_id integer,
    views integer DEFAULT 0 NOT NULL,
    author text NOT NULL,
    author_id integer NOT NULL,
    tags text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    cover_image text,
    icon text,
    content jsonb NOT NULL,
    company_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.knowledge_articles OWNER TO alisherbilalov;

--
-- Name: knowledge_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.knowledge_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knowledge_articles_id_seq OWNER TO alisherbilalov;

--
-- Name: knowledge_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.knowledge_articles_id_seq OWNED BY public.knowledge_articles.id;


--
-- Name: knowledge_folders; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.knowledge_folders (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    parent_id integer,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    company_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.knowledge_folders OWNER TO alisherbilalov;

--
-- Name: knowledge_folders_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.knowledge_folders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knowledge_folders_id_seq OWNER TO alisherbilalov;

--
-- Name: knowledge_folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.knowledge_folders_id_seq OWNED BY public.knowledge_folders.id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    order_number integer NOT NULL,
    duration integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lessons OWNER TO alisherbilalov;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lessons_id_seq OWNER TO alisherbilalov;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: news; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.news (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    author text NOT NULL,
    image text,
    category text NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    company_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.news OWNER TO alisherbilalov;

--
-- Name: news_comments; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.news_comments (
    id integer NOT NULL,
    news_id integer NOT NULL,
    author text NOT NULL,
    author_avatar text NOT NULL,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.news_comments OWNER TO alisherbilalov;

--
-- Name: news_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.news_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.news_comments_id_seq OWNER TO alisherbilalov;

--
-- Name: news_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.news_comments_id_seq OWNED BY public.news_comments.id;


--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.news_id_seq OWNER TO alisherbilalov;

--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: programs; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.programs (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    participants integer[],
    course_ids integer[],
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    company_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.programs OWNER TO alisherbilalov;

--
-- Name: programs_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.programs_id_seq OWNER TO alisherbilalov;

--
-- Name: programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.programs_id_seq OWNED BY public.programs.id;


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.quiz_attempts (
    id integer NOT NULL,
    quiz_id integer NOT NULL,
    employee_id integer NOT NULL,
    answers jsonb NOT NULL,
    score integer NOT NULL,
    passed boolean NOT NULL,
    completed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quiz_attempts OWNER TO alisherbilalov;

--
-- Name: quiz_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.quiz_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quiz_attempts_id_seq OWNER TO alisherbilalov;

--
-- Name: quiz_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.quiz_attempts_id_seq OWNED BY public.quiz_attempts.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.quizzes (
    id integer NOT NULL,
    article_id integer NOT NULL,
    title text NOT NULL,
    questions jsonb NOT NULL,
    passing_score integer DEFAULT 70 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quizzes OWNER TO alisherbilalov;

--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quizzes_id_seq OWNER TO alisherbilalov;

--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: sprints; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.sprints (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name text NOT NULL,
    goal text,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    status public."SprintStatus" DEFAULT 'planning'::public."SprintStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sprints OWNER TO alisherbilalov;

--
-- Name: sprints_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.sprints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sprints_id_seq OWNER TO alisherbilalov;

--
-- Name: sprints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.sprints_id_seq OWNED BY public.sprints.id;


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.task_comments (
    id text NOT NULL,
    task_id integer NOT NULL,
    author_id integer NOT NULL,
    content text NOT NULL,
    changes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_comments OWNER TO alisherbilalov;

--
-- Name: task_dependencies; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.task_dependencies (
    id integer NOT NULL,
    task_id integer NOT NULL,
    depends_on_task_id integer NOT NULL,
    type public."DependencyType" DEFAULT 'blocks'::public."DependencyType" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_dependencies OWNER TO alisherbilalov;

--
-- Name: task_dependencies_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.task_dependencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_dependencies_id_seq OWNER TO alisherbilalov;

--
-- Name: task_dependencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.task_dependencies_id_seq OWNED BY public.task_dependencies.id;


--
-- Name: task_watchers; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.task_watchers (
    id integer NOT NULL,
    task_id integer NOT NULL,
    employee_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_watchers OWNER TO alisherbilalov;

--
-- Name: task_watchers_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.task_watchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_watchers_id_seq OWNER TO alisherbilalov;

--
-- Name: task_watchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.task_watchers_id_seq OWNED BY public.task_watchers.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    product text,
    status public."TaskStatus" DEFAULT 'new'::public."TaskStatus" NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    assignee_id integer NOT NULL,
    creator_id integer NOT NULL,
    due_date timestamp(3) without time zone,
    tags text[],
    category text,
    parent_task_id integer,
    is_favorite boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    company_id integer DEFAULT 1 NOT NULL,
    actual_hours double precision DEFAULT 0,
    custom_fields jsonb,
    epic_id integer,
    estimated_hours double precision,
    labels text[],
    sprint_id integer,
    story_points integer
);


ALTER TABLE public.tasks OWNER TO alisherbilalov;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO alisherbilalov;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: time_logs; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.time_logs (
    id integer NOT NULL,
    task_id integer NOT NULL,
    employee_id integer NOT NULL,
    hours double precision NOT NULL,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.time_logs OWNER TO alisherbilalov;

--
-- Name: time_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.time_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.time_logs_id_seq OWNER TO alisherbilalov;

--
-- Name: time_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.time_logs_id_seq OWNED BY public.time_logs.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    type public."TransactionType" NOT NULL,
    category text NOT NULL,
    amount numeric(15,2) NOT NULL,
    currency public."Currency" NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    project text,
    counterparty text,
    account text NOT NULL,
    created_by_id integer NOT NULL,
    tags text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    company_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.transactions OWNER TO alisherbilalov;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO alisherbilalov;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: alisherbilalov
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'user'::public."UserRole" NOT NULL,
    employee_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO alisherbilalov;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: alisherbilalov
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO alisherbilalov;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alisherbilalov
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: epics id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.epics ALTER COLUMN id SET DEFAULT nextval('public.epics_id_seq'::regclass);


--
-- Name: knowledge_articles id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_articles ALTER COLUMN id SET DEFAULT nextval('public.knowledge_articles_id_seq'::regclass);


--
-- Name: knowledge_folders id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_folders ALTER COLUMN id SET DEFAULT nextval('public.knowledge_folders_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: news_comments id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.news_comments ALTER COLUMN id SET DEFAULT nextval('public.news_comments_id_seq'::regclass);


--
-- Name: programs id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.programs ALTER COLUMN id SET DEFAULT nextval('public.programs_id_seq'::regclass);


--
-- Name: quiz_attempts id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN id SET DEFAULT nextval('public.quiz_attempts_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: sprints id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.sprints ALTER COLUMN id SET DEFAULT nextval('public.sprints_id_seq'::regclass);


--
-- Name: task_dependencies id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_dependencies ALTER COLUMN id SET DEFAULT nextval('public.task_dependencies_id_seq'::regclass);


--
-- Name: task_watchers id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_watchers ALTER COLUMN id SET DEFAULT nextval('public.task_watchers_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: time_logs id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.time_logs ALTER COLUMN id SET DEFAULT nextval('public.time_logs_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _CourseToProgram; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public."_CourseToProgram" ("A", "B") FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.accounts (id, name, currency, balance, type, description, created_at, updated_at, company_id) FROM stdin;
9	Наличные	KZT	250000.00	cash	\N	2025-10-14 13:03:34.715	2025-10-14 13:03:34.715	3
10	Основной счет	KZT	1500000.00	bank	\N	2025-10-14 13:03:34.715	2025-10-14 13:03:34.715	3
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.alembic_version (version_num) FROM stdin;
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.checklist_items (id, task_id, text, completed, created_at) FROM stdin;
17feaca7-6c44-44a9-acae-ec5a1ade4714	21	Настроить JWT модуль	t	2025-10-14 13:03:34.71
b31f857f-7ac1-4898-902d-3b5e3f528ad9	21	Создать страницу логина	t	2025-10-14 13:03:34.71
c8514812-4cc5-4a18-9cb7-208b4a56a0d1	21	Добавить защиту роутов	f	2025-10-14 13:03:34.71
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.companies (id, name, description, logo, industry, website, email, phone, address, tax_id, is_active, created_at, updated_at) FROM stdin;
3	TKO Company	IT компания, специализирующаяся на разработке бизнес-приложений	\N	IT & Software	https://tko.kz	info@tko.kz	+7 (777) 123-45-67	Алматы, Казахстан	123456789012	t	2025-10-14 13:03:34.597	2025-10-14 13:03:34.597
4	Тестовая Компания	Компания для тестирования multi-tenancy	\N	Consulting	\N	\N	\N	\N	\N	t	2025-10-14 13:03:34.609	2025-10-14 13:03:34.609
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.courses (id, title, description, author, author_id, participants, views, status, category, created_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.departments (id, company_id, name, description, manager_id, parent_id, is_active, created_at, updated_at) FROM stdin;
8	3	Управление	Руководство компании	\N	\N	t	2025-10-14 13:03:34.611	2025-10-14 13:03:34.611
9	3	Финансы	Финансовый отдел	\N	\N	t	2025-10-14 13:03:34.611	2025-10-14 13:03:34.611
10	3	Разработка	Отдел разработки	\N	\N	t	2025-10-14 13:03:34.611	2025-10-14 13:03:34.611
11	3	HR	Отдел кадров	\N	\N	t	2025-10-14 13:03:34.611	2025-10-14 13:03:34.611
12	3	Дизайн	Отдел дизайна и креатива	\N	\N	t	2025-10-14 13:03:34.611	2025-10-14 13:03:34.611
13	3	Маркетинг	Отдел маркетинга и продаж	\N	\N	t	2025-10-14 13:03:34.611	2025-10-14 13:03:34.611
14	4	Общий отдел	Общий отдел	\N	\N	t	2025-10-14 13:03:34.624	2025-10-14 13:03:34.624
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.employees (id, name, "position", avatar, email, phone, hire_date, birth_date, status, salary, schedule, recruiter, hr, termination_date, created_at, updated_at, company_id, department_id) FROM stdin;
23	Альтаир	Дизайнер	🎭	altair@tko.kz	+7 (777) 456-78-90	2022-01-15 00:00:00	1997-03-10 00:00:00	active	\N	Полный день	\N	\N	\N	2025-10-14 13:03:34.626	2025-10-14 13:03:34.626	3	12
25	Рами Мохамед	Разработчик	⚡	rami@tko.kz	+7 (777) 678-90-12	2022-05-01 00:00:00	1996-07-25 00:00:00	active	\N	Полный день	\N	\N	\N	2025-10-14 13:03:34.626	2025-10-14 13:03:34.626	3	10
27	Аким Исболған	Креативный директор	🎨	akim@tko.kz	+7 (777) 345-67-89	2020-06-01 00:00:00	1994-08-20 00:00:00	active	\N	Полный день	\N	\N	\N	2025-10-14 13:03:34.626	2025-10-14 13:03:34.626	3	12
22	Алишер Билалов	Руководитель	👔	alisher@tko.kz	+7 (777) 123-45-67	2020-01-01 00:00:00	1995-01-01 00:00:00	active	\N	Полный день	\N	\N	\N	2025-10-14 13:03:34.626	2025-10-14 13:03:34.626	3	8
26	Алмат Сейтжан	Ассистент руководителя	💼	almat@tko.kz	+7 (777) 234-56-78	2021-03-01 00:00:00	1996-05-15 00:00:00	active	\N	Полный день	\N	\N	\N	2025-10-14 13:03:34.626	2025-10-14 13:03:34.626	3	8
24	Ыдырыс Бостан	Разработчик	💻	ydrys@tko.kz	+7 (777) 567-89-01	2021-09-01 00:00:00	1998-11-05 00:00:00	active	\N	Полный день	\N	\N	\N	2025-10-14 13:03:34.626	2025-10-14 13:03:34.626	3	10
\.


--
-- Data for Name: epics; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.epics (id, company_id, title, description, color, status, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: knowledge_articles; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.knowledge_articles (id, title, category, folder_id, views, author, author_id, tags, created_at, updated_at, cover_image, icon, content, company_id) FROM stdin;
\.


--
-- Data for Name: knowledge_folders; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.knowledge_folders (id, title, description, parent_id, created_by, created_at, company_id) FROM stdin;
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.lessons (id, course_id, title, content, order_number, duration, created_at) FROM stdin;
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.news (id, title, content, author, image, category, likes, created_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: news_comments; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.news_comments (id, news_id, author, author_avatar, content, created_at) FROM stdin;
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.programs (id, title, description, participants, course_ids, created_by, created_at, company_id) FROM stdin;
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.quiz_attempts (id, quiz_id, employee_id, answers, score, passed, completed_at) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.quizzes (id, article_id, title, questions, passing_score, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sprints; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.sprints (id, company_id, name, goal, start_date, end_date, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.task_comments (id, task_id, author_id, content, changes, created_at) FROM stdin;
90469b52-559f-4e3f-b6ad-6fb4e58594c7	21	22	Отличная работа! Продолжайте в том же духе.	\N	2025-10-14 13:03:34.714
028db0f5-b4c5-4391-bff4-ea5cad9a295b	21	26	Завтра закончу последний пункт чеклиста.	\N	2025-10-14 13:03:34.714
\.


--
-- Data for Name: task_dependencies; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.task_dependencies (id, task_id, depends_on_task_id, type, created_at) FROM stdin;
\.


--
-- Data for Name: task_watchers; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.task_watchers (id, task_id, employee_id, created_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.tasks (id, title, description, product, status, priority, assignee_id, creator_id, due_date, tags, category, parent_task_id, is_favorite, created_at, updated_at, company_id, actual_hours, custom_fields, epic_id, estimated_hours, labels, sprint_id, story_points) FROM stdin;
20	Оптимизация производительности	Улучшить скорость загрузки и отклик интерфейса	\N	completed	3	24	22	\N	{performance,optimization}	разработка	\N	f	2025-10-14 13:03:34.705	2025-10-14 13:03:34.705	3	0	\N	\N	\N	\N	\N	\N
21	Разработать Business Platform	Создать полнофункциональную бизнес-платформу с модулями задач, финансов, базы знаний	\N	inProgress	5	24	22	2025-02-01 00:00:00	{backend,frontend,fullstack}	разработка	\N	f	2025-10-14 13:03:34.705	2025-10-14 13:03:34.705	3	0	\N	\N	\N	\N	\N	\N
22	Подготовить презентацию для клиента	Создать презентацию новых фич платформы	\N	review	2	26	22	2025-01-18 00:00:00	{presentation,client}	управление	\N	f	2025-10-14 13:03:34.705	2025-10-14 13:03:34.705	3	0	\N	\N	\N	\N	\N	\N
23	Интеграция API платежей	Подключить Kaspi, Stripe и другие платежные системы	\N	new	3	25	22	2025-01-30 00:00:00	{backend,payments,api}	разработка	\N	f	2025-10-14 13:03:34.705	2025-10-14 13:03:34.705	3	0	\N	\N	\N	\N	\N	\N
24	Создать дизайн-систему	Разработать единый стиль и UI компоненты для всех проектов	\N	inProgress	4	23	27	2025-01-25 00:00:00	{design,ui-kit,figma}	дизайн	\N	f	2025-10-14 13:03:34.705	2025-10-14 13:03:34.705	3	0	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: time_logs; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.time_logs (id, task_id, employee_id, hours, description, date, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.transactions (id, type, category, amount, currency, description, date, project, counterparty, account, created_by_id, tags, created_at, updated_at, company_id) FROM stdin;
17	income	sales	500000.00	KZT	Оплата от клиента за проект	2025-01-01 00:00:00	\N	\N	Основной счет	22	{client-payment}	2025-10-14 13:03:34.716	2025-10-14 13:03:34.716	3
18	expense	salary	150000.00	KZT	Зарплата за декабрь	2025-01-05 00:00:00	\N	\N	Основной счет	22	{payroll}	2025-10-14 13:03:34.716	2025-10-14 13:03:34.716	3
19	expense	office	50000.00	KZT	Аренда офиса	2025-01-03 00:00:00	\N	\N	Наличные	22	{rent}	2025-10-14 13:03:34.716	2025-10-14 13:03:34.716	3
20	income	sales	200000.00	KZT	Предоплата за новый проект	2025-01-07 00:00:00	\N	\N	Основной счет	22	{prepayment}	2025-10-14 13:03:34.716	2025-10-14 13:03:34.716	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: alisherbilalov
--

COPY public.users (id, email, password, role, employee_id, created_at, updated_at) FROM stdin;
22	ydrys@tko.kz	$2b$10$YyHqxQrl1.Zh2wHXTdLqtOOCVhjTpzNcYXYNVP/LtRq6C5gx3eYVG	user	24	2025-10-14 13:03:34.701	2025-10-14 13:03:34.701
23	akim@tko.kz	$2b$10$YyHqxQrl1.Zh2wHXTdLqtOOCVhjTpzNcYXYNVP/LtRq6C5gx3eYVG	manager	27	2025-10-14 13:03:34.701	2025-10-14 13:03:34.701
26	alisher@tko.kz	$2b$10$YyHqxQrl1.Zh2wHXTdLqtOOCVhjTpzNcYXYNVP/LtRq6C5gx3eYVG	owner	22	2025-10-14 13:03:34.701	2025-10-14 13:03:34.701
25	rami@tko.kz	$2b$10$YyHqxQrl1.Zh2wHXTdLqtOOCVhjTpzNcYXYNVP/LtRq6C5gx3eYVG	user	25	2025-10-14 13:03:34.701	2025-10-14 13:03:34.701
24	almat@tko.kz	$2b$10$YyHqxQrl1.Zh2wHXTdLqtOOCVhjTpzNcYXYNVP/LtRq6C5gx3eYVG	admin	26	2025-10-14 13:03:34.701	2025-10-14 13:03:34.701
27	altair@tko.kz	$2b$10$YyHqxQrl1.Zh2wHXTdLqtOOCVhjTpzNcYXYNVP/LtRq6C5gx3eYVG	user	23	2025-10-14 13:03:34.701	2025-10-14 13:03:34.701
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.accounts_id_seq', 10, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.companies_id_seq', 4, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.courses_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.departments_id_seq', 14, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.employees_id_seq', 27, true);


--
-- Name: epics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.epics_id_seq', 1, false);


--
-- Name: knowledge_articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.knowledge_articles_id_seq', 1, false);


--
-- Name: knowledge_folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.knowledge_folders_id_seq', 1, false);


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.lessons_id_seq', 1, false);


--
-- Name: news_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.news_comments_id_seq', 1, false);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.news_id_seq', 1, false);


--
-- Name: programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.programs_id_seq', 1, false);


--
-- Name: quiz_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.quiz_attempts_id_seq', 1, false);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 1, false);


--
-- Name: sprints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.sprints_id_seq', 1, false);


--
-- Name: task_dependencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.task_dependencies_id_seq', 1, false);


--
-- Name: task_watchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.task_watchers_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.tasks_id_seq', 24, true);


--
-- Name: time_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.time_logs_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.transactions_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alisherbilalov
--

SELECT pg_catalog.setval('public.users_id_seq', 27, true);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: epics epics_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.epics
    ADD CONSTRAINT epics_pkey PRIMARY KEY (id);


--
-- Name: knowledge_articles knowledge_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_articles
    ADD CONSTRAINT knowledge_articles_pkey PRIMARY KEY (id);


--
-- Name: knowledge_folders knowledge_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_folders
    ADD CONSTRAINT knowledge_folders_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: news_comments news_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.news_comments
    ADD CONSTRAINT news_comments_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: sprints sprints_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_pkey PRIMARY KEY (id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: task_dependencies task_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_pkey PRIMARY KEY (id);


--
-- Name: task_watchers task_watchers_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_watchers
    ADD CONSTRAINT task_watchers_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_logs time_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _CourseToProgram_AB_unique; Type: INDEX; Schema: public; Owner: alisherbilalov
--

CREATE UNIQUE INDEX "_CourseToProgram_AB_unique" ON public."_CourseToProgram" USING btree ("A", "B");


--
-- Name: _CourseToProgram_B_index; Type: INDEX; Schema: public; Owner: alisherbilalov
--

CREATE INDEX "_CourseToProgram_B_index" ON public."_CourseToProgram" USING btree ("B");


--
-- Name: employees_email_key; Type: INDEX; Schema: public; Owner: alisherbilalov
--

CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email);


--
-- Name: task_dependencies_task_id_depends_on_task_id_key; Type: INDEX; Schema: public; Owner: alisherbilalov
--

CREATE UNIQUE INDEX task_dependencies_task_id_depends_on_task_id_key ON public.task_dependencies USING btree (task_id, depends_on_task_id);


--
-- Name: task_watchers_task_id_employee_id_key; Type: INDEX; Schema: public; Owner: alisherbilalov
--

CREATE UNIQUE INDEX task_watchers_task_id_employee_id_key ON public.task_watchers USING btree (task_id, employee_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: alisherbilalov
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_employee_id_key; Type: INDEX; Schema: public; Owner: alisherbilalov
--

CREATE UNIQUE INDEX users_employee_id_key ON public.users USING btree (employee_id);


--
-- Name: _CourseToProgram _CourseToProgram_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public."_CourseToProgram"
    ADD CONSTRAINT "_CourseToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CourseToProgram _CourseToProgram_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public."_CourseToProgram"
    ADD CONSTRAINT "_CourseToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: accounts accounts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_items checklist_items_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses courses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: departments departments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: departments departments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: epics epics_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.epics
    ADD CONSTRAINT epics_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: knowledge_articles knowledge_articles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_articles
    ADD CONSTRAINT knowledge_articles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: knowledge_articles knowledge_articles_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_articles
    ADD CONSTRAINT knowledge_articles_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.knowledge_folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: knowledge_folders knowledge_folders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_folders
    ADD CONSTRAINT knowledge_folders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: knowledge_folders knowledge_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.knowledge_folders
    ADD CONSTRAINT knowledge_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.knowledge_folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: news_comments news_comments_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.news_comments
    ADD CONSTRAINT news_comments_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: news news_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: programs programs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quizzes quizzes_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.knowledge_articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprints sprints_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_dependencies task_dependencies_depends_on_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_depends_on_task_id_fkey FOREIGN KEY (depends_on_task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_dependencies task_dependencies_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_watchers task_watchers_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.task_watchers
    ADD CONSTRAINT task_watchers_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_epic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_epic_id_fkey FOREIGN KEY (epic_id) REFERENCES public.epics(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_parent_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES public.sprints(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: time_logs time_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alisherbilalov
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 8vbwANoAZCwaQlvcWuaOYk40dqKhDjIizH0JIFsi5k2jDAGH0lvG5QyRTjG8L7W

