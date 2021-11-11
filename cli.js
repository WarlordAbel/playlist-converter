const readline = require("readline-promise").default;
const logger = require("./logger");
const Youtube = require('./youtube.js');
const Spotify = require("./spotify");
const moment = require('moment');
const { getUserConsent } = require("./userConsent");
const { green,red } = require("colors")

const youtube = new Youtube();
const spotify = new Spotify();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

async function init() {

    const token = await getUserConsent();
    const userInfo = await spotify.getUserInfo(token.access_token);
    const youtubePlaylistId = await rl.questionAsync(`[${moment().format('hh:mm:ss.SSS')}] :: Enter the ID of the youtube playlist :: `);
    const spotifyPlaylistName = await rl.questionAsync(`[${moment().format('hh:mm:ss.SSS')}] :: Enter a name for your spotify playist :: `)
    const playlistId = await spotify.createPlaylist(token.access_token, userInfo.id, { name: spotifyPlaylistName, description: 'Playlist auto converted from Youtube using Kauefranca/sync-playlists'});
    const youtubeVideos = await youtube.getSongsFromPlaylist(youtubePlaylistId)
    logger("Converting playlist, please wait...".yellow)

    for (let {  title, artist} of youtubeVideos) {
        if (title && artist) {
            const uri = await spotify.queryTrackUri(token.access_token, encodeURIComponent(title,artist));

            if (!uri.error) {
                const songAddded = await spotify.addTrackOnPlaylist(token.access_token, playlistId.data, uri.data);
                if (songAddded) {
                    logger(`Successfully added ${title} to playlist`.green)
                }
            } else {
                logger(`Failed to add ${title} to playlist`.red)
            }

        }
    }


    process.exit()


}

init()