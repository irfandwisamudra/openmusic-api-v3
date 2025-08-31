const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistSongs(playlistId) {
    const playlistQuery = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const songsQuery = {
      text: 'SELECT s.id, s.title, s.performer FROM songs s JOIN playlist_songs ps ON s.id = ps.song_id WHERE ps.playlist_id = $1',
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    const songsResult = await this._pool.query(songsQuery);

    return {
      playlist: {
        ...playlistResult.rows[0],
        songs: songsResult.rows,
      },
    };
  }
}

module.exports = PlaylistsService;
