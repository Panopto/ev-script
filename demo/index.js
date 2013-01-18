(function($) {
  $(document).ready(function() {
    var app = new EnsembleApp({
      ensembleUrl: 'https://localhost:8000/ensemble'
    });
    app.handleField($('#video').parent(), new VideoSettings(), '#video');
  });
}(jQuery));
