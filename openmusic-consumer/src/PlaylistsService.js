const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password:
        process.env.PGPASSWORD != null ? String(process.env.PGPASSWORD) : '',
    });
  }

  async getPlaylistSongs(playlistId) {
    const songs = await this._pool.query({
      text: `
        SELECT s.id, s.title, s.performer
        FROM playlist_songs ps
        JOIN songs s ON s.id = ps.song_id
        WHERE ps.playlist_id = $1
        ORDER BY s.title ASC
      `,
      values: [playlistId],
    });
    return songs.rows;
  }
}

module.exports = PlaylistsService;
