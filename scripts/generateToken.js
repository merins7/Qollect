const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open');
const destroyer = require('server-destroy');

const oauth2Client = new google.auth.OAuth2(
    '264830877512-0bntdvc23c58pjj9dd9ge0jthk5dc6i2.apps.googleusercontent.com',
    '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',
    'http://localhost:3000/oauth2callback'
);

const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

async function getRefreshToken() {
    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });

    // Open browser for auth
    open(authorizeUrl, {wait: false});

    // Create server for callback
    const server = http
        .createServer(async (req, res) => {
            try {
                const queryParams = url.parse(req.url, true).query;
                if (queryParams.code) {
                    const {tokens} = await oauth2Client.getToken(queryParams.code);
                    console.log('Refresh Token:', tokens.refresh_token);
                    
                    res.end('Authentication successful! You can close this window.');
                    server.destroy();
                }
            } catch (e) {
                console.error('Error getting tokens:', e);
                res.end('Authentication failed! Please try again.');
                server.destroy();
            }
        })
        .listen(3000, () => {
            console.log('Listening on port 3000...');
        });

    destroyer(server);
}

getRefreshToken(); 