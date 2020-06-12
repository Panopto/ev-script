define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
        oidc = require('oidc'),
        URI = require('urijs/URI'),
        AuthRouter = require('ev-script/routers/auth'),
        Auth = function(options) {
            this.config = options.config;
            this.events = options.events;

            oidc.Log.logger = console;
            oidc.Log.level = oidc.Log.DEBUG;

            this.userManager = new oidc.UserManager({
                client_id: 'ev-chooser',
                authority: this.config.ensembleUrl + this.config.apiPath,
                redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/redirectCallback'),
                popup_redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/popupCallback'),
                silent_redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/silentCallback'),
                post_logout_redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/logoutCallback'),
                response_type: 'code',
                scope: 'openid email profile hapi offline_access',
                loadUserInfo: true,
                automaticSilentRenew: false,
                filterProtocolClaims: true,
                // TODO - if no localStorage use in-memory store?
                userStore: new oidc.WebStorageStateStore({ store: window.localStorage }),
                silentRequestTimeout: 3000
            });
            this.userManager.clearStaleState();
            this.userManager.events.addUserLoaded(function(e) {
                console.log(e);
            });

            this.authRouter = new AuthRouter({
                userManager: this.userManager,
                defaultCallback: options.callback,
                config: this.config
            });
        };

    // loginCallback is optional function which returns jquery promise
    // Allows action after user is loaded but prior to authentication completion
    Auth.prototype.doAuthenticate = function(loginCallback) {
        var deferred = $.Deferred(),
            loggedInHandler = _.bind(function(user) {
                log.debug('[doAuthenticate] Found user');
                log.debug(user);
                if (loginCallback) {
                    loginCallback().always(_.bind(function() {
                        this.events.trigger('loggedIn');
                        deferred.resolve();
                    }, this));
                }

                // Start silent renew
                this.userManager.startSilentRenew();
            }, this),
            loggedOutHandler = _.bind(function(err) {
                log.debug('[doAuthenticate] No user found...triggering loggedOut');
                this.events.trigger('loggedOut');
                deferred.reject();
            }, this),
            loginHandler = _.bind(function() {
                log.debug('[doAuthenticate] No user found...attempting silent sign-in');
                this.userManager.signinSilent()
                .then(loggedInHandler)
                .catch(_.bind(function(err) {
                    // From iframe we need a popup
                    if (window.location !== window.parent.location) {
                        log.debug('[doAuthenticate] No user found...attempting pop-up sign-in');

                        var width = 500,
                            height = 500,
                            top = parseInt((screen.availHeight / 2) - (height / 2), 10),
                            left = parseInt((screen.availWidth / 2) - (width / 2), 10),
                            features = 'location=no,toolbar=no,width=500,height=500,left=' + left + ',top=' + top + ',screenX=' + left + ',screenY=' + top + ',chrome=yes;centerscreen=yes;';

                        this.userManager.signinPopup({
                            popupWindowFeatures: features
                        })
                        .then(loggedInHandler)
                        .catch(loggedOutHandler);
                    } else {
                        log.debug('[doAuthenticate] No user found...attempting redirect sign-in');

                        this.userManager.signinRedirect()
                        .then(loggedInHandler)
                        .catch(loggedOutHandler);
                    }
                }, this));
            }, this);

        log.debug('[doAuthenticate] Checking for user');

        this.userManager.getUser()
        .then(_.bind(function(user) {
            if (!user || user.expired) {
                loginHandler();
            } else if (this.config.currentUserId && this.config.currentUserId !== user.profile.sub) {
                this.userManager.removeUser().then(loginHandler);
            } else {
                loggedInHandler(user);
            }
        }, this))
        .catch(_.bind(function(err) {
            log.error(err);
        }, this));

        return deferred;
    };

    Auth.prototype.logout = function() {
        this.userManager.stopSilentRenew();
        return this.userManager.signoutPopup()
            .then(_.bind(function() {
                this.events.trigger('loggedOut');
            }, this));
    };

    return Auth;

});