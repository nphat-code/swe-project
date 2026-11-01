import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const cyan = '\x1b[36m';
const magenta = '\x1b[35m';
const reset = '\x1b[0m';

function runProcess(prefix, color, args) {
  const proc = spawn(npmCmd, args, {
    shell: isWindows,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (data) => {
    data.toString().split(/\r?\n/).forEach((line) => {
      if (line.trim()) {
        console.log(`${color}[${prefix}]${reset} ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    data.toString().split(/\r?\n/).forEach((line) => {
      if (line.trim()) {
        console.error(`${color}[${prefix}]${reset} ${line}`);
      }
    });
  });

  return proc;
}

const backend = runProcess('BACKEND', cyan, ['--prefix', 'backend', 'run', 'start:dev']);
const frontend = runProcess('FRONTEND', magenta, ['--prefix', 'frontend', 'run', 'dev']);

const cleanExit = () => {
  try {
    if (isWindows) {
      if (backend.pid) spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
      if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
    } else {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
    }
  } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
