-- 경영실적 테이블
create table if not exists performance_records (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  quarter integer not null check (quarter between 1 and 4),
  division text not null,
  metric text not null,
  target numeric not null default 0,
  actual numeric not null default 0,
  unit text not null default '억원',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (year, quarter, division, metric)
);

-- 행 레벨 보안 (공개 읽기/쓰기, 필요 시 제한 가능)
alter table performance_records enable row level security;
create policy "allow all" on performance_records for all using (true) with check (true);

-- 인덱스
create index if not exists idx_perf_year_quarter on performance_records (year, quarter);
