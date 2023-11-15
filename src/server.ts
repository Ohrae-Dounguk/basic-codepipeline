import { App } from "./app";
import { env } from "./env";

declare global {
    namespace NodeJS {
        interface Global {
            app: App;
        }
    }
}

try {
    const args = process.argv.slice(2);
    const isTestBuild = args.length != 0;
    const app = new App(isTestBuild);
    app.run(env.app.port);
    global.app = app;
} catch (error) {
}
