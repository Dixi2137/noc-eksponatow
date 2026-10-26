-- Ranga honorowa DEMON SLAYER (za pokonanie Belzebuba). Wklej w SQL Editorze Supabase.
alter table public.profiles drop constraint if exists profiles_title_check;
alter table public.profiles add constraint profiles_title_check check (title is null or title in ('owner', 'first-to-arrive', 'founder', 'veteran', 'patron', 'demon-slayer'));
