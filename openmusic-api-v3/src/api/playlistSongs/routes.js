const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.postPlaylistSongHandler,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getPlaylistSongsByIdHandler,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: handler.deletePlaylistSongByIdHandler,
    options: { auth: 'openmusic_jwt' },
  },
];

module.exports = routes;
