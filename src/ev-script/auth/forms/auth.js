define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseAuth = require('ev-script/auth/base/auth'),
        CurrentUser = require('ev-script/models/current-user'),
        AuthView = require('ev-script/auth/forms/view'),
        AuthSources = require('ev-script/collections/authsources'),
        FormsAuth = BaseAuth.extend({
            constructor: function(appId) {
                BaseAuth.prototype.constructor.call(this, appId);
                this.authSources = new AuthSources({}, {
                    appId: appId
                });
                this.asPromise = this.authSources.fetch();
            },
            login: function(loginInfo) {
                var url = this.config.ensembleUrl + '/api/Login';
                return $.ajax({
                    url: this.config.urlCallback ? this.config.urlCallback(url) : url,
                    type: 'POST',
                    dataType: 'json',
                    data: loginInfo,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: _.bind(function(data, status, xhr) {
                        this.user = new CurrentUser(data.Data[0], {
                            appId: this.appId
                        });
                        this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
                    }, this)
                }).promise();
            },
            logout: function() {
                var url = this.config.ensembleUrl + '/api/Logout';
                return $.ajax({
                    url: this.config.urlCallback ? this.config.urlCallback(url) : url,
                    type: 'POST',
                    xhrFields: {
                        withCredentials: true
                    },
                    success: _.bind(function(data, status, xhr) {
                        this.user = null;
                        this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                    }, this)
                }).promise();
            },
            handleUnauthorized: function(element, authCallback) {
                this.user = null;
                this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                this.asPromise.done(_.bind(function() {
                    var authView = new AuthView({
                        el: element,
                        submitCallback: authCallback,
                        appId: this.appId,
                        auth: this,
                        collection: this.authSources
                    });
                    authView.render();
                }, this));
            }
        });

    return FormsAuth;

});
