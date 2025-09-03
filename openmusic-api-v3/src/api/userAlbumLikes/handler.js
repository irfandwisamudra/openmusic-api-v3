const autoBind = require('auto-bind');

class UserAlbumLikesHandler {
  constructor(userAlbumLikesService) {
    this._userAlbumLikesService = userAlbumLikesService;

    autoBind(this);
  }

  async postUserAlbumLikesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._userAlbumLikesService.verifyUserAlbumLikes(
      credentialId,
      albumId
    );
    await this._userAlbumLikesService.addUserAlbumLikes(credentialId, albumId);

    return h
      .response({
        status: 'success',
        message: 'Berhasil menyukai album',
      })
      .code(201);
  }

  async deleteUserAlbumLikesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._userAlbumLikesService.deleteUserAlbumlikes(
      credentialId,
      albumId
    );

    return h
      .response({
        status: 'success',
        message: 'Batal menyukai album',
      })
      .code(200);
  }

  async getUserAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, source } =
      await this._userAlbumLikesService.getUserAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: { likes },
    });
    response.header('X-Data-Source', source);
    return response;
  }
}

module.exports = UserAlbumLikesHandler;
