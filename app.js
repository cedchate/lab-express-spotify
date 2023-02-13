require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
  // Retrieve an access token
  spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));
// Our routes go here:

app.get('/', (req, res) => {
    res.render('home', {css:['style', 'home']});
})

app.get('/artist-search', (req, res, next) => {
    try {
        spotifyApi
            .searchArtists(req.query.artist)
            .then(data => {
                let apiRes= data.body.artists.items;
                apiRes.forEach((data)=> {
                    console.log(data.images)
                    if(!data.images[1]){
                        data.img='';
                    }else{
                        data.img = data.images[1].url;
                    }
                })
                // console.log('The received data from the API: ', apiRes);
                // const img= data.body.artists.items[0].images[0].url
                // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
                res.render('artist-search', { apiRes, css:['style', 'artist']});
            })
            .catch(err => console.log('The error while searching artists occurred: ', err));
    } catch (error) {
        next(error);
    }
})

app.get('/albums/:artistId', (req, res ,next) => {
    try {
        spotifyApi
        .getArtistAlbums(req.params.artistId)
        .then(data => {
            let apiRes= data.body.items;
            apiRes.forEach((data)=> {
                if(!data.images[1]){
                    data.img='';
                }else{
                    data.img = data.images[1].url;
                }
            })
            res.render('albums', {apiRes, css:['style', 'artist']} );
        })
        .catch(err => console.log('The error while searching albums occurred: ', err));
    } catch (error) {
        next(error);
    }
})

app.get('/tracks/:albumId', (req, res, next) => {
    try {
        spotifyApi
        .getAlbumTracks(req.params.albumId)
        .then(data => {
            let apiRes= data.body.items;
            res.render('tracks', {apiRes, css: ['style', 'tracks']});
        })
        .catch(err => console.log('The error while searching tracks occurred: ', err));
    } catch (error) {
        next(error);
    }
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
