CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.user_pg
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    login character varying NOT NULL COLLATE "C",
    email character varying NOT NULL COLLATE "C",
    "passwordHash" character varying NOT NULL,
    "passwordSalt" character varying NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "confirmationCode" character varying,
    "expirationDate" numeric,
    "isConfirmed" boolean,
    "recoveryCode" character varying,
    PRIMARY KEY (id)
);



INSERT INTO public.user_pg(
	login, email, "passwordHash", "passwordSalt", "createdAt", "confirmationCode", "expirationDate", "isConfirmed")
	VALUES ('testik',
	'cigiwe8634@cartep.com',
	'$2b$10$kmCOAEDO4P9FvZX3Qx9AAulqIsqo49yip8HkS2Ej2PBAMh/SGv40W',
	'$2b$10$kmCOAEDO4P9FvZX3Qx9AAu', 1726604312598, '?', NULL, false);


CREATE TABLE public.device_pg
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    ip character varying COLLATE "C",
    title character varying COLLATE "C",
    "userId" uuid NOT NULL,
    "lastActiveDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES public.user_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE public.blog_pg
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying NOT NULL COLLATE "C",
    description text NOT NULL,
    "websiteUrl" character varying NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isMembership" boolean DEFAULT false,
    PRIMARY KEY (id)
);

CREATE TABLE public.post_pg
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title character  varying NOT NULL COLLATE "C",
    content character  varying NOT NULL,
    "shortDescription" character varying NOT NULL,
    "blogId" uuid,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY ("blogId")
        REFERENCES public.blog_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE public.comment_pg
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    content text,
    "postId" uuid NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "userId" uuid NOT NULL,
    "userLogin" character varying NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("postId")
        REFERENCES public.post_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE public.post_like_pg
(
    id uuid NOT NULL DEFAULT  uuid_generate_v4(),
    "postId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    login character varying NOT NULL,
    type character varying NOT NULL,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE ("userId", "postId"),
    FOREIGN KEY ("postId")
        REFERENCES public.post_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("userId")
        REFERENCES public.user_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE public.comment_like_pg
(
    id uuid NOT NULL DEFAULT  uuid_generate_v4(),
    "commentId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    login character varying NOT NULL,
    type character varying NOT NULL,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE ("userId", "commentId"),
    FOREIGN KEY ("commentId")
        REFERENCES public.comment_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("userId")
        REFERENCES public.user_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);