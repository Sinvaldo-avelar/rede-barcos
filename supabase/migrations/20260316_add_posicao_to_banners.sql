-- Adiciona coluna de slot/posição para banners
alter table if exists public.banners
add column if not exists posicao text;

-- Garante apenas valores válidos
alter table if exists public.banners
drop constraint if exists banners_posicao_check;

alter table if exists public.banners
add constraint banners_posicao_check
check (posicao in ('top', 'middle') or posicao is null);

-- Define padrão para novos banners
alter table if exists public.banners
alter column posicao set default 'top';

-- Preenche banners antigos sem posição
update public.banners
set posicao = 'top'
where posicao is null;

-- Opcional: acelera busca por slot
create index if not exists idx_banners_posicao
on public.banners (posicao);
