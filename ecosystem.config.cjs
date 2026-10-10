module.exports = {
  apps: [{
    name: 'mini-genspark-local',
    cwd: '/home/user/webapp',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
    env: { NODE_ENV: 'development', WRANGLER_SEND_METRICS: 'false' },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
};
