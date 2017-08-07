-- huangxin <3203317@qq.com>

local db      = KEYS[1];
local user_id = KEYS[2];

local score   = ARGV[1];

-- 

redis.call('SELECT', db);

local exist = redis.call('EXISTS', 'prop::user::'.. user_id);

if (0 == exist) then return 'invalid_user_id'; end;

-- 

redis.call('HINCRBY', 'prop::user::'.. user_id, 'score', score);

return 'OK';
