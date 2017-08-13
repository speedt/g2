npm install \
&& npm install ../db/ \
&& npm install ../lib/ \
&& npm install ../cfg/ \
&& npm install ../model/ \
&& npm install ../biz/ \
&& export ACTIVEMQ_PORT=61613 \
&& export MYSQL_PORT=3306 \
&& export MYSQL_PASS=123456 \
&& export REDIS_PORT=6379 \
&& pm2 kill
&& pm2 start app.js --name manage