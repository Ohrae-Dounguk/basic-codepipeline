import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import {Container} from "typedi";
import {useContainer as routingUseContainer, useExpressServer} from "routing-controllers";
import morgan from "morgan";

import {createDatabaseConnection} from "./database";
import {routingControllerOptions} from "./utils/RoutingConfig";
import {getLogger, stream} from "./utils/Logger";
import {useContainer} from "typeorm";
import {env} from "./env";

export class App {
    public app: express.Application;
    isTestBuild: boolean;

    constructor(isTestBuild: boolean) {
        this.isTestBuild = isTestBuild;
        this.app = express();
    }

    public run(port: number) {
        this.setDatabase()
            .then(() => {
                useContainer(Container);
                this.setMiddlewares();
                return this.createExpressServer(port);
            })
            .catch((error) => {
                
            });
    }

    setDatabase(): Promise<void> {
        try {
            return createDatabaseConnection();
        } catch (error) {
            
        }
    }

    setMiddlewares(): void {

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(morgan("combined", {stream}));

        const relativePath = this.isTestBuild ? ".." : "../..";

        this.app.set("views", path.join(__dirname, `${relativePath}/views`));
        this.app.use(express.static(path.join(__dirname, `${relativePath}/public`)));

        this.app.set("view engine", "ejs");
    }

    createExpressServer(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                routingUseContainer(Container);
                useExpressServer(this.app, routingControllerOptions);

                this.app.listen(port, () => {
                    if (!env.isStaging) {
                        console.log("Server is running");
                    }

                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
