(function() {

  var evSettings = {
    ensembleUrl: 'https://cloud-test.ensemblevideo.com',
    authId: 'cloud-test',
    pageSize: 10,
    proxyPath: '/demo/ensemble'
  };

  if (typeof exports !== 'undefined') {
    exports.evSettings = evSettings;
  } else {
    this.evSettings = evSettings;
  }

}).call(this);
