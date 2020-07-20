define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
        oidc = require('oidc'),
        URI = require('urijs/URI'),
        AuthRouter = require('ev-script/routers/auth'),
        oidcUserStore,
        oidcStateStore,
        Auth = function(options) {
            this.config = options.config;
            this.events = options.events;

            oidc.Log.logger = console;
            // oidc.Log.level = oidc.Log.DEBUG;

            // If access to localStorage is blocked...fallback to in-memory
            try {
                oidcUserStore = new oidc.WebStorageStateStore({ store: window.localStorage });
            } catch(error) {
                log.warn(error.message);
                oidcUserStore = oidcStateStore = new oidc.WebStorageStateStore({ store: new oidc.InMemoryWebStorage() });
            }

            this.userManager = new oidc.UserManager({
                client_id: this.config.clientId,
                authority: this.config.ensembleUrl + this.config.apiPath,
                redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/redirectCallback'),
                popup_redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/popupCallback'),
                silent_redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/silentCallback'),
                post_logout_redirect_uri: window.location.origin + URI.joinPaths(this.config.appRoot, 'auth/logoutCallback'),
                response_type: 'code',
                scope: 'openid email profile all offline_access',
                loadUserInfo: true,
                automaticSilentRenew: false,
                filterProtocolClaims: true,
                userStore: oidcUserStore,
                stateStore: oidcStateStore,
                silentRequestTimeout: 3000
            });
            this.userManager.clearStaleState();
            this.userManager.events.addUserLoaded(function(e) {
                console.log(e);
            });

            // Start silent renew
            this.userManager.startSilentRenew();

            this.authRouter = new AuthRouter({
                userManager: this.userManager,
                defaultCallback: options.callback,
                config: this.config
            });
        };

    Auth.prototype.doAuthenticate = function(currentField) {
        var loggedInHandler = _.bind(function(user, silent) {
                log.debug('[doAuthenticate] Found user');
                log.debug(user);
                this.events.trigger('loggedIn', currentField, silent);
                this.deferred.resolve();
            }, this),
            loggedOutHandler = _.bind(function(err) {
                log.debug('[doAuthenticate] No user found...triggering loggedOut');
                this.events.trigger('loggedOut');
                this.deferred.reject();
            }, this),
            loginHandler = _.bind(function() {
                log.debug('[doAuthenticate] No user found...attempting silent sign-in');
                this.userManager.signinSilent()
                .then(function(user) {
                    loggedInHandler(user, true);
                })
                .catch(_.bind(function(err) {
                    log.debug('[doAuthenticate] No user found...attempting pop-up sign-in');

                    var width = 500,
                        height = 500,
                        top = parseInt((screen.availHeight / 2) - (height / 2), 10),
                        left = parseInt((screen.availWidth / 2) - (width / 2), 10),
                        features = 'location=no,toolbar=no,width=500,height=500,left=' + left + ',top=' + top + ',screenX=' + left + ',screenY=' + top + ',chrome=yes;centerscreen=yes;';

                    this.userManager.signinPopup({
                        popupWindowFeatures: features,
                        extraQueryParams: {
                            'ev_institution_id': this.config.institutionId
                        }
                    })
                    .then(loggedInHandler)
                    .catch(loggedOutHandler);
                }, this));
            }, this);

        if (!this.deferred || this.deferred.state() !== 'pending') {
            this.deferred = $.Deferred();
            log.debug('[doAuthenticate] Checking for user');

            this.userManager.getUser()
            .then(_.bind(function(user) {
                if (!user || user.expired) {
                    loginHandler();
                } else if (this.config.currentUserId && this.config.currentUserId !== user.profile.sub) {
                    this.userManager.removeUser().then(loginHandler);
                } else {
                    loggedInHandler(user, true);
                }
            }, this))
            .catch(_.bind(function(err) {
                log.error(err);
            }, this));
        }

        return this.deferred.promise();
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
