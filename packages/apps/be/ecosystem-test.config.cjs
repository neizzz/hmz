module.exports = {
  apps: [
    {
      name: 'main-server',
      instances: 1,
      interpreter: 'node',
      // interpreterArgs: '--import tsx',
      interpreterArgs: '--inspect --import tsx ',
      script: './src/index.ts',
      env: {
        BE_PORT: 3333,
        NODE_ENV: 'development',
      },
    },
    {
      name: 'in-game-server',
      exec_mode: 'cluster',
      instances: 1,
      interpreter: 'node',
      // interpreterArgs: '--import tsx',
      interpreterArgs: '--inspect --import tsx',
      script: './src/in-game/index.ts',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
  // deploy: {
  //   production: {
  //     user: 'SSH_USERNAME',
  //     host: 'SSH_HOSTMACHINE',
  //     ref: 'origin/master',
  //     repo: 'GIT_REPOSITORY',
  //     path: 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy':
  //       'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': '',
  //   },
  // },
};
