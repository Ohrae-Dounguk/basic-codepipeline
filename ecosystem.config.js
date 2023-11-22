module.exports = {
    apps: [
        {
            name: "demo_server",
            script: "dist/src/index.js",
            instances: 2,
            exec_mode: "cluster",
            wait_ready: true,
            listen_timeout: 5000,
            kill_timeout: 5000,
            autorestart: true,
            watch: false,
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            max_memory_restart: "1G",
        },
    ],
    deploy: {
        staging: {
            user: "ubuntu",
            host: "dev.mooin.kr",
            ref: "origin/main",
            ssh_options: "ForwardAgent=yes",
            repo: "git@github.com:ohrae-git/ZE_Advertise_TS.git",
            path: "/home/ubuntu/server/back/ZE_Advertise",
            env: {
                NODE_ENV: "development",
            },
            "post-deploy": "yarn install && yarn build && yarn serve",
        },
    },
};
