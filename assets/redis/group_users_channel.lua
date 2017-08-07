-- huangxin <3203317@qq.com>

local db         = KEYS[1];
local server_id  = KEYS[2];
local channel_id = KEYS[3];

redis.call('SELECT', db);

-- 

local user_id = redis.call('GET', server_id ..'::'.. channel_id);

if (false == user_id) then return 'invalid_user_id'; end;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

local group_id = redis.call('HGET', 'prop::user::'.. user_id, 'group_id');

if (false == group_id) then return 'invalid_group_id'; end;

local group_type = redis.call('HGET', 'prop::group::'.. group_id, 'type');

if (false == group_type) then return 'invalid_group_type'; end;

local group_pos = redis.call('HGETALL', 'pos::group::'.. group_type ..'::'.. group_id);

if (0 == #group_pos) then return 'invalid_group_pos'; end;

-- <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

-- 

local arr1 = {};

for i=2, #group_pos, 2 do
  local u, hand = string.match(group_pos[i], '(.*)::(.*)');

  table.insert(arr1, redis.call('HGET', 'prop::user::'.. u, 'server_id'));
  table.insert(arr1, redis.call('HGET', 'prop::user::'.. u, 'channel_id'));
end;

-- 

local result = {};

table.insert(result, arr1);
table.insert(result, redis.call('HGET', 'prop::user::'.. user_id, 'extend_data'));

return result;
