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

      const payload = await this._playlistsService.getPlaylistSongs(playlistId);

      await this._mailSender.sendEmail(targetEmail, JSON.stringify(payload));
      console.log('Export playlist terkirim ke email:', targetEmail);
    } catch (e) {
      console.error('Gagal memproses pesan export:', e);
    }
  }
}

module.exports = Listener;
