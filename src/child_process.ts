import * as cp from 'child_process';


function wrapCommand(command: string, env?: any) {
  if (!env) {
    return command;
  }

  const passThroughCommand = Object.keys(env)
    .filter(k => k.startsWith('DYLD'))
    .reduce((cmd, key) => `${cmd ? `${cmd} &&` : ''} export ${key}='${env[key]}'`, '');

  return passThroughCommand ? `${passThroughCommand} && ${command}` : command;
}

/*
 * HACK: Apple SIP will not allowing passing through DYLD_* environment variables to 
 * secured binaries like /bin/sh. This prevents certain commands like rospack list
 * to fail due to missing dylib. This function will prepend export DYLD_*=value
 * before command to bypass this issue.
 */
export function exec(command: string, options?: cp.ExecOptions, 
  callback?: (error: Error, stdout: string, stderr: string) => void) : cp.ChildProcess {
  if (!options || !options.env || process.platform != 'darwin') {
    return cp.exec(command, options, callback);
  }

  return cp.exec(wrapCommand(command, options.env), options, callback);
}

export function spawn(command: string, args?: ReadonlyArray<string>, options?: cp.SpawnOptions): cp.ChildProcess {
  return cp.spawn(command, args, options);
}