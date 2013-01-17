(function($) {
  $(document).ready(function() {
    var app = new EnsembleApp({
      ensembleUrl: 'http://localhost:8000/ensemble'
    });
    app.handleField($('#video').parent(), new VideoSettings(), '#video');
  });
}(jQuery));
