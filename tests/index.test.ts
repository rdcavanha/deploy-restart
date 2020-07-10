/* eslint-disable import/first,no-new */
let aPassword = 'aPassword';
const passwordPromptMock = jest.fn(() => aPassword);
jest.mock('password-prompt', () => passwordPromptMock);

import passwordPrompt from 'password-prompt';
import { DeployRestart } from '../src';

const DEPLOY_OPTIONS_WITHOUT_CREDENTIALS = {
  user: 'test',
  host: 'test',
  localPath: 'test',
  remoteDeployPath: 'test',
  serviceName: 'test',
};

const DEPLOY_OPTIONS_WITH_RESTART_AND_CREDENTIALS = {
  ...DEPLOY_OPTIONS_WITHOUT_CREDENTIALS,
  password: aPassword,
  restart: true,
};

const DEPLOY_OPTIONS_WITH_CREDENTIALS_AND_WITHOUT_RESTART = {
  ...DEPLOY_OPTIONS_WITHOUT_CREDENTIALS,
  password: aPassword,
  restart: false,
};

const START_SERVICE_COMMAND = 'sudo systemctl start test';

let deployRestart: DeployRestart;

describe('when the restart flag is true', () => {
  beforeEach(() => {
    aPassword = 'aPassword';
    deployRestart = new DeployRestart(DEPLOY_OPTIONS_WITH_RESTART_AND_CREDENTIALS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when no password nor key is provider', () => {
    it('asks for password', () => {
      new DeployRestart(DEPLOY_OPTIONS_WITHOUT_CREDENTIALS);

      expect(passwordPrompt).toHaveBeenCalled();
    });

    it('throws error if no password is provided', () => {
      aPassword = '';

      try {
        new DeployRestart(DEPLOY_OPTIONS_WITHOUT_CREDENTIALS);
        expect(true).toBe(false);
      } catch (e) {
        expect(true).toBe(true);
      }
    });
  });

  describe('when the stop service step fails', () => {
    it('rejects with status and does not execute the deploy step', async () => {
      jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand').mockRejectedValueOnce('failed');

      const deploySpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy');

      try {
        await deployRestart.start();
      } catch (e) {
        expect(e).toEqual({
          stopServiceStatus: false,
          deployStatus: false,
          startServiceStatus: false,
          error: 'failed',
        });
      }

      expect(deploySpy).not.toHaveBeenCalled();
    });
  });

  describe('when the deploy step fails', () => {
    it('rejects with status and does not execute the start service step', async () => {
      jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy').mockRejectedValueOnce('failed');

      const executeCommandSpy = jest
        .spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand')
        .mockResolvedValueOnce(true);

      try {
        await deployRestart.start();
      } catch (e) {
        expect(e).toEqual({
          stopServiceStatus: true,
          deployStatus: false,
          startServiceStatus: false,
          error: 'failed',
        });
      }

      expect(executeCommandSpy).not.toHaveBeenLastCalledWith(START_SERVICE_COMMAND);
    });
  });

  describe('when the start service step fails', () => {
    it('rejects with status', async () => {
      jest
        .spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand')
        .mockImplementation((command) =>
          command === START_SERVICE_COMMAND ? Promise.reject(new Error('failed')) : Promise.resolve(true),
        );

      jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy').mockResolvedValueOnce(true);

      try {
        await deployRestart.start();
      } catch (e) {
        expect(e).toEqual({
          stopServiceStatus: true,
          deployStatus: true,
          startServiceStatus: false,
          error: new Error('failed'),
        });
      }
    });
  });
});

describe('when the restart flag is falsy', () => {
  beforeEach(() => {
    deployRestart = new DeployRestart(DEPLOY_OPTIONS_WITH_CREDENTIALS_AND_WITHOUT_RESTART);
  });

  it('deploys only', async () => {
    const deploySpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy').mockResolvedValueOnce(true);
    const executeCommandSpy = jest
      .spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand')
      .mockResolvedValueOnce(true);

    await deployRestart.start();

    expect(deploySpy).toHaveBeenCalled();
    expect(executeCommandSpy).not.toHaveBeenCalled();

    jest.clearAllMocks();
  });
});
