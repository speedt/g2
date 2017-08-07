-- huangxin <3203317@qq.com>

local db         = KEYS[1];
local server_id  = KEYS[2];
local channel_id = KEYS[3];

-- 

redis.call('SELECT', db);

local user_id = redis.call('GET', server_id ..'::'.. channel_id);

if (false == user_id) then return 'invalid_user_id'; end;

-- 不在任何群组

local group_id = redis.call('HGET', 'prop::'.. user_id, 'group_id');

if (false == group_id) then return 'invalid_group_id'; end;

-- 获取群组的类型

redis.call('SELECT', 1 + db);

local group_type = redis.call('HGET', 'prop::group::'.. group_id, 'type');

if (false == group_type) then return 'invalid_group_id'; end;

local group_pos = redis.call('HGETALL', 'pos::group::'.. group_type ..'::'.. group_id);

-- 

redis.call('SELECT', db);

local result = {};

for i=2, #group_pos, 2 do
  local u, hand = string.match(group_pos[i], '(.*)::(.*)');

  if ('1' == hand) then
    table.insert(result, redis.call('HGET', 'prop::'.. u, 'server_id'));
    table.insert(result, redis.call('HGET', 'prop::'.. u, 'channel_id'));
  end;

end;

return result;
