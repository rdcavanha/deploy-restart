import client from 'scp2';
import * as fs from 'fs';
import sshExec from 'ssh-exec';

interface DeployRestartOptions {
    username: string;
    host: string;
    privateKeyPath?: string
    password?: string
    fromLocalPath: string;
    toRemotePath: string;
    restart: boolean;
    serviceName?: string;
    serviceStartCommand?: string;
    serviceStopCommand?: string;
}

class DeployRestart {
    private readonly options: DeployRestartOptions;
    private readonly scpOptions;
    private readonly sshExecOptions;

    constructor(options: DeployRestartOptions) {
        this.options = options;

        this.scpOptions = {
            username: this.options.username,
            host: this.options.host,
            privateKey: fs.readFileSync(this.options.privateKeyPath),
            path: this.options.toRemotePath,
        };

        this.sshExecOptions = {
            user: this.options.username,
            host: this.options.host,
            key: this.options.privateKeyPath,
        }
    }

    deploy(): Promise<void> {
        console.info('Starting Deployment to', this.options.toRemotePath);

        return new Promise((resolve, reject): void => {
            client.scp(
                this.options.fromLocalPath,
                this.scpOptions,
                err => {
                    if (err) {
                        console.error('Failed to deploy', err);
                        reject();
                    } else {
                        console.info('Deployment succeeded');
                        resolve();
                    }
                },
            );
        });
    };

    startService(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.info('Starting service');
            sshExec(this.options.serviceStartCommand || `sudo systemctl start ${this.options.serviceName}`, this.sshExecOptions, err => {
                if (!err) {
                    console.info('Service started successfully');
                    resolve();
                } else {
                    console.error('Failed to start service', err);
                    reject();
                }
            });

        })
    };

    stopService(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.info('Stopping Service');

            sshExec(this.options.serviceStopCommand || `sudo systemctl stop ${this.options.serviceName}`, this.sshExecOptions, err => {
                if (!err) {
                    console.info('Service stopped successfully');
                    this.deploy()
                        .then(() => {
                            this.startService().then(resolve).catch(reject);
                        })
                        .catch(reject)
                } else {
                    console.error('Failed to stop service', err);
                    reject();
                }
            });

        })
    };
}


const startDeployProcedure = (options: DeployRestartOptions): Promise<void> => {
    const {restart} = options;
    const deployRestart = new DeployRestart(options);
    return restart ? deployRestart.stopService() : deployRestart.deploy();
};

export default startDeployProcedure;
