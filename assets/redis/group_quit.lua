-- huangxin <3203317@qq.com>

local db         = KEYS[1];
local server_id  = KEYS[2];
local channel_id = KEYS[3];

redis.call('SELECT', db);

-- 

local user_id = redis.call('GET', server_id ..'::'.. channel_id);

if (false == user_id) then return 'invalid_user_id'; end;

-- 

local group_id = redis.call('HGET', 'prop::user::'.. user_id, 'group_id');

if (false == group_id) then return 'OK'; end;

-- 获取群组的类型

local group_type = redis.call('HGET', 'prop::group::'.. group_id, 'type');

if (false == group_type) then return 'OK'; end;

-- 

local group_pos_id = redis.call('HGET', 'prop::user::'.. user_id, 'group_pos_id');

redis.call('HDEL', 'prop::user::'.. user_id, 'group_id', 'group_pos_id');

-- 

local s = redis.call('HGET', 'pos::group::'.. group_type ..'::'.. group_id, group_pos_id);

if (false == s) then return 'OK'; end;

-- 

local b, hand = string.match(s, '(.*)::(.*)');

if (b ~= user_id) then return 'OK'; end;

-- 

redis.call('HDEL', 'pos::group::'.. group_type ..'::'.. group_id, group_pos_id);
redis.call('SADD', 'idle::groupType::'.. group_type,              group_id ..'::'.. group_pos_id);

-- 

local group_pos = redis.call('HGETALL', 'pos::group::'.. group_type ..'::'.. group_id);

if (0 == #group_pos) then return 'OK'; end;

-- 

local arr1 = {};

for i=2, #group_pos, 2 do
  -- table.insert(arr1, group_pos[i - 1]);
  local u = string.match(group_pos[i], '(.*)::(.*)');

  local sb = redis.call('HGET', 'prop::user::'.. u, 'server_id');

  if (sb) then
    table.insert(arr1, sb);
    table.insert(arr1, redis.call('HGET', 'prop::user::'.. u, 'channel_id'));
  else

    local pos = group_pos[i - 1];
    redis.call('HDEL', 'pos::group::'.. group_type ..'::'.. group_id, pos);
    redis.call('SADD', 'idle::groupType::'.. group_type,              group_id ..'::'.. pos);
  end;
end;

-- 

if (0 == #arr1) then return 'OK'; end;

-- 

local result = {};

table.insert(result, arr1);
table.insert(result, user_id);

return result;
