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
    app.handleField($('#video').parent(), new EV.VideoSettings(), '#video');
  });

  /*
   * I'm trying to handle (decorate) the field once a video is "picked".
   * I think this requires handling of events yet to be communicated by the
   * picker.  AFAIK there's no DOM events here that I can listen to.
   *
   * So the picker needs to expose the events aggregator s.t. I can listen
   * here and do the right thing.  Events like "picked" or "updated" and
   * "cleared" or "removed".  This is only necessary for this example...not
   * for any current integration...but may be useful in other scenarios.
   */

}(jQuery));
