CREATE TABLE IF NOT EXISTS "noticias" (
	"id_noticias" serial PRIMARY KEY,
	"titulo" varchar(100) NOT NULL,
	"subtitulo" varchar(255),
	"data" timestamp with time zone NOT NULL DEFAULT NOW(),
	"url_imagem" varchar(255) NOT NULL,
	"texto" TEXT NOT NULL,
	"id_categoria" integer NOT NULL,
	"destaque" boolean NOT NULL DEFAULT false,
	CONSTRAINT "fk_categoria_noticias" FOREIGN KEY ("id_categoria") REFERENCES "categoria_noticias"("id_categoria_noticias") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "publicacoes" (
	"id_publicacoes" serial PRIMARY KEY,
	"titulo" varchar(255) NOT NULL,
	"autores" varchar(255) NOT NULL,
	"data" timestamp with time zone NOT NULL DEFAULT NOW(),
	"url_imagem" varchar(255) NOT NULL,
	"url_doi" varchar(255) NOT NULL,
	"id_categoria" integer NOT NULL,
	CONSTRAINT "fk_categoria_publicacoes" FOREIGN KEY ("id_categoria") REFERENCES "categoria_publicacoes"("id_categoria_publicacoes") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "vagas" (
	"id_vagas" serial PRIMARY KEY,
	"titulo" varchar(50) NOT NULL,
	"descricao" TEXT NOT NULL,
	"requisitos" TEXT NOT NULL,
	"beneficios" TEXT NOT NULL,
	"ativo" boolean NOT NULL,
	"data" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "categoria_noticias" (
	"id_categoria_noticias" serial PRIMARY KEY,
	"nome" varchar(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "categoria_publicacoes" (
	"id_categoria_publicacoes" serial PRIMARY KEY,
	"nome" varchar(30) NOT NULL UNIQUE
);

select
