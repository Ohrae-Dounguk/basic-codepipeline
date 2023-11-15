module.exports = {
    apps: [
        {
            name: "data_server",
            script: "dist/src/server.js",
            instances: 1,
            autorestart: true,
            watch: false,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            max_memory_restart: "1G",
        }
    ],
    deploy: {
        staging: {
            user: "ubuntu",
            host: "ohrae.mooin.kr",
            ref: "origin/release",
            ssh_options: "ForwardAgent=yes",
            repo: "git@zcentor.publicserver:zcenter/MOOIN_PUBLIC_SERVER.git",
            path: "/home/ubuntu/public_server",
            env: {
                NODE_ENV: "staging",
            },
            "post-deploy":
                "yarn install && yarn build && yarn serve",
        }
    },
};
