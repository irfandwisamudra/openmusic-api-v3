const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cache = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const result = await this._pool.query({
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    });

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumRes = await this._pool.query({
      text: 'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
      values: [id],
    });

    if (!albumRes.rowCount) throw new NotFoundError('Album tidak ditemukan');

    const songsRes = await this._pool.query({
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    });

    const a = albumRes.rows[0];
    return {
      id: a.id,
      name: a.name,
      year: a.year,
      coverUrl: a.cover_url ?? null,
      songs: songsRes.rows.map(({ id, title, performer }) => ({
        id,
        title,
        performer,
      })),
    };
  }

  async editAlbumById(id, { name, year }) {
    const res = await this._pool.query({
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    });
    if (!res.rowCount)
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
  }

  async addAlbumCover(id, coverUrl) {
    const res = await this._pool.query({
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    });
    if (!res.rowCount)
      throw new NotFoundError(
        'Gagal memperbarui cover album. Id tidak ditemukan'
      );
  }

  async deleteAlbumById(id) {
    const res = await this._pool.query({
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    });
    if (!res.rowCount)
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
  }
}

module.exports = AlbumsService;
