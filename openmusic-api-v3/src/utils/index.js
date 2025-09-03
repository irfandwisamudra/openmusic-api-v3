/* eslint-disable camelcase */

const mapAlbumDBToModel = ({ id, name, year, cover_url }) => ({
  id,
  name,
  year,
  coverUrl: cover_url ?? null,
});

const mapSongDBToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = {
  mapAlbumDBToModel,
  mapSongDBToModel,
};
