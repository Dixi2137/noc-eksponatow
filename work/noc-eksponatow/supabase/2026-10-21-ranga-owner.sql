-- Ranga OWNER (2026-10-21): wklej w SQL Editorze istniejącego projektu.
alter table public.profiles drop constraint if exists profiles_title_check;
alter table public.profiles add constraint profiles_title_check check (title is null or title in ('owner', 'first-to-arrive', 'founder', 'veteran', 'patron'));
-- Nadanie sobie rangi (pseudonim dokładnie jak w grze):
update public.profiles set title = 'owner' where nickname = 'Mr. Dixi';
