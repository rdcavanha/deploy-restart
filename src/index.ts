import client from 'scp2';
import * as fs from 'fs';
import sshExec from 'ssh-exec';

export interface DeployRestartOptions {
  user: string;
  host: string;
  localPath: string;
  remoteDeployPath: string;
  privateKeyPath?: string;
  password?: string;
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

    const privateKey = this.options.privateKeyPath ? fs.readFileSync(this.options.privateKeyPath) : undefined;

    this.scpOptions = {
      username: this.options.user,
      host: this.options.host,
      privateKey,
      password: this.options.password,
      path: this.options.remoteDeployPath,
    };

    this.sshExecOptions = {
      user: this.options.user,
      host: this.options.host,
      password: this.options.password,
      key: privateKey,
    };

    this.stopServiceCommand = this.options.serviceStartCommand || `sudo systemctl stop ${this.options.serviceName}`;
    this.startServiceCommand = this.options.serviceStartCommand || `sudo systemctl start ${this.options.serviceName}`;
  }

  private deploy(): Promise<boolean> {
    return new Promise((resolve, reject): void => {
      client.scp(this.options.localPath, this.scpOptions, (err) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }

  private async executeCommand(command: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      sshExec(command, this.sshExecOptions, (err) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }

  async start(): Promise<void> {
    const { restart, serviceName, serviceStopCommand, serviceStartCommand } = this.options;

    if (restart) {
      if (!serviceStartCommand && !serviceStopCommand && !serviceName)
        throw new Error('Define a serviceName, or serviceStopCommand and serviceStartCommand');
      if ((serviceStartCommand && !serviceStopCommand) || (!serviceStartCommand && serviceStopCommand))
        throw new Error('When serviceStartCommand is defined serviceStopCommand must be defined and vice versa');
    }

    let stopServiceStatus = false;
    let deployStatus = false;
    let startServiceStatus = false;

    try {
      if (restart) {
        stopServiceStatus = await this.executeCommand(this.stopServiceCommand);
        deployStatus = await this.deploy();
        startServiceStatus = await this.executeCommand(this.startServiceCommand);
      } else {
        deployStatus = await this.deploy();
      }
    } catch (e) {
      throw { stopServiceStatus, deployStatus, startServiceStatus, error: e };
    }
  }
}
