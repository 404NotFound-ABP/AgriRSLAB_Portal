CREATE TABLE IF NOT EXISTS public.artigos
(
    id integer NOT NULL DEFAULT nextval('artigos_id_seq'::regclass),
    titulo character varying(255) COLLATE pg_catalog."default" NOT NULL,
    link_doi character varying(255) COLLATE pg_catalog."default",
    link_pdf character varying(255) COLLATE pg_catalog."default" NOT NULL,
    url_imagem character varying(255) COLLATE pg_catalog."default" NOT NULL,
    data_cadastro timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    id_categoria integer,
    exibir boolean NOT NULL DEFAULT true,
    CONSTRAINT artigos_pkey PRIMARY KEY (id),
    CONSTRAINT artigos_link_doi_key UNIQUE (link_doi),
    CONSTRAINT artigos_id_categoria_fkey FOREIGN KEY (id_categoria)
        REFERENCES public.categoria_artigos (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
)

CREATE TABLE IF NOT EXISTS public.categoria_artigos
(
    id integer NOT NULL DEFAULT nextval('categoria_artigos_id_seq'::regclass),
    nome character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT categoria_artigos_pkey PRIMARY KEY (id),
    CONSTRAINT categoria_artigos_nome_key UNIQUE (nome)
)
