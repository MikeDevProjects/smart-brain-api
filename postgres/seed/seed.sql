BEGIN TRANSACTION;

INSERT into users (name, email, pet, age, entries, joined) values ('Mike', 'mike@email.com', 'dragon', 23, 5, '2018-01-10');
INSERT into login (hash, email) values ('$2a$10$pItFe6W9e4tdUGRSdNWxEeWrWIjf69HaX2Tfp63txgDvSTBGCdSEe', 'mike@email.com');

COMMIT;
