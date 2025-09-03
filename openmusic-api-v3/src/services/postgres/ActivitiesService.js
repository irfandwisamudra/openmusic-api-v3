const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistActivity(playlistId, songId, userId, action) {
    const id = `history-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action, time) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };
    await this._pool.query(query);
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time
            FROM playlist_song_activities psa
            JOIN users u ON psa.user_id = u.id
            JOIN songs s ON psa.song_id = s.id
            WHERE psa.playlist_id = $1
            ORDER BY psa.time ASC`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ActivitiesService;
