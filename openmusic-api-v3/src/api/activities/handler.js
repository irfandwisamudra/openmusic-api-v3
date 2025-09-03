const autoBind = require('auto-bind');

class ActivitiesHandler {
  constructor(playlistsService, activitiesService) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;
    autoBind(this);
  }

  async getActivitiesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._activitiesService.getPlaylistActivities(
      playlistId
    );

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = ActivitiesHandler;
