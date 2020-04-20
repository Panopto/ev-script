define(function(require, template) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URI = require('urijs/URI'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events');

    require('jquery-ui/ui/widgets/dialog');

    return Backbone.View.extend({
        template: _.template(require('text!ev-script/templates/auth.html')),
        initialize: function(options) {
            this.config = cacheUtil.getConfig();
            this.events = eventsUtil.getEvents();
            this.i18n = cacheUtil.getI18n();
            this.submitCallback = options.submitCallback || function() {};
        },
        render: function() {
            var dialogWidth = Math.min(540, $(window).width() - this.config.dialogMargin),
                dialogHeight = Math.min(!this.config.defaultProvider ? 400 : 300, $(window).height() - this.config.dialogMargin),
                frameSrc = URI(this.config.ensembleUrl)
                    .path(this.config.authLoginPath)
                    .addQuery('idp', this.config.defaultProvider)
                    .addQuery('institutionId', this.config.institutionId),
                $html = $(this.template({
                    i18n: this.i18n,
                    frameSrc: frameSrc,
                    frameWidth: '100%',
                    frameHeight: dialogHeight - 60
                }));
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);
            this.$dialog.dialog({
                title: this.i18n.formatMessage('Ensemble Video Login') + ' - ' + this.config.ensembleUrl,
                modal: true,
                draggable: false,
                resizable: false,
                closeOnEscape: false,
                width: dialogWidth,
                height: dialogHeight,
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    this.$dialog.html($html);
                    $('.ui-dialog-titlebar-close', ui.dialog | ui).hide();
                }, this),
            });
            $(window).on('message', _.bind(function(e) {
                if (e.originalEvent.data === this.config.authCompleteMessage) {
                    if (this.$dialog) {
                        try {
                            this.$dialog.dialog('destroy');
                        } catch (e) {
                            // All good?
                        }
                        finally {
                            this.$dialog.remove();
                        }
                    }
                    this.submitCallback();
                }
            }, this));
        }
    });

});
