import client from 'scp2';
import * as fs from 'fs';
import sshExec from 'ssh-exec';

export interface DeployRestartOptions {
    user: string;
    host: string;
    localPath: string;
    remoteDeployPath: string;
    privateKeyPath?: string
    password?: string
    restart?: boolean;
    serviceName?: string;
    serviceStartCommand?: string;
    serviceStopCommand?: string;
}

export class DeployRestart {
    private readonly options: DeployRestartOptions;
    private readonly scpOptions;
    private readonly sshExecOptions;

    private readonly startServiceCommand;
    private readonly stopServiceCommand;

    constructor(options: DeployRestartOptions) {
        this.options = options;

        this.scpOptions = {
            username: this.options.user,
            host: this.options.host,
            privateKey: this.options.privateKeyPath ? fs.readFileSync(this.options.privateKeyPath) : undefined,
            path: this.options.remoteDeployPath,
        };

        this.sshExecOptions = {
            user: this.options.user,
            host: this.options.host,
            key: this.options.privateKeyPath,
        };

        this.stopServiceCommand = this.options.serviceStartCommand || `sudo systemctl stop ${this.options.serviceName}`;
        this.startServiceCommand = this.options.serviceStartCommand || `sudo systemctl start ${this.options.serviceName}`;

    }

    private deploy(): Promise<void> {
        return new Promise((resolve, reject): void => {
            client.scp(
                this.options.localPath,
                this.scpOptions,
                err => {
                    if (!err) {
                        resolve();
                    } else {
                        reject(err);
                    }
                },
            );
        });
    };

    private async executeCommand(command: string) {
        return new Promise((resolve, reject) => {
            sshExec(command, this.sshExecOptions, err => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });

        })
    }

    async start(): Promise<void> {
        const {restart, serviceName, serviceStopCommand, serviceStartCommand} = this.options;

        if (restart) {
            if (!serviceStartCommand && !serviceStopCommand && !serviceName)
                throw new Error('Define a serviceName, or serviceStopCommand and serviceStartCommand');
            if ((serviceStartCommand && !serviceStopCommand) || (!serviceStartCommand && serviceStopCommand))
                throw new Error('When serviceStartCommand is defined serviceStopCommand must be defined and vice versa');

            await this.executeCommand(this.stopServiceCommand);
            await this.deploy();
            await this.executeCommand(this.startServiceCommand);
        } else {
            await this.deploy();
        }
    }
}
