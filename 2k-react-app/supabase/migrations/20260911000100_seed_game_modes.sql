insert into public.game_modes (id, mode_name) values
    (1, 'Rec Center'),
    (2, '2v2 Park'),
    (3, '3v3 Park'),
    (4, '3v3 Crew'),
    (5, '5v5 Crew'),
    (6, '1v1 Proving Grounds'),
    (7, '2v2 Proving Grounds'),
    (8, '3v3 Proving Grounds'),
    (9, '1v1 Ante Up'),
    (10, '2v2 Ante Up'),
    (11, '3v3 Ante Up')
on conflict (id) do update
set mode_name = excluded.mode_name;

select setval(
    pg_get_serial_sequence('public.game_modes', 'id'),
    (select max(id) from public.game_modes)
);