define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        $ = require('jquery'),
        cacheUtil = require('ev-script/util/cache'),
        BasicAuth = require('ev-script/auth/basic/auth'),
        AppInfo = require('ev-script/models/app-info'),
        evSettings = require('ev-config'),
        eventsUtil = require('ev-script/util/events');

    q.module('Testing ev-script/auth/basic/auth', {
        setup: function() {
            q.stop();
            var appId = 'ev-script/auth/basic/auth';
            eventsUtil.initEvents(appId);
            this.globalEvents = eventsUtil.getEvents('global');
            this.config = _.extend({}, evSettings);
            this.config.authType = 'basic';
            if (!this.config.urlCallback) {
                this.config.urlCallback = _.bind(function(url) {
                    return this.config.proxyPath + '?ensembleUrl=' + encodeURIComponent(this.config.ensembleUrl) + '&request=' + encodeURIComponent(url);
                }, this);
            }
            cacheUtil.setAppConfig(appId, this.config);
            var info = new AppInfo({}, {
                appId: appId
            });
            cacheUtil.setAppInfo(appId, info);
            info.fetch({})
            .always(_.bind(function() {
                this.auth = new BasicAuth(appId);
                q.start();
            }, this));
        },
        teardown: function() {
            q.stop();
            this.auth.logout()
            .always(function() {
                q.start();
            });
        }
    });

    q.test('check api', 5, function() {
        q.ok(_.isFunction(this.auth.getUser), 'expected getUser');
        q.ok(_.isFunction(this.auth.isAuthenticated), 'expected isAuthenticated');
        q.ok(_.isFunction(this.auth.login), 'expected login');
        q.ok(_.isFunction(this.auth.logout), 'expected logout');
        q.ok(_.isFunction(this.auth.handleUnauthorized), 'expected handleUnauthorized');
    });

    q.asyncTest('invalid credentials test', 2, function() {
        var username = 'foo',
            password = 'bar';
        this.auth.login({
            username: username,
            password: password
        })
        .fail(_.bind(function() {
            q.ok(!this.auth.isAuthenticated());
            q.strictEqual(this.auth.getUser(), null);
        }, this))
        .always(function() {
            q.start();
        });
    });

    q.asyncTest('valid credentials test', 4, function() {
        q.stop(1);
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
        })
        .done(_.bind(function() {
            q.ok(this.auth.isAuthenticated());
            q.ok(this.auth.getUser() !== null);
            this.auth.logout()
            .done(_.bind(function() {
                q.ok(!this.auth.isAuthenticated());
                q.strictEqual(this.auth.getUser(), null);
            }, this))
            .always(function() {
                q.start(1);
            });
        }, this))
        .always(function() {
            q.start(1);
        });
    });

    q.asyncTest('loggedIn event test', 2, function() {
        q.stop(1);
        this.globalEvents.once('loggedIn', function(id) {
            if (id === evSettings.ensembleUrl) {
                q.ok(true);
                q.start(1);
            }
        });
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
        }).done(_.bind(function() {
            q.ok(this.auth.isAuthenticated());
            q.start(1);
        }, this));
    });

    q.asyncTest('loggedOut event test', 3, function() {
        q.stop(1);
        this.globalEvents.once('loggedOut', function(id) {
            if (id === evSettings.ensembleUrl) {
                q.ok(true);
                q.start(1);
            }
        });
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
        }).done(_.bind(function() {
            q.ok(this.auth.isAuthenticated());
            this.auth.logout()
            .done(_.bind(function() {
                q.ok(!this.auth.isAuthenticated());
                q.start(1);
            }, this));
        }, this));
    });

    q.asyncTest('domain test', 1, function() {
        this.auth.config.authDomain = 'ensemblevideo.com';
        this.auth.login({
            username: 'foo',
            password: 'bar'
        })
        // We don't expect success...just that the local auth cookie is set correctly
        .always(_.bind(function() {
            q.strictEqual('foo@' + this.auth.config.authDomain, $.cookie(this.config.ensembleUrl + '-user'));
            q.start();
        }, this));
    });

    q.asyncTest('valid path test', 1, function() {
        this.auth.config.authPath = this.config.proxyPath;
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
        })
        .done(_.bind(function() {
            q.ok(this.auth.isAuthenticated());
        }, this))
        .always(function() {
            q.start();
        });
    });

    q.asyncTest('invalid path test', 1, function() {
        this.auth.config.authPath = '/foo';
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
        })
        .fail(_.bind(function() {
            q.ok(!this.auth.isAuthenticated());
        }, this))
        .always(function() {
            q.start();
        });
    });

});
