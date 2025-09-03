const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    return result.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT s.id, s.title, s.performer
          FROM songs s
          JOIN playlist_songs ps ON s.id = ps.song_id
          WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistSong(songId, playlistId) {
    const res = await this._pool.query({
      text: 'DELETE FROM playlist_songs WHERE song_id=$1 AND playlist_id=$2 RETURNING id',
      values: [songId, playlistId],
    });
    if (!res.rows.length)
      throw new InvariantError('Lagu gagal dihapus dari playlist');
  }
}

module.exports = PlaylistSongsService;
