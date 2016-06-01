define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
        },
        // Override to render the actual embed
        render: function() {},
        // Return width of embed frame
        getFrameWidth: function() {
            return this.model.get('width');
        },
        // Return height of embed frame
        getFrameHeight: function() {
            return this.model.get('height');
        },
        // Override if we can scale our embed to fit desired dimensions
        // Maximum width available
        // Maximum height available
        scale: function(maxWidth, maxHeight) {}
    });

});
