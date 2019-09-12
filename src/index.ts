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

    constructor(options: DeployRestartOptions) {
        this.options = options;

        this.scpOptions = {
            username: this.options.user,
            host: this.options.host,
            privateKey: fs.readFileSync(this.options.privateKeyPath),
            path: this.options.remoteDeployPath,
        };

        this.sshExecOptions = {
            user: this.options.user,
            host: this.options.host,
            key: this.options.privateKeyPath,
        }
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

    private startService(): Promise<void> {
        return new Promise((resolve, reject) => {
            sshExec(this.options.serviceStartCommand || `sudo systemctl start ${this.options.serviceName}`, this.sshExecOptions, err => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });

        })
    };

    private stopService(): Promise<void> {
        return new Promise((resolve, reject) => {
            sshExec(this.options.serviceStopCommand || `sudo systemctl stop ${this.options.serviceName}`, this.sshExecOptions, err => {
                if (!err) {
                    this.deploy()
                        .then(() => {
                            this.startService().then(resolve).catch(reject);
                        })
                        .catch(reject)
                } else {
                    reject(err);
                }
            });
        })
    };

    start(): Promise<void> {
        const {restart, serviceName, serviceStopCommand, serviceStartCommand} = this.options;

        if (restart) {
            if (!serviceStartCommand && !serviceStopCommand && !serviceName)
                throw new Error('Define a serviceName, or serviceStopCommand and serviceStartCommand');
            if ((serviceStartCommand && !serviceStopCommand) || (!serviceStartCommand && serviceStopCommand))
                throw new Error('When serviceStartCommand is defined serviceStopCommand must be defined and vice versa');
            return this.stopService()
        }

        return this.deploy();
    }
}
