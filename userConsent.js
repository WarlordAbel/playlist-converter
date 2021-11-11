const express = require('express');
const axios = require('axios');
const qs = require('qs');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = require("./config.json");
const logger = require('./logger');

exports.getUserConsent = async () => {
    const webServer = await startWebServer();
    createAuthUrl();
    const authorizationToken = await waitForSpotifyCallback(webServer);
    const requestSpotifyAccessToken = await getSpotifyUserToken(authorizationToken);
    await stopWebServer(webServer);
    return requestSpotifyAccessToken;
}

async function startWebServer() {
    return new Promise((resolve, reject) => {
        const port = 8888;
        const app = express();
    
        const server = app.listen(port, () => {
            resolve({
                app,
                server
            })
        })
    })
}

function createAuthUrl() {
    var scope = 'user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private';
    return logger('Please give us your consent :: ' + 'https://accounts.spotify.com/authorize?' +
        qs.stringify({
            response_type: 'code',
            client_id: SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: SPOTIFY_REDIRECT_URI,
        }));
}

async function waitForSpotifyCallback(webServer) {
    return new Promise((resolve, reject) => {
        logger("waiting for your consent");

        webServer.app.get('/callback', (req, res) => {
            const authCode = req.query.code;
            res.send('<h1>Thanks for your consent!</h1><p>Now you can close this page!</p>');
            resolve(authCode);
        })
    })
}

async function getSpotifyUserToken(authorizationToken) {
    return await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        data: qs.stringify({
            code: authorizationToken,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            grant_type: 'authorization_code'
        })
    })
    .then((res) => res.data)
    .catch((err) => err.response);
}

async function stopWebServer(webServer) {
    return await webServer.server.close();
}