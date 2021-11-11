const { google } = require("googleapis");
const getArtistTitle = require("get-artist-title")
const youtube = google.youtube('v3');
const { YOUTUBE_SECRET } = require("./config.json");
const logger = require("./logger");


function cleanSongs (artist, title) {

    title = title.replace(/\[[^)]*\]|\([^)]*\)|{\([^)]*\}|lyrics|ft|feat.*|nightcore|[^0-9a-zA-ZÀ-ÖØ-öø-ÿ \n']+/gi, "").replace(/([ ]{2,})/gi, ' ')
    artist = title.replace(/\[[^)]*\]|\([^)]*\)|{\([^)]*\}|lyrics|ft|feat.*|nightcore|[^0-9a-zA-ZÀ-ÖØ-öø-ÿ \n']+/gi, "").replace(/([ ]{2,})/gi, ' ')
    artist = artist.trim();
    title = title.trim();
 

    return { artist, title}

    
}


class Youtube {
    constructor() {
        this.songs = [];
    }

    async getPlaylist(playlistId, token) {
        const results = await youtube.playlistItems.list({
            key: YOUTUBE_SECRET,
            playlistId:playlistId,
            part:"snippet",
            maxResults:"300",
            pageToken:token
        })

        const items = results.data.items;;

        for (let item in items) {
            const song = items[item].snippet.title;
            try {
                const [artist,title] = getArtistTitle(song);
                const cleanedSong = cleanSongs(artist,title)
                
                this.songs.push(cleanedSong)
            } catch (err) {
            }
        }

        return results

   
    }

    async getSongsFromPlaylist(playlistId) {
        let results = await this.getPlaylist(playlistId);
        while ("nextPageToken" in results.data) {
            const pageToken = results.data['nextPageToken'];

            results = await this.getPlaylist(playlistId, pageToken);
    
        }
        return this.songs;
    }


}

module.exports = Youtube;