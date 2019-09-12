import {DeployRestart} from "../src/index";

const DEPLOY_OPTIONS = {
    user: 'test',
    password: 'test',
    host: 'test',
    localPath: 'test',
    remoteDeployPath: 'test',
    serviceName: 'test'
};

const DEPLOY_OPTIONS_WITH_RESTART = {
    ...DEPLOY_OPTIONS,
    restart: true
};

const DEPLOY_OPTIONS_WITHOUT_RESTART = {
    ...DEPLOY_OPTIONS,
    restart: false
};

const START_SERVICE_COMMAND = 'sudo systemctl start test';
const STOP_SERVICE_COMMAND = 'sudo systemctl stop test';


let deployRestart: DeployRestart;

describe('when the restart flag is true', () => {

    beforeEach(() => {
        deployRestart = new DeployRestart(DEPLOY_OPTIONS_WITH_RESTART);
    });

    describe('when the stop service step fails', () => {

        it('rejects and does not execute the deploy step', async () => {
            jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand').mockRejectedValueOnce('failed');

            const deploySpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy');

            try {
                await deployRestart.start();
            } catch (e) {
                expect(e).toMatch('failed');
            }

            expect(deploySpy).not.toHaveBeenCalled();

            jest.clearAllMocks();
        });

    });

    describe('when the deploy step fails', () => {

        it('rejects and does not execute the start service step', async () => {
            jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy').mockRejectedValueOnce('failed');

            const executeCommandSpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand').mockResolvedValueOnce('');

            try {
                await deployRestart.start();
            } catch (e) {
                expect(e).toMatch('failed');
            }

            expect(executeCommandSpy).toHaveBeenLastCalledWith(START_SERVICE_COMMAND);

            jest.clearAllMocks();
        });

    });

    describe('when the stop service step fails', () => {

        it('rejects', async () => {
            jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand').mockImplementation((command) =>
                command === STOP_SERVICE_COMMAND ? Promise.reject('failed') : Promise.resolve());

            jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy').mockResolvedValueOnce('');

            try {
                await deployRestart.start();
            } catch (e) {
                expect(e).toMatch('failed');
            }

            jest.clearAllMocks();
        });

    });
});

describe('when the restart flag is falsy', () => {

    beforeEach(() => {
        deployRestart = new DeployRestart(DEPLOY_OPTIONS_WITHOUT_RESTART);
    });

    it('deploys only', async() => {
        const deploySpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy').mockResolvedValueOnce('');
        const executeCommandSpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'executeCommand').mockResolvedValueOnce('');

        await deployRestart.start();

        expect(deploySpy).toHaveBeenCalled();
        expect(executeCommandSpy).not.toHaveBeenCalled();

        jest.clearAllMocks();
    })
});
