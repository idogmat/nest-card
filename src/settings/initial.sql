CREATE TABLE public.user_pg
(
    id uuid NOT NULL DEFAULT uuid_generate_v1(),
    login character varying NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    password_salt character varying NOT NULL,
    created_at bigint NOT NULL,
    confirmation_code character varying,
    expiration_date bigint,
    is_confirmed boolean,
    recovery_code character varying,
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
    id character varying NOT NULL DEFAULT uuid_generate_v1(),
    ip character varying,
    title character varying,
    user_id uuid NOT NULL,
    last_active_date bigint,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES public.user_pg (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);