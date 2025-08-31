/* eslint-disable camelcase */

const mapDBToModel = ({
  album_id,
  playlist_id,
  song_id,
  user_id,
  ...args
}) => ({
  ...args,
  albumId: album_id,
  playlistId: playlist_id,
  songId: song_id,
  userId: user_id,
});

module.exports = { mapDBToModel };
