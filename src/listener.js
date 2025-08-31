class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;
    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(
        message.content.toString()
      );
      const playlistData = await this._playlistsService.getPlaylistSongs(
        playlistId
      );
      await this._mailSender.sendEmail(
        targetEmail,
        JSON.stringify(playlistData)
      );
      console.log(
        `Email ekspor untuk playlist ${playlistId} berhasil dikirim ke ${targetEmail}`
      );
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
