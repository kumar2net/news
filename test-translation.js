const axios = require('axios');
const { spawn } = require('child_process');

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${msg}${COLORS.reset}`),
};

async function runTest() {
    log.section('Starting translation test...');
    const server = spawn('node', ['api/index-newsdata.js']);
    let serverReady = false;

    server.stdout.on('data', (data) => {
        console.log(`server: ${data}`);
        if (data.includes('API server listening')) {
            serverReady = true;
        }
    });

    server.stderr.on('data', (data) => {
        console.error(`server error: ${data}`);
    });

    // Wait for server to be ready
    while (!serverReady) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    log.info('Server started. Running test...');

    try {
        const response = await axios.get('http://localhost:3000/api/news?provider=newsdata&language=es');
        const articles = response.data;

        if (!articles || articles.length === 0) {
            log.error('No articles returned from the API.');
            process.exit(1);
        }

        const nonEnglishArticle = articles.find(a => a.language !== 'en');

        if (!nonEnglishArticle) {
            log.info('No non-English articles found in the response to test translation.');
        } else {
            if (nonEnglishArticle.description && nonEnglishArticle.description.includes('<br/><hr/><b>Translated:</b><br/>')) {
                log.success('Translation found in a non-English article description.');
            } else {
                log.error('Translation not found in a non-English article description.');
                console.log('Article for debugging:', nonEnglishArticle);
                process.exit(1);
            }
        }
    } catch (error) {
        log.error('Failed to get news from the API.');
        console.error(error);
        process.exit(1);
    } finally {
        server.kill();
        log.info('Server stopped.');
    }
}

runTest();
