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
redis.call('HMSET', code, 'client_id',        client_id,
                          'id',               user_id,
                          'extend_data',      ARGV[2],
                          'user_name',        ARGV[3],
                          'sex',              ARGV[4],
                          'create_time',      ARGV[5],
                          'mobile',           ARGV[6],
                          'qq',               ARGV[7],
                          'weixin',           ARGV[8],
                          'email',            ARGV[9],
                          'current_score',    ARGV[10],
                          'tool_1',           ARGV[11],
                          'tool_2',           ARGV[12],
                          'tool_3',           ARGV[13],
                          'tool_4',           ARGV[14],
                          'tool_5',           ARGV[15],
                          'tool_6',           ARGV[16],
                          'tool_7',           ARGV[17],
                          'tool_8',           ARGV[18],
                          'tool_9',           ARGV[19],
                          'nickname',         ARGV[20],
                          'vip',              ARGV[21],
                          'consume_count',    ARGV[22],
                          'win_count',        ARGV[23],
                          'lose_count',       ARGV[24],
                          'win_score_count',  ARGV[25],
                          'lose_score_count', ARGV[26],
                          'line_gone_count',  ARGV[27]);

redis.call('EXPIRE', code, seconds);

return code;
