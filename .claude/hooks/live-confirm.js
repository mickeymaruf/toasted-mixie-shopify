// UserPromptSubmit hook (cloud only): turns the user's exact confirmation
// sentence into a one-time token that live-guard.js checks before a live push.
// Only a message typed by the user can reach this hook, so Claude can't forge it.
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.CLAUDE_CODE_REMOTE !== 'true') process.exit(0);

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let prompt = '';
  try {
    prompt = String(JSON.parse(input).prompt || '').trim();
  } catch {
    process.exit(0);
  }

  const match = prompt.match(/^PUSH TO LIVE: (.+) \((\d+)\)$/);
  if (!match) process.exit(0);

  const tokenFile = path.join(os.tmpdir(), `live-push-token-${match[2]}`);
  fs.writeFileSync(tokenFile, String(Date.now()));
  process.exit(0);
});
