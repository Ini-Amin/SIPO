const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to the Antigravity App Data directory
const brainDir = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
const outputDir = path.join(__dirname, '..', 'chat-histories');

if (!fs.existsSync(brainDir)) {
  console.error(`Direktori data Antigravity tidak ditemukan di: ${brainDir}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Membaca riwayat chat dari: ${brainDir}\n`);

const sessions = fs.readdirSync(brainDir).filter(file => {
  return fs.statSync(path.join(brainDir, file)).isDirectory();
});

sessions.forEach(sessionId => {
  const logDir = path.join(brainDir, sessionId, '.system_generated', 'logs');
  const transcriptPath = path.join(logDir, 'transcript.jsonl');
  
  if (!fs.existsSync(transcriptPath)) return;

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');

  let markdown = `# Riwayat Chat - Session ${sessionId}\n\n`;
  let messageCount = 0;

  lines.forEach(line => {
    try {
      const data = JSON.parse(line);
      if (data.type === 'USER_INPUT') {
        markdown += `### 👤 User\n\n${data.content}\n\n---\n\n`;
        messageCount++;
      } else if (data.type === 'PLANNER_RESPONSE') {
        markdown += `### 🤖 Antigravity\n\n${data.content || ''}\n\n`;
        if (data.tool_calls && data.tool_calls.length > 0) {
          const toolNames = data.tool_calls.map(tc => tc.name || tc.toolName).filter(Boolean);
          if (toolNames.length > 0) {
            markdown += `*Tools used: ${toolNames.join(', ')}*\n\n`;
          }
        }
        markdown += `---\n\n`;
        messageCount++;
      }
    } catch (e) {
      // Mengabaikan baris yang bukan format JSON valid
    }
  });

  if (messageCount > 0) {
    const outputPath = path.join(outputDir, `session_${sessionId}.md`);
    fs.writeFileSync(outputPath, markdown, 'utf8');
    console.log(`✓ Berhasil mengekspor: chat-histories/session_${sessionId}.md (${messageCount} pesan)`);
  }
});

console.log(`\nEkspor selesai! File riwayat disimpan di folder: ${outputDir}`);
