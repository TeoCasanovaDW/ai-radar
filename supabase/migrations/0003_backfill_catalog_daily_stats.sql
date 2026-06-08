insert into public.catalog_daily_stats (
  stat_date,
  model_count,
  new_models,
  expired_models,
  main_provider_model_count
)
select
  s.snapshot_date                                                          as stat_date,
  count(distinct s.model_id)                                               as model_count,
  count(distinct case
    when fs.first_date = s.snapshot_date then s.model_id
  end)                                                                     as new_models,
  count(distinct case
    when s.expiration_date is not null
     and s.expiration_date::date <= s.snapshot_date then s.model_id
  end)                                                                     as expired_models,
  count(distinct case
    when m.provider = any(array[
      'openai','anthropic','google','mistralai',
      'meta-llama','deepseek','x-ai','qwen',
      '~openai','~anthropic','~google','~mistralai',
      '~meta-llama','~deepseek','~x-ai','~qwen'
    ]) then s.model_id
  end)                                                                     as main_provider_model_count
from public.model_snapshots s
join public.models m on s.model_id = m.id
join (
  select model_id, min(snapshot_date) as first_date
  from public.model_snapshots
  group by model_id
) fs on s.model_id = fs.model_id
group by s.snapshot_date
on conflict (stat_date) do nothing;
