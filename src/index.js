(function($) {
  $(document).ready(function() {
    var app = new EnsembleApp();
    app.handleField($('#video').parent(), new VideoSettings(), '#video');
  });
}(jQuery));
