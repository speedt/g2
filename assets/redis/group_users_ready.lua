-- huangxin <3203317@qq.com>

local db       = KEYS[1];
local group_id = KEYS[2];

-- 获取群组的类型

redis.call('SELECT', db);

local group_type = redis.call('HGET', 'prop::group::'.. group_id, 'type');

if (false == group_type) then return 'invalid_group_id'; end;

local group_pos = redis.call('HGETALL', 'pos::group::'.. group_type ..'::'.. group_id);

if (0 == #group_pos) then return 'invalid_group_pos'; end;

-- 

local result = {};

for i=2, #group_pos, 2 do
  local u, hand = string.match(group_pos[i], '(.*)::(.*)');

  if ('1' == hand) then
    table.insert(result, redis.call('HGET', 'prop::user::'.. u, 'server_id'));
    table.insert(result, redis.call('HGET', 'prop::user::'.. u, 'channel_id'));
  end;

end;

return result;
