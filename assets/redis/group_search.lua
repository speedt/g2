-- huangxin <3203317@qq.com>

redis.replicate_commands();

local db         = KEYS[1];
local server_id  = KEYS[2];
local channel_id = KEYS[3];
local group_uuid = KEYS[4];
local group_type = KEYS[5];

redis.call('SELECT', db);

-- 

local user_id = redis.call('GET', server_id ..'::'.. channel_id);

if (false == user_id) then return 'invalid_user_id'; end;

-- 

-- local exist = redis.call('EXISTS', 'prop::groupType::'.. group_type);

-- if (1 ~= exist) then return 'invalid_group_type'; end;

-- 找一个空闲的群组

local idle_group = redis.call('SPOP', 'idle::groupType::'.. group_type);

if (false == idle_group) then

  local total_players = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_total_players');

  if (false == total_players) then return 'invalid_group_type'; end;

  for i=1, tonumber(total_players) do
    redis.call('SADD', 'idle::groupType::'.. group_type, group_uuid ..'::'.. i);
  end;

  -- 为新创建的群组设置群组类型

  -- local total_visitors   = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_total_visitors');
  -- local min_run          = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_min_run');
  -- local capacity         = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_capacity');
  -- local free_swim_time   = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_free_swim_time');

  -- local bullet_lv_max    = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_bullet_lv_max');
  -- local bullet_lv_min    = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_bullet_lv_min');
  -- local consume_freeze   = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_consume_freeze');
  -- local profit_loss_rate = redis.call('HGET', 'cfg', 'group_type_'.. group_type ..'_profit_loss_rate');

  redis.call('HMSET', 'prop::group::'.. group_uuid, 'id',   group_uuid,
                                                    'type', group_type);

  -- redis.call('HMSET', 'prop::group::'.. group_uuid, 'id',               group_uuid,
  --                                                   'type',             group_type,
  --                                                   'total_players',    total_players,
  --                                                   'total_visitors',   total_visitors,
  --                                                   'min_run',          min_run,
  --                                                   'capacity',         capacity,
  --                                                   'free_swim_time',   free_swim_time,
  --                                                   'bullet_lv_max',    bullet_lv_max,
  --                                                   'bullet_lv_min',    bullet_lv_min,
  --                                                   'consume_freeze',   consume_freeze,
  --                                                   'profit_loss_rate', profit_loss_rate);

  -- 再次找一个空闲的群组

  idle_group = redis.call('SPOP', 'idle::groupType::'.. group_type);

  -- 又没有找到

  if (false == idle_group) then return 'non_idle_group'; end;
end;

-- 

local group_id, group_pos_id = string.match(idle_group, '(.*)::(.*)');

-- 把用户放到这个座位上

redis.call('HSET', 'pos::group::'.. group_type ..'::'.. group_id, group_pos_id, user_id ..'::0');

-- 获取现在座位上的所有人

local group_pos = redis.call('HGETALL', 'pos::group::'.. group_type ..'::'.. group_id);

if (0 == #group_pos) then return 'invalid_group_pos'; end;

-- 

redis.call('HMSET', 'prop::user::'.. user_id, 'group_id',     group_id,
                                              'group_pos_id', group_pos_id);

local arr1 = {};

local user_info = {};

for i=2, #group_pos, 2 do
  local u = string.match(group_pos[i], '(.*)::(.*)');

  table.insert(arr1, redis.call('HGET', 'prop::user::'.. u, 'server_id'));
  table.insert(arr1, redis.call('HGET', 'prop::user::'.. u, 'channel_id'));

  -- 

  table.insert(user_info, redis.call('HGET', 'prop::user::'.. u, 'extend_data'));
  table.insert(user_info, redis.call('HGET', 'prop::user::'.. u, 'open_time'));
end;

-- 

local arr2 = {};

table.insert(arr2, user_info);
table.insert(arr2, group_pos);

local result = {};

table.insert(result, arr1);
table.insert(result, arr2);

return result;
