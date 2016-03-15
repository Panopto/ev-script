require.config({

	baseUrl: '/',

	deps: ['ev-script'],

	paths: {
		'ev-script': 'src/ev-script',
		'jquery': 'empty:',
		'jquery-ui': 'empty:',
		'jquery.cookie': 'bower_components/jquery.cookie/jquery.cookie',
		'jquery.plupload.queue': 'empty:',
		'jquery-truncate-html': 'bower_components/jquery-truncate-html/jquery.truncate',
		'plupload': 'empty:',
		'ev-scroll-loader': 'bower_components/ev-scroll-loader/dist/jquery.ev-scroll-loader',
		'underscore': 'bower_components/underscore/underscore',
		'backbone': 'bower_components/backbone/backbone',
		'text': 'bower_components/text/text',
		'semver': 'bower_components/semver/semver.browser'
	}

	// stubModules: ['jquery', 'jquery-ui', 'jquery.plupload.queue', 'plupload']

});