'use strict';

// Review development may add isolated files, but must not change any existing
// approved source or asset. This check is read-only and never runs on a TV.
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const base = '12a7b78ca3b2a657246b7bb6122321104a45b38b';
const cwd = path.resolve(__dirname, '..');
const changes = execFileSync('git', ['diff', '--name-status', base, '--'], {
  cwd, encoding: 'utf8'
}).trim().split('\n').filter(Boolean);
const forbidden = changes.filter(line => !line.startsWith('A\t'));
if (forbidden.length) {
  process.stderr.write('Protected existing files changed:\n' + forbidden.join('\n') + '\n');
  process.exitCode = 1;
} else {
  process.stdout.write('PASS: all existing tracked source and assets match ' + base + '.\n');
}
