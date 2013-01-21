(function($) {
  $(document).ready(function() {
    var app = new EnsembleApp({
      authId: evSettings.authId,
      ensembleUrl: evSettings.ensembleUrl,
      pageSize: evSettings.pageSize,
      urlCallback: function(url) {
        return evSettings.proxyPath + '?authId=' + evSettings.authId + '&request=' + encodeURIComponent(url);
      }
    });
    app.handleField($('#video').parent(), new VideoSettings(), '#video');
  });
}(jQuery));
