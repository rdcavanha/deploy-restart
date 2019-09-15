## deploy-restart
Deploy an application to a remote Linux machine and restart a service using systemctl or other commands

Install it through:

    npm i -D deploy-restart
<br />

**This module executes three basic steps:**
 1. Stops a services
 2. Copies files over SCP
 3. Starts a service
<br />

Written in TypeScript. It uses two core module nodes:
 - ssh-exec: [https://github.com/mafintosh/ssh-exec](https://github.com/mafintosh/ssh-exec)
 - scp2: [https://github.com/spmjs/node-scp2](https://github.com/spmjs/node-scp2)
<br />

## Usage
```javascript
import { DeployRestart } from 'deploy-restart'

...

const deployRestart = new DeployRestart({
    user: 'john',
    host: '192.168.1.1',
    localPath: '/home/john/app/dist',
    remoteDeployPath: '/home/remote/services/app',
    restart: true,
    serviceName: 'app'
});

try {
    await deployRestart.start();
} catch (e) {
    console.error(e);
}
```

By calling the module's default export function as shown above, you'll get a ``Promise<void>``.

If an error occurs, expect the following object:

```javascript
{
    stopServiceStatus: boolean;
    deployStatus: boolean;
    startServiceStatus: boolean;
    error: any; //Error thrown by that step that fails
}
````

## Options
|Name|Type|Required|
|--|--|--|
|user|string|Yes
|host|string|Yes
|localPath|string|Yes
|remoteDeployPath|string|Yes
|privateKeyPath|string|No
|password|string|No
|restart|boolean|No
<br />

If `restart` is true, then the following applies:

|Name|Default|Type|Required|
|--|--|--|--|
|serviceName||string|Yes if `serviceStartCommand` and `serviceStopCommand` are not provided
|serviceStartCommand|`sudo systemctl start serviceName`|string|Yes if `serviceName` is not provided or if `serviceStopCommand` is provided
|serviceStopCommand|`sudo systemctl stop serviceName`|string|Yes if `serviceName` is not provided or if `serviceStartCommand` is provided

In other words, you may either pass `serviceName` that will be executed as `sudo systemctl start serviceName` or pass both `serviceStartCommand` and `serviceStopCommand` to use your own commands.
<br />

## License
MIT

