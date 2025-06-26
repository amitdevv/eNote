-- Enable RLS (Row Level Security)
alter table if exists public.notes enable row level security;
alter table if exists public.folders enable row level security;

-- Create the folders table
create table if not exists public.folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null default 'bg-blue-500',
  parent_id uuid references public.folders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the notes table
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text default '',
  type text default 'markdown',
  status text default 'idea',
  folder_id uuid references public.folders(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null,
  tags text[] default '{}',
  starred boolean default false,
  priority text,
  font_family text default 'Inter',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_folder_id_idx on public.notes(folder_id);
create index if not exists notes_updated_at_idx on public.notes(updated_at desc);
create index if not exists folders_user_id_idx on public.folders(user_id);
create index if not exists folders_parent_id_idx on public.folders(parent_id);

-- Set up Row Level Security (RLS) policies

-- Folders policies
create policy "Users can view their own folders" on public.folders
  for select using (auth.uid() = user_id);

create policy "Users can insert their own folders" on public.folders
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own folders" on public.folders
  for update using (auth.uid() = user_id);

create policy "Users can delete their own folders" on public.folders
  for delete using (auth.uid() = user_id);

-- Notes policies
create policy "Users can view their own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on public.notes
  for delete using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers to automatically update updated_at
create trigger handle_updated_at before update on public.notes
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.folders
  for each row execute procedure public.handle_updated_at(); 