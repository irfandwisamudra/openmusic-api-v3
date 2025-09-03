const ActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'activities',
  version: '1.0.0',
  register: async (server, { playlistsService, activitiesService }) => {
    const activitiesHandler = new ActivitiesHandler(
      playlistsService,
      activitiesService
    );
    server.route(routes(activitiesHandler));
  },
};
