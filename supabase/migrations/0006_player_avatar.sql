-- Players can pick a fun avatar (an emoji) when they join a game.
alter table players add column if not exists avatar text;
