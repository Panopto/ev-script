/*global EV,evSettings,jQuery,document*/
(function($) {

  'use strict';

  var app = new EV.EnsembleApp({
    authId: evSettings.authId,
    ensembleUrl: evSettings.ensembleUrl,
    pageSize: evSettings.pageSize,
    urlCallback: function(url) {
      return evSettings.proxyPath + '?authId=' + evSettings.authId + '&request=' + encodeURIComponent(url);
    }
  });

  $(document).ready(function() {
    app.handleField($('#playlist').parent(), new EV.PlaylistSettings(), '#playlist');
  });

}(jQuery));
