import {DeployRestart} from "../src/index";

const deployOptions = {
    user: 'test',
    password: 'test',
    host: 'test',
    localPath: 'test',
    remoteDeployPath: 'test',
    serviceName: 'test'
};

const deployOptionsWithRestart = {
    ...deployOptions,
    restart: true
};

const deployOptionsWithoutRestart = {
    ...deployOptions,
    restart: false
};


let deployRestart;

describe('When the restart flag is true', () => {
    beforeEach(() => {
        deployRestart = new DeployRestart(deployOptionsWithRestart);
    });


    describe('When the stop service step fails', () => {

        it('Reject and does not execute the deploy step', async () => {
            jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'stopService').mockRejectedValue('failed');
            const deploySpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'deploy');

            await expect(deployRestart.start()).rejects.toEqual('failed');
            expect(deploySpy).not.toHaveBeenCalled();
        });

    });

    describe('When the deploy step fails', () => {

        it('Rejects and does not execute the start service step', async () => {
            jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'stopService').mockReturnValue(() => Promise.reject('failed'));
            const startServiceSpy = jest.spyOn<DeployRestart, any>(DeployRestart.prototype, 'startService');

            await expect(deployRestart.start()).rejects.toEqual('failed');
            expect(startServiceSpy).not.toHaveBeenCalled();
        });

    });
});
