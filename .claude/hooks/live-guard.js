// PreToolUse hook on Bash (cloud only): blocks live-theme pushes unless the user
// typed the confirmation sentence (see live-confirm.js), and blocks publish/delete.
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.CLAUDE_CODE_REMOTE !== 'true') process.exit(0);

const TOKEN_TTL_MS = 10 * 60 * 1000;

function block(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = String(JSON.parse(input).tool_input?.command || '');
  } catch {
    process.exit(0);
  }

  if (/shopify\s+theme\s+(publish|delete)\b/.test(command)) {
    block('Blocked: `shopify theme publish` and `shopify theme delete` are not allowed in cloud sessions.');
  }

  if (!/shopify\s+theme\s+push\b/.test(command)) process.exit(0);

  const pushesLive = /(^|\s)(--allow-live|--live|-a|-l)(\s|$)/.test(command);
  if (!pushesLive) process.exit(0);

  const idMatch = command.match(/(?:--theme|-t)[=\s]+["']?(\d+)/);
  if (!idMatch) {
    block('Blocked: live push without an explicit numeric `--theme <id>`. Run the live confirmation flow from CLAUDE.md.');
  }

  const tokenFile = path.join(os.tmpdir(), `live-push-token-${idMatch[1]}`);
  let issuedAt = 0;
  try {
    issuedAt = Number(fs.readFileSync(tokenFile, 'utf8'));
  } catch {
    block(`Blocked: no live-push confirmation for theme ${idMatch[1]}. Run the live confirmation flow from CLAUDE.md and wait for the user to type the exact sentence.`);
  }

  fs.rmSync(tokenFile, { force: true });
  if (Date.now() - issuedAt > TOKEN_TTL_MS) {
    block('Blocked: live-push confirmation expired. Ask the user to confirm again.');
  }

  process.exit(0);
});
