(function() {

  var evSettings = {
    ensembleUrl: 'https://cloud-test.ensemblevideo.com',
    authId: 'cloud-test',
    proxyPath: '/demo/ensemble'
  };

  if (typeof exports !== 'undefined') {
    exports.evSettings = evSettings;
  } else {
    this.evSettings = evSettings;
  }

}).call(this);
