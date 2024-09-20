CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.user_pg
(
    id uuid NOT NULL DEFAULT uuid_generate_v1(),
    login character varying NOT NULL COLLATE "C",
    email character varying NOT NULL COLLATE "C",
    "passwordHash" character varying NOT NULL,
    "passwordSalt" character varying NOT NULL,
    "createdAt" numeric NOT NULL,
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
    id uuid NOT NULL DEFAULT uuid_generate_v1(),
    ip character varying COLLATE "C",
    title character varying COLLATE "C",
    "userId" uuid NOT NULL,
    "lastActiveDate" numeric NOT NULL,
    "createdAt" numeric NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES public.user_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);