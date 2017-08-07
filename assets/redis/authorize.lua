-- huangxin <3203317@qq.com>

local db        = KEYS[1];
local client_id = KEYS[2];
local user_id   = KEYS[3];

redis.call('SELECT', db);

-- 

local  _key = client_id ..'::'.. user_id;

local code = redis.call('GET', _key);
if (code) then return code; end;

      code    = KEYS[4];

local seconds = ARGV[1];

redis.call('SET',    _key, code);
redis.call('EXPIRE', _key, seconds);

--[[
{
  code: {
    client_id: '',
    user_id: ''
  }
}
--]]
redis.call('HMSET', code, 'client_id',            client_id,
                          'id',                   user_id,
                          'extend_data',          ARGV[2],
                          'score',                ARGV[3],
                          'tool_1',               ARGV[4],
                          'tool_2',               ARGV[5],
                          'tool_3',               ARGV[6],
                          'tool_4',               ARGV[7],
                          'tool_5',               ARGV[8],
                          'tool_6',               ARGV[9],
                          'tool_7',               ARGV[10],
                          'tool_8',               ARGV[11],
                          'tool_9',               ARGV[12],
                          'bullet_level',         ARGV[13],
                          'diamond',              ARGV[14],
                          'current_bullet_level', ARGV[15],
                          'bullet_consume_count', ARGV[16],
                          'gain_score_count',     ARGV[17],
                          'gift_count',           ARGV[18],
                          'vip',                  ARGV[19],
                          'success_rate_capture', redis.call('HGET', 'cfg', 'vip_'.. ARGV[19] ..'_success_rate_capture'),
                          'success_rate_gift',    redis.call('HGET', 'cfg', 'vip_'.. ARGV[19] ..'_success_rate_gift'),
                          'user_name',            ARGV[20]);

redis.call('EXPIRE', code, seconds);

return code;
