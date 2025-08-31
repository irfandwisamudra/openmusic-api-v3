const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    const collaborationId = await this._collaborationsService.addCollaboration(
      playlistId,
      userId
    );
    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: { collaborationId },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);
    return { status: 'success', message: 'Kolaborasi berhasil dihapus' };
  }
}

module.exports = CollaborationsHandler;
