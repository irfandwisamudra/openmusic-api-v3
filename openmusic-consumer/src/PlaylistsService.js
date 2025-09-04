const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistSongs(playlistId) {
    const playlistRes = await this._pool.query({
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    });

    if (!playlistRes.rowCount) {
      throw new Error('Playlist tidak ditemukan');
    }

    const songsRes = await this._pool.query({
      text: `
        SELECT s.id, s.title, s.performer
        FROM playlist_songs ps
        JOIN songs s ON s.id = ps.song_id
        WHERE ps.playlist_id = $1
        ORDER BY s.title
      `,
      values: [playlistId],
    });

    return {
      playlist: {
        id: playlistRes.rows[0].id,
        name: playlistRes.rows[0].name,
        songs: songsRes.rows.map(({ id, title, performer }) => ({
          id,
          title,
          performer,
        })),
      },
    };
  }
}

module.exports = PlaylistsService;
