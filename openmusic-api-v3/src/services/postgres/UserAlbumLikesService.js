const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cache = cacheService;
  }

  async _ensureAlbumExists(albumId) {
    const res = await this._pool.query({
      text: 'SELECT 1 FROM albums WHERE id = $1',
      values: [albumId],
    });
    if (res.rowCount === 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async verifyUserAlbumLikes(userId, albumId) {
    const res = await this._pool.query({
      text: 'SELECT 1 FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });
    if (res.rowCount > 0) {
      throw new ClientError('Anda sudah menyukai album ini');
    }
  }

  async addUserAlbumLikes(userId, albumId) {
    await this._ensureAlbumExists(albumId);
    const id = `likes-${nanoid(16)}`;

    const res = await this._pool.query({
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1,$2,$3) RETURNING id',
      values: [id, userId, albumId],
    });
    if (!res.rowCount) throw new InvariantError('Gagal menyukai album');

    await this._cache.delete(`user_album_likes:${albumId}`);
  }

  async deleteUserAlbumlikes(userId, albumId) {
    await this._ensureAlbumExists(albumId);
    const res = await this._pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    });
    if (!res.rowCount) throw new InvariantError('Gagal batal menyukai album');

    await this._cache.delete(`user_album_likes:${albumId}`);
  }

  async getUserAlbumLikes(albumId) {
    try {
      const raw = await this._cache.get(`user_album_likes:${albumId}`);
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'number' || Number.isNaN(parsed)) {
        throw new Error('stale cache');
      }
      return { likes: parsed, source: 'cache' };
    } catch (_) {
      await this._ensureAlbumExists(albumId);
      const { rowCount } = await this._pool.query({
        text: 'SELECT 1 FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      });
      await this._cache.set(
        `user_album_likes:${albumId}`,
        JSON.stringify(rowCount)
      );
      return { likes: rowCount, source: 'database' };
    }
  }
}

module.exports = UserAlbumLikesService;
