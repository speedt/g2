-- huangxin <3203317@qq.com>

local db         = KEYS[1];
local server_id  = KEYS[2];
local channel_id = KEYS[3];

-- 

redis.call('SELECT', db);

local user_id = redis.call('GET', server_id ..'::'.. channel_id);

if (user_id) then
  redis.call('DEL', 'prop::user::'.. user_id, server_id ..'::'.. channel_id);

  -- 属性::系统::在线人数-1
  redis.call('HINCRBY', 'prop::sys', 'online_count', -1);

  -- 属性::前置机::在线人数-1
  redis.call('HINCRBY', 'prop::front::'.. server_id, 'online_count', -1);
end;

return 'OK';
