define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        SettingsView = require('ev-script/views/settings'),
        BaseCollection = require('ev-script/collections/base');

    require('jquery-ui/ui/widgets/dialog');
    require('jquery-ui/ui/widgets/tabs');

    return SettingsView.extend({
        template: _.template(require('text!ev-script/templates/playlist-settings.html')),
        initialize: function(options) {
            SettingsView.prototype.initialize.call(this, options);
            _.bindAll(this, 'changeLayout', 'changeCategoryList');
            this.categories = options.categories;
            this.categories.on('reset', _.bind(function() {
                this.render();
            }, this));
        },
        events: {
            'submit': 'submitHandler',
            'click .action-cancel': 'cancelHandler',
            'change input[name="layout"]': 'changeLayout',
            'change input[name="categoryList"]': 'changeCategoryList'
        },
        updateModel: function() {
            var content = this.field.model.get('content'),
                categories = [],
                attrs = {
                    'embedtype': this.$('#embedtype').val(),
                    'layout': this.$('input[name="layout"]:checked').val(),
                    'annotations': this.$('#annotations').is(':checked'),
                    'showcaptions': this.$('#showcaptions').is(':checked'),
                    'captionsearch': this.$('#captionsearch').is(':checked'),
                    'socialsharing': content && content.isRestricted ? false : this.$('#socialsharing').is(':checked'),
                    'viewersreport': this.$('#viewersreport').is(':checked'),
                    'axdxs': this.$('#axdxs').is(':checked'),
                    'attachments': this.$('#attachments').is(':checked'),
                    'audiopreviewimage': this.$('#audiopreviewimage').is(':checked'),
                    'autoplay': this.$('#autoplay').is(':checked'),
                    'credits': this.$('#credits').is(':checked'),
                    'dateproduced': this.$('#dateproduced').is(':checked'),
                    'embedcode': content && content.isRestricted ? false : this.$('#embedcode').is(':checked'),
                    'duration': this.$('#duration').is(':checked'),
                    'links': this.$('#links').is(':checked'),
                    'nextup': this.$('#nextup').is(':checked')
                };

            this.$('#categories option:selected').each(function(index, category) {
                var value = $(category).val();
                if (value === -1) {
                    categories = [];
                    return false;
                }
                categories.push(value);
            });

            _.extend(attrs, {
                sortby: this.$('#sortby option:selected').val(),
                desc: this.$('input[name="sortDirection"]:checked').val() === 'desc',
                search: this.$('#search').val(),
                categories: categories.join(','),
                resultscount: this.$('#resultscount').val()
            });

            this.field.model.set(attrs);
        },
        render: function() {
            var content = this.field.model.get('content');
            this.$el.html(this.template({
                appInfo: this.info,
                config: this.config,
                i18n: this.i18n,
                model: this.field.model,
                isSecure: content && content.isRestricted,
                categories: this.categories || new BaseCollection([], {}),
                _: _
            }));
            this.$('.tabs').tabs();
            this.$el.dialog({
                title: this.unencode(content ? content.title : this.field.model.get('id')),
                modal: true,
                autoOpen: false,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                width: Math.min(680, $(window).width() - this.config.dialogMargin),
                height: Math.min(500, $(window).height() - this.config.dialogMargin),
                closeText: this.i18n.formatMessage('Close')
            });
        },
        changeLayout: function(e) {
            var layout = e.currentTarget.value;
            this.$('.layout-section').hide();
            this.$('.' + layout + 'Options').show();
            if (layout === 'loop') {
                this.$('#nextup').prop('disabled', false);
            } else {
                this.$('#nextup').prop('disabled', true);
            }
        },
        changeCategoryList: function(e) {
            if ($(e.currentTarget).is(':checked')) {
                this.$('#categoryOrientationHorizontal').prop('disabled', false);
                this.$('#categoryOrientationVertical').prop('disabled', false);
            } else {
                this.$('#categoryOrientationHorizontal').prop('disabled', true);
                this.$('#categoryOrientationVertical').prop('disabled', true);
            }
        }
    });

});
