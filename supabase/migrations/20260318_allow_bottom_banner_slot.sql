-- Permite novo slot de banner no final da home
alter table if exists public.banners
drop constraint if exists banners_posicao_check;

alter table if exists public.banners
add constraint banners_posicao_check
check (posicao in ('top', 'middle', 'bottom') or posicao is null);

create index if not exists idx_banners_posicao
on public.banners (posicao);
