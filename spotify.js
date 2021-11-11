const axios = require('axios')
const spotify = require("spotify-web-api-node")
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_USER_ID }= require("./config.json")


class Spotify {
    
    constructor () {
        this.api = "https://api.spotify.com/v1/"
    }

    async queryTrackUri (token, query) {
        const data = await axios({
            method: 'get',
            url: `${this.api}search?q=${query}&type=track&limit=1`,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then((res) => res.data)
        .catch((err) => err.response.data);

        if (data.error) return data

        if (data.tracks.items.length == 0) return { error: { message: 'No tracks founded for query ' + query } }

        return { data: data.tracks.items[0].uri }
    }

    async addTrackOnPlaylist (token, playlistId, trackURI) {
        const data = {
            "position": 0,
            "uris": trackURI.constructor === Array ? trackURI : [trackURI],
        }
    
        const req = await axios({
            method: 'post',
            url: `${this.api}playlists/${playlistId}/tracks`,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data
        })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    
        if (req.error) return false;
        return true;
    }


    async createPlaylist(token, userId, playlistData) {
        if (!playlistData.name || !playlistData.description) return { error: { message: 'Playlist name and description are required on playlistData!' } }
        if (!playlistData.public) playlistData.public == false;
    
        const req = await axios({
            method: 'post',
            url: `${this.api}users/${userId}/playlists`,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(playlistData)
        })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    
        if (req.error) return req;
        return { data: req.id };
    }

    async getUserInfo (token) {
        const req = await axios({
            method: 'get',
            url: `${this.api}me`,
            headers: {
                'Authorization': 'Bearer ' + token
            },
        })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    
        if (req.error) return req.error.message;
        return req;
    }
}



module.exports = Spotify;