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
            _.bindAll(this, 'changeLayout', 'changeCategoryList', 'changeEmbedType');
            this.categories = options.categories;
            this.categories.on('reset', _.bind(function() {
                this.render();
            }, this));
        },
        events: {
            'submit': 'submitHandler',
            'click .action-cancel': 'cancelHandler',
            'change select[name="embedtype"]': 'changeEmbedType',
            'change input[name="layout"]': 'changeLayout',
            'change input[name="categoryList"]': 'changeCategoryList'
        },
        updateModel: function() {
            var content = this.field.model.get('content'),
                categories = [],
                attrs = {
                    'width': this.$('.width').val(),
                    'height': this.$('.height').val(),
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
                    'logo': this.$('#logo').is(':checked'),
                    'metadata': this.$('#metadata').is(':checked'),
                    'embedcode': content && content.isRestricted ? false : this.$('#embedcode').is(':checked'),
                    'links': this.$('#links').is(':checked'),
                    'nextup': this.$('#nextup').is(':checked'),
                    'jswrapper': this.$('#jswrapper').is(':checked'),
                    'wrapstyle': this.$('#wrapstyle').val(),
                    'wrapscript': this.$('#wrapscript').val()
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
                height: Math.min(540, $(window).height() - this.config.dialogMargin),
                closeText: this.i18n.formatMessage('Close')
            });
        },
        changeLayout: function(e) {
            var layout = e.currentTarget.value,
                elementId = 'pl-wrapper-' + this.field.model.get('id');
            if (layout === 'loop') {
                this.$('#nextup').prop('disabled', false);
            } else {
                this.$('#nextup').prop('disabled', true);
            }

            switch (layout) {
                case 'list':
                case 'grid':
                    this.$('.width').val(800);
                    this.$('.height').val(590);
                    this.$('#wrapstyle').val('position: relative; padding-bottom: 56.25%; padding-top: 132px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;');
                    this.$('#wrapscript').val('function handleResize() { var e = document.getElementById("' + elementId + '"); if (null != e) { var i = e.getElementsByTagName("iframe")[0]; if (null != i) { e.style = "width: 100%; height: 100%;"; i.style = "width: 100%; height: 100%;"; var n = e.offsetWidth; e.style.height = n >= 400 ? 56.25 * n / 100 + 140 + "px" : 56.25 * n / 100 + 390 + "px" }}} handleResize(), window.onresize = function (e) { handleResize() };');
                    this.$('.responsiveOptionsContainer').show();
                    break;
                case 'listWithPlayer':
                case 'gridWithPlayer':
                    this.$('.width').val(700);
                    this.$('.height').val(750);
                    this.$('#wrapstyle').val('position: relative; padding-bottom: 56.25%; padding-top: 400px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;');
                    this.$('#wrapscript').val('');
                    this.$('.responsiveOptionsContainer').hide();
                    break;
                case 'verticalListWithPlayer':
                    this.$('.width').val(1000);
                    this.$('.height').val(390);
                    this.$('#wrapstyle').val('position: relative; padding-bottom: 39%; padding-top: 0px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;');
                    this.$('#wrapscript').val('function handleResize() { var e = document.getElementById("' + elementId + '"); if (null != e) { var i = e.getElementsByTagName("iframe")[0]; if (null != i) { e.style = "width: 100%; height: 100%;"; i.style = "width: 100%; height: 100%;"; var n = e.offsetWidth; e.style.height = n >= 822 ? 66.6 * n / 100 * .5625 + 15 + "px" : .5625 * n + 350 + "px" }}} handleResize(), window.onresize = function (e) { handleResize() };');
                    this.$('.responsiveOptionsContainer').show();
                    break;
                case 'horizontalListWithPlayer':
                    this.$('.width').val(800);
                    this.$('.height').val(700);
                    this.$('#wrapstyle').val('position: relative; padding-bottom: 56.25%; padding-top: 300px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;');
                    this.$('#wrapscript').val('');
                    this.$('.responsiveOptionsContainer').hide();
                    break;
                case 'showcase':
                    this.$('.width').val(1000);
                    this.$('.height').val(590);
                    this.$('#wrapstyle').val('position: relative; padding-bottom: 39%; padding-top: 300px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;');
                    this.$('#wrapscript').val('function handleResize() { var e = document.getElementById("' + elementId + '"); if (null != e) { var i = e.getElementsByTagName("iframe")[0]; if (null != i) { e.style = "width: 100%; height: 100%;"; i.style = "width: 100%; height: 100%;"; var n = e.offsetWidth; e.style.height = n >= 822 ? 66.6 * n / 100 * .5625 + 300 + "px" : 66.6 * n / 100 * .5625 + 500 + "px" }}} handleResize(), window.onresize = function (e) { handleResize() };');
                    this.$('.responsiveOptionsContainer').show();
                    break;
                case 'horizontalList':
                    this.$('.width').val(1000);
                    this.$('.height').val(250);
                    this.$('#wrapstyle').val('position: relative; padding-bottom: 0; padding-top: 300px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;');
                    this.$('#wrapscript').val('');
                    this.$('.responsiveOptionsContainer').hide();
                    break;
                case 'loop':
                    this.$('.width').val(800);
                    this.$('.height').val(455);
                    this.$('#wrapstyle').val('position: relative; padding-bottom: 56.25%; padding-top: 10px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;');
                    this.$('#wrapscript').val('');
                    this.$('.responsiveOptionsContainer').hide();
                    break;
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
        },
        changeEmbedType: function(e) {
            var embedtype = e.currentTarget.value,
                layout = this.$('input[name="layout"]:checked').val(),
                configurableResponsiveLayouts = [
                    'verticalListWithPlayer',
                    'grid',
                    'list',
                    'showcase'
                ];
            if (embedtype === 'fixed') {
                this.$('.fixedOptionsContainer').show();
                this.$('.responsiveOptionsContainer').hide();
            } else if (embedtype === 'responsive') {
                this.$('.fixedOptionsContainer').hide();
                if (_.contains(configurableResponsiveLayouts, layout)) {
                    this.$('.responsiveOptionsContainer').show();
                } else {
                    this.$('.responsiveOptionsContainer').hide();
                }
            } else {
                throw 'Unrecognized embedtype: \'' + embedtype + '\'';
            }
        }
    });

});
