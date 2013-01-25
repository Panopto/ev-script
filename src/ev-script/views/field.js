/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        VideoSettings = require('ev-script/models/video-settings'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        VideoPickerView = require('ev-script/views/video-picker'),
        VideoSettingsView = require('ev-script/views/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview'),
        VideoEncoding = require('ev-script/models/video-encoding'),
        PlaylistPickerView = require('ev-script/views/playlist-picker'),
        PlaylistSettingsView = require('ev-script/views/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview');

    /*
     * View for our field (element that we set with the selected content identifier)
     */
    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'chooseHandler', 'optionsHandler', 'removeHandler', 'previewHandler');
            this.$field = options.$field;
            this.eventAggr = options.eventAggr;
            this.config = options.config;
            var pickerOptions = {
                id: this.id + '-picker',
                tagName: 'div',
                className: 'ev-' + this.model.get('type') + '-picker',
                field: this,
                config: options.config,
                eventAggr: options.eventAggr,
                auth: options.auth,
                cache: options.cache
            };
            var settingsOptions = {
                id: this.id + '-settings',
                tagName: 'div',
                className: 'ev-settings',
                field: this
            };
            if(this.model instanceof VideoSettings) {
                this.modelClass = VideoSettings;
                this.pickerClass = VideoPickerView;
                this.settingsClass = VideoSettingsView;
                this.previewClass = VideoPreviewView;
                this.encoding = new VideoEncoding({}, {
                    config: this.config
                });
                if(!this.model.isNew()) {
                    this.encoding.set({
                        fetchId: this.model.id
                    });
                    this.encoding.fetch({
                        dataType: 'jsonp'
                    });
                }
                this.model.bind('change:id', _.bind(function() {
                    // Only fetch encoding if identifier is set
                    if(this.model.id) {
                        this.encoding.set({
                            fetchId: this.model.id
                        });
                        this.encoding.fetch({
                            dataType: 'jsonp',
                            success: _.bind(function(response) {
                                this.model.set({
                                    width: this.encoding.getWidth(),
                                    height: this.encoding.getHeight()
                                });
                            }, this)
                        });
                    } else {
                        this.encoding.clear();
                    }
                }, this));
                _.extend(settingsOptions, {
                    encoding: this.encoding
                });
            } else if(this.model instanceof PlaylistSettings) {
                this.modelClass = PlaylistSettings;
                this.pickerClass = PlaylistPickerView;
                this.settingsClass = PlaylistSettingsView;
                this.previewClass = PlaylistPreviewView;
            }
            this.picker = new this.pickerClass(_.extend({}, pickerOptions, {
                // We don't want to modify field model until we actually pick a new video...so use a copy as our current model
                model: new this.modelClass(this.model.toJSON()),
            }));
            this.settings = new this.settingsClass(settingsOptions);
            this.$field.after(this.picker.$el);
            this.renderActions();
            this.model.bind('change', _.bind(function() {
                if(!this.model.isNew()) {
                    this.$field.val(JSON.stringify(this.model.toJSON()));
                    this.renderActions();
                }
            }, this));
        },
        events: {
            'click .action-choose': 'chooseHandler',
            'click .action-preview': 'previewHandler',
            'click .action-options': 'optionsHandler',
            'click .action-remove': 'removeHandler'
        },
        chooseHandler: function(e) {
            // We only want one picker showing at a time so notify all fields to hide them (unless it's ours)
            this.eventAggr.trigger('hidePickers', this);
            if(this.picker.$el.is(':hidden')) {
                this.picker.showPicker();
            }
            e.preventDefault();
        },
        optionsHandler: function(e) {
            this.settings.show();
            e.preventDefault();
        },
        removeHandler: function(e) {
            this.model.clear();
            this.$field.val('');
            this.model.set(this.model.defaults, {
                silent: true
            });
            this.renderActions();
            e.preventDefault();
        },
        previewHandler: function(e) {
            var element = e.currentTarget;
            var previewView = new this.previewClass({
                el: element,
                encoding: this.encoding,
                model: this.model,
                config: this.config
            });
            e.preventDefault();
        },
        renderActions: function() {
            var html = '<div class="logo"><a target="_blank" href="' + this.config.ensembleUrl + '"><span>Ensemble Logo</span></a></div>';
            var label = (this.model instanceof VideoSettings) ? 'Video' : 'Playlist';
            if(!this.$actions) {
                this.$actions = $('<div class="ev-field"/>');
                this.$field.after(this.$actions);
            }
            if(this.model.id) {
                var name = this.model.id,
                    content = this.model.get('content');
                if(content) {
                    name = content.Name || content.Title;
                }
                var thumbnail = '';
                // Validate thumbnailUrl as it could potentially have been modified and we want to protect against XSRF
                // (a GET shouldn't have side effects...but make sure we actually have a thumbnail url just in case)
                var re = new RegExp('^' + this.config.ensembleUrl.toLocaleLowerCase() + '\/app\/assets\/');
                if(content.ThumbnailUrl && re.test(content.ThumbnailUrl.toLocaleLowerCase())) {
                    thumbnail = '<div class="thumbnail">' + '  <img alt="Video thumbnail" src="' + content.ThumbnailUrl + '"/>' + '</div>';
                }
                html += thumbnail + '<div class="title">' + name + '</div>' + '<div class="ev-field-actions">' + '  <a href="#" class="action-choose" title="Change ' + label + '"><span>Change ' + label + '<span></a>' + '  <a href="#" class="action-preview" title="Preview: ' + name + '"><span>Preview: ' + name + '<span></a>' +
                // TODO - temporarily disabled playlist settings until it is implemented
                (this.model instanceof VideoSettings ? '    <a href="#" class="action-options" title="' + label + ' Embed Options"><span>' + label + ' Embed Options<span></a>' : '') + '  <a href="#" class="action-remove" title="Remove ' + label + '"><span>Remove ' + label + '<span></a>' + '</div>';
            } else {
                html += '<div class="title"><em>Add ' + (this.model instanceof VideoSettings ? 'video' : 'playlist') + '.</em></div>' + '<div class="ev-field-actions">' + '  <a href="#" class="action-choose" title="Choose ' + label + '"><span>Choose ' + label + '<span></a>' + '</div>';
            }
            this.$actions.html(html);
        }
    });

});
