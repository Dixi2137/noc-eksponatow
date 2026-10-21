-- Rodzaj ogłoszenia „Materiał sponsorowany” (kind = 'sponsored'). Wklej w SQL Editorze Supabase.
alter table public.announcements drop constraint if exists announcements_kind_check;
alter table public.announcements add constraint announcements_kind_check check (kind in ('info', 'warning', 'event', 'sponsored'));
