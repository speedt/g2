-- huangxin <3203317@qq.com>

local db = KEYS[1];

redis.call('SELECT', db);

return redis.call('SMEMBERS', 'set::back');
