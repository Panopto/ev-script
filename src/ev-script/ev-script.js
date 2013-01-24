/*global define*/
define(['backbone','lodash','jquery'], function(Backbone, _, $) {

    'use strict';

    var localBB = Backbone.noConflict();

    var VideoSettings = localBB.Model.extend({
        defaults: {
            type: 'video',
            showtitle: false,
            autoplay: false,
            showcaptions: false,
            hidecontrols: false,
            search: '',
            sourceId: 'content'
        }
    });

    var PlaylistSettings = localBB.Model.extend({
        defaults: {
            type: 'playlist'
        }
    });

    var EnsembleApp = function(appOptions) {

        appOptions = appOptions || {};

        var eventAggr = _.extend({}, localBB.Events),
            authId = appOptions.authId || 'ensemble',
            ensembleUrl = appOptions.ensembleUrl || '',
            authPath = appOptions.authPath || '',
            authDomain = appOptions.authDomain || '',
            urlCallback = appOptions.urlCallback || function(url) { return url; },
            pageSize = parseInt(appOptions.pageSize || 100, 10),
            videosCache = [],
            orgsCache = [],
            libsCache = [],
            playlistsCache = [];

        var cookieOptions = {
            path: authPath
        };

        var getUser = function() {
            return $.cookie(authId + '-user');
        };

        var setAuth = function(username, password) {
            username += (authDomain ? '@' + authDomain : '');
            $.cookie(authId + '-user', username, _.extend({}, cookieOptions));
            $.cookie(authId + '-pass', password, _.extend({}, cookieOptions));
            eventAggr.trigger('authSet');
        };

        var removeAuth = function() {
            $.cookie(authId + '-user', null, _.extend({}, cookieOptions));
            $.cookie(authId + '-pass', null, _.extend({}, cookieOptions));
            eventAggr.trigger('authRemoved');
        };

        var hasAuth = function() {
            return $.cookie(authId + '-user') && $.cookie(authId + '-pass');
        };

        var AuthView = localBB.View.extend({
            initialize: function(options) {
                this.submitCallback = options.submitCallback || function() {};
                var html =
                    '<div class="logo"></div>' +
                    '<form>' +
                    '  <fieldset>' +
                    '    <div class="fieldWrap">' +
                    '      <label for="username">Username</label>' +
                    '      <input id="username" name="username" class="form-text"type="text"/>' +
                    '    </div>' +
                    '    <div class="fieldWrap">' +
                    '      <label for="password">Password</label>' +
                    '      <input id="password" name="password" class="form-text"type="password"/>' +
                    '    </div>' +
                    '    <div class="form-actions">' +
                    '      <input type="submit" class="form-submit action-submit" value="Submit"/>' +
                    '    </div>' +
                    '  </fieldset>' +
                    '</form>';
                this.$dialog = $('<div class="ev-auth"></div>');
                this.$el.after(this.$dialog);
                this.$dialog.dialog({
                    title: 'Ensemble Video Login - ' + ensembleUrl,
                    modal: true,
                    draggable: false,
                    resizable: false,
                    width: 540,
                    height: 250,
                    dialogClass: 'ev-dialog',
                    create: _.bind(function(event, ui) {
                        this.$dialog.html(html);
                    }, this),
                    close: _.bind(function(event, ui) {
                        this.$dialog.dialog('destroy').remove();
                        eventAggr.trigger('hidePickers');
                    }, this)
                });
                $('form', this.$dialog).submit(_.bind(function(e) {
                    var $form = $(e.target);
                    var username = $('#username', $form).val();
                    var password = $('#password', $form).val();
                    if (username && password) {
                        setAuth(username, password);
                        this.$dialog.dialog('destroy').remove();
                        this.submitCallback();
                    }
                    e.preventDefault();
                }, this));
            }
        });

        var ajaxError = function(xhr, authCallback) {
            if (xhr.status === 401) {
                removeAuth();
                var auth = new AuthView({
                    el: this.el,
                    submitCallback: authCallback
                });
            } else if (xhr.status === 500) {
                window.alert('It appears there is an issue with the Ensemble Video installation.');
            } else {
                window.alert('An unexpected error occurred.  Check the server log for more details.');
            }
        };

        var VideoEncoding = localBB.Model.extend({
            idAttribute: 'videoID',
            url: function() {
                return ensembleUrl + '/app/api/content/show.json/' + this.get('fetchId');
            },
            getDims: function() {
                var dimsStrs = this.get('dimensions').split('x');
                var dims = [];
                dims[0] = parseInt(dimsStrs[0], 10);
                dims[1] = parseInt(dimsStrs[1], 10);
                return dims;
            },
            getRatio: function() {
                var dims = this.getDims();
                return dims[0] / dims[1];
            },
            getWidth: function() {
                return this.getDims()[0];
            },
            getHeight: function() {
                return this.getDims()[1];
            },
            parse: function(response) {
                return response.dataSet.encodings;
            }
        });

        var VideoEmbedView = localBB.View.extend({
            initialize: function(options) {
                // Width and height really should be set by now...but use a reasonable default if not
                var width = (this.model.get('width') ? this.model.get('width') : '640');
                var height = (this.model.get('height') ? this.model.get('height') : '360');
                var html =
                    '<iframe src="' +
                    ensembleUrl +
                    '/app/plugin/embed.aspx?ID=' + this.model.get('id') +
                    '&autoPlay=' + this.model.get('autoplay') + '&displayTitle=' +
                    this.model.get('showtitle') + '&hideControls=' +
                    this.model.get('hidecontrols') + '&showCaptions=' +
                    this.model.get('showcaptions') + '&width=' +
                    width + '&height=' + height +
                    '" frameborder="0" style="width:' +
                    width + 'px;height:' + (parseInt(height, 10) + 56) +
                    'px;" allowfullscreen></iframe>';
                this.$el.html(html);
            }
        });

        var PlaylistEmbedView = localBB.View.extend({
            initialize: function(options) {
                var html =
                    '<iframe src="' + ensembleUrl +
                    '/app/plugin/embed.aspx?DestinationID=' + this.model.get('id') +
                    '" frameborder="0" style="width:800px;height:850px;" allowfullscreen></iframe>';
                this.$el.html(html);
            }
        });

        var PreviewView = localBB.View.extend({
            initialize: function(options) {
                var $dialogWrap = $('<div class="dialogWrap"></div>');
                this.$el.after($dialogWrap);
                var content = this.model.get('content');
                var width = this.model.get('width');
                width = (width ? width : (this.model instanceof VideoSettings ? '640' : '800'));
                var height = this.model.get('height');
                height = (height ? height : (this.model instanceof VideoSettings ? '360' : '850'));
                $dialogWrap.dialog({
                    title: content.Title || content.Name,
                    modal: true,
                    width: (parseInt(width, 10) + 50),
                    height: (parseInt(height, 10) + 140),
                    draggable: false,
                    resizable: false,
                    dialogClass: 'ev-dialog',
                    create: _.bind(function(event, ui) {
                        var embedView = new this.embedClass({
                            model: this.model
                        });
                        $dialogWrap.html(embedView.$el);
                    },this),
                    close: function(event, ui) {
                        $dialogWrap.dialog('destroy').remove();
                    }
                });
            }
        });

        var VideoPreviewView = PreviewView.extend({
            embedClass: VideoEmbedView,
            initialize: function(options) {
                this.encoding = options.encoding || new VideoEncoding({
                    fetchId: this.model.id
                });
                var success = _.bind(function() {
                    if (!this.model.get('width') || !this.model.get('height')) {
                        this.model.set({
                            width: this.encoding.getWidth(),
                            height: this.encoding.getHeight()
                        });
                    }
                    PreviewView.prototype.initialize.call(this, options);
                }, this);
                if (this.encoding.isNew()) {
                    this.encoding.fetch({
                        dataType: 'jsonp',
                        success: success
                    });
                } else {
                    success();
                }
            }
        });

        var PlaylistPreviewView = PreviewView.extend({
            embedClass: PlaylistEmbedView
        });

        var SettingsView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'show', 'cancelHandler', 'submitHandler');
                this.field = options.field;
            },
            events: {
                'submit': 'submitHandler',
                'click input.action-cancel': 'cancelHandler'
            },
            show: function() {
                this.render();
                this.$el.dialog('open');
            },
            cancelHandler: function(e) {
                this.$el.dialog('close');
                e.preventDefault();
            },
            submitHandler: function(e) {
                this.updateModel();
                this.$el.dialog('close');
                e.preventDefault();
            },
            // Override me
            updateModel: function() {}
        });

        var VideoSettingsView = SettingsView.extend({
            initialize: function(options) {
                SettingsView.prototype.initialize.call(this, options);
                this.encoding = options.encoding;
                this.encoding.bind('change:id', _.bind(function() {
                    this.render();
                }, this));
            },
            updateModel: function() {
                var attrs = {
                    'showtitle': this.$('#showtitle').is(':checked'),
                    'autoplay': this.$('#autoplay').is(':checked'),
                    'showcaptions': this.$('#showcaptions').is(':checked'),
                    'hidecontrols': this.$('#hidecontrols').is(':checked')
                };
                var sizeVal = this.$('#size').val();
                if (sizeVal === 'original') {
                    // isNew signifies that the encoding hasn't been fetched yet
                    if (this.encoding && !this.encoding.isNew()) {
                        _.extend(attrs, {
                            width: this.encoding.getWidth(),
                            height: this.encoding.getHeight()
                        });
                    }
                } else {
                    var dims = sizeVal.split('x');
                    _.extend(attrs, {
                        width: parseInt(dims[0], 10),
                        height: parseInt(dims[1], 10)
                    });
                }
                this.field.model.set(attrs);
            },
            getSizeSelect: function() {
                var width = this.field.model.get('width');
                var height = this.field.model.get('height');
                var ratio = 16 / 9;
                var options = ['1280x720', '1024x576', '848x480', '720x405', '640x360', '610x344', '560x315', '480x270', '400x225', '320x180', '240x135', '160x90'];
                if (width && height) {
                    ratio = width / height;
                } else if (this.encoding.id) {
                    width = this.encoding.getWidth();
                    height = this.encoding.getHeight();
                    ratio = this.encoding.getRatio();
                }
                // Use a fuzz factor to determine ratio equality since our sizes are not always accurate
                if (Math.ceil(ratio * 10) / 10 === Math.ceil((4 / 3) * 10) / 10) {
                    options = ['1280x960', '1024x770', '848x636', '720x540', '640x480', '610x460', '560x420', '480x360', '400x300', '320x240', '240x180', '160x120'];
                }
                var size = width + 'x' + height;
                var html =
                    '<select class="form-select" id="size" name="size">' +
                    '<option value="original">Original</option>';
                _.each(options, function(option) {
                    html += '<option value="' + option + '"' + (option === size ? ' selected="selected"' : '') + '>' + option + '</option>';
                });
                html += '</select>';
                return html;
            },
            render: function() {
                var html =
                    '<form>' +
                    '  <fieldset>' +
                    '    <div class="fieldWrap">' +
                    '      <label for="size">Size</label>' + this.getSizeSelect() +
                    '    </div>' +
                    '    <div class="fieldWrap">' +
                    '      <label for="showtitle">Show Title</label>' +
                    '      <input id="showtitle" class="form-checkbox" ' + (this.field.model.get('showtitle') ? 'checked="checked"' : '') + ' name="showtitle" type="checkbox"/>' +
                    '    </div>' +
                    '    <div class="fieldWrap">' +
                    '      <label for="autoplay">Auto Play</label>' +
                    '      <input id="autoplay" class="form-checkbox" ' + (this.field.model.get('autoplay') ? 'checked="checked"' : '') + ' name="autoplay" type="checkbox"/>' +
                    '    </div>' +
                    '    <div class="fieldWrap">' +
                    '      <label for="showcaptions">Show Captions</label>' +
                    '      <input id="showcaptions" class="form-checkbox" ' + (this.field.model.get('showcaptions') ? 'checked="checked"' : '') + ' name="showcaptions" type="checkbox"/>' +
                    '    </div>' +
                    '    <div class="fieldWrap">' +
                    '      <label for="hidecontrols">Hide Controls</label>' +
                    '      <input id="hidecontrols" class="form-checkbox" ' + (this.field.model.get('hidecontrols') ? 'checked="checked"' : '') + ' name="hidecontrols" type="checkbox"/>' +
                    '    </div>' +
                    '    <div class="form-actions">' +
                    '      <input type="button" class="form-submit action-cancel" value="Cancel"/>' +
                    '      <input type="submit" class="form-submit action-submit" value="Submit"/>' +
                    '    </div>' +
                    '  </fieldset>' +
                    '</form>';
                this.$el.html(html).dialog({
                    title: this.field.model.get('content').Title,
                    modal: true,
                    autoOpen: false,
                    draggable: false,
                    resizable: false,
                    dialogClass: 'ev-dialog',
                    width: 340,
                    height: 320
                });
            }
        });

        var PlaylistSettingsView = SettingsView.extend({
            initialize: function(options) {
                SettingsView.prototype.initialize.call(this, options);
            },
            render: function() {
                var html =
                    // TODO
                    '<h3>TODO</h3>' + JSON.stringify(this.field.model.toJSON());
                this.$el.html(html);
                this.$el.dialog({
                    title: 'Playlist Embed Settings',
                    modal: true,
                    autoOpen: false,
                    dialogClass: 'ev-dialog'
                });
            }
        });

        var HiderView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'hideHandler', 'logoutHandler', 'render');
                this.picker = options.picker;
                eventAggr.bind('authSet', this.render);
                eventAggr.bind('authRemoved', this.render);
            },
            events: {
                'click a.action-hide': 'hideHandler',
                'click a.action-logout': 'logoutHandler'
            },
            render: function() {
                var html =
                    '<a class="action-hide" href="#" title="Hide Picker">Hide</a>' +
                    (hasAuth() ? '<a class="action-logout" href="#" title="Logout">Logout</a>' : '');
                this.$el.html(html);
            },
            hideHandler: function(e) {
                this.picker.hidePicker();
                e.preventDefault();
            },
            logoutHandler: function(e) {
                removeAuth();
                e.preventDefault();
            }
        });

        var SearchView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'searchHandler', 'doSearch', 'autoSearch');
                this.picker = options.picker;
            },
            events: {
                'click input.form-submit': 'searchHandler',
                'change select.source': 'searchHandler',
                'keyup input.form-text': 'autoSearch'
            },
            render: function() {
                var id = this.id + '-input';
                var html =
                    '<label for="' + id + '">Search Ensemble:</label>' +
                    '<input id="' + id + '" type="text" class="form-text" value="' + this.picker.model.get('search') + '" />' +
                    '<select class="form-select source">' +
                    '  <option value="content" ' + (this.picker.model.get('sourceId') === 'content' ? 'selected="selected"' : '') + '>Media Library</option>' +
                    '  <option value="shared" ' + (this.picker.model.get('sourceId') === 'shared' ? 'selected="selected"' : '') + '>Shared Library</option>' +
                    '</select>' +
                    '<input type="button" value="Go" class="form-submit" />' +
                    '<div class="loader"></div>' +
                    '<div class="ev-poweredby"><a tabindex="-1" target="_blank" href="http://ensemblevideo.com"><span>Powered by Ensemble</span></a></div>';
                this.$el.html(html);
                var $loader = this.$('div.loader');
                $loader.bind('ajaxSend', _.bind(function(e, xhr, settings) {
                    if (this.picker === settings.picker) {
                        $loader.addClass('loading');
                    }
                }, this)).bind('ajaxComplete', _.bind(function(e, xhr, settings) {
                    if (this.picker === settings.picker) {
                        $loader.removeClass('loading');
                    }
                }, this));
            },
            doSearch: function() {
                this.picker.model.set({
                    search: this.$('input.form-text').val(),
                    sourceId: this.$('select.source').val()
                });
                this.picker.loadVideos();
            },
            searchHandler: function(e) {
                this.doSearch();
                e.preventDefault();
            },
            autoSearch: function(e) {
                var value = e.target.value;
                if (value !== this.lastValue) {
                    this.lastValue = value;
                    if (this.submitTimeout) {
                        clearTimeout(this.submitTimeout);
                    }
                    this.submitTimeout = setTimeout(_.bind(function() {
                        this.doSearch();
                    }, this), 1000);
                }
            }
        });

        /*
         * Base object for result views since video and playlist results are rendered differently
         */
        var ResultsView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'render', 'loadMore', 'addHandler', 'previewItem');
                this.picker = options.picker;
                this.$results = $('<div class="results"/>');
                this.$el.append(this.$results);
            },
            events: {
                'click a.action-preview': 'previewItem'
            },
            previewItem: function(e) {
                var element = e.currentTarget;
                var id = $(element).attr('rel');
                var item = this.collection.get(id);
                var settings = {
                        id: id,
                        content: item.toJSON()
                };
                var previewView = new this.previewClass({
                    el: element,
                    model: new this.modelClass(settings)
                });
                // Stop event propagation so we don't trigger preview of stored field item as well
                e.stopPropagation();
                e.preventDefault();
            },
            loadMore: function() {
                if (this.collection.hasMore) {
                    this.collection.fetch({
                        // This needs to be synchronous so it blocks additional scrolling during load.
                        // FIXME - add a loading indicator?
                        // TODO - move to deferred once a more recent version of jQuery is available?  The loading triggered at the bottom
                        // is choppy.  It'd be nice to trigger a non-blocking load after scrolling down some portion of the results.
                        async: false,
                        add: true,
                        picker: this.picker,
                        success: _.bind(function(collection, response, options) {
                            if (_.size(response.Data) < collection.pageSize) {
                                collection.hasMore = false;
                                this.$scrollLoader.evScrollLoader('hideLoader');
                            } else {
                                collection.hasMore = true;
                                collection.pageIndex += 1;
                            }
                        }, this),
                        error: _.bind(function(collection, xhr, options) {
                            _.bind(ajaxError, this)(xhr, _.bind(function() {
                                this.loadMore();
                            }, this));
                        }, this)
                    });
                }
            },
            addHandler: function(item, collection, options) {
                var row = this.getRowHtml(item, options.index);
                this.$('table.content-list > tbody').append(row);
            }
        });

        var VideoResultsView = ResultsView.extend({
            modelClass: VideoSettings,
            previewClass: VideoPreviewView,
            initialize: function(options) {
                ResultsView.prototype.initialize.call(this, options);
            },
            getRowHtml: function(item, index) {
                var $row = $('<tr class="' + (index % 2 ? 'odd' : 'even') + '"/>');
                var content =
                    '<table class="content-item">' +
                    '  <tbody>' +
                    '    <tr class="title">' +
                    '      <td colspan="2">' +
                    '        <a class="action-preview" title="Preview: ' + item.get('Title') + '" href="#" rel="' + item.get('ID') + '">' + item.get('Title') + '</a>' +
                    '      </td>' +
                    '    </tr>' +
                    '    <tr class="desc"><td class="label">Description</td><td class="value">' + item.get('Description') + '</td></tr>' +
                    '    <tr><td class="label">Date Added</td><td class="value">' + new Date(item.get('AddedOn')).toLocaleString() + '</td></tr>' +
                    '    <tr><td class="label">Keywords</td><td class="value">' + item.get('Keywords') + '</td></tr>' +
                    '    <tr><td class="label">Library</td><td class="value">' + item.get('LibraryName') + '</td></tr>' +
                    '  </tbody>' +
                    '</table>';
                var rowHtml =
                    '    <td class="content-actions">' +
                    '      <img src="' + item.get('ThumbnailUrl').replace(/width=100/, 'width=150') + '" alt="' + item.get('Title') + ' thumbnail image"/>' +
                    '      <div class="action-links">' +
                    '        <a class="action-add" href="#" title="Choose ' + item.get('Title') + '" rel="' + item.get('ID') + '"><span>Choose</span></a>' +
                    '        <a class="action-preview" href="#" title="Preview: ' + item.get('Title') + '" rel="' + item.get('ID') + '"><span>Preview: ' + item.get('Title') + '</span></a>' +
                    '      </div>' +
                    '    </td>' +
                    '    <td class="content-meta">' + content + '</td>';
                $row.html(rowHtml);
                // Handle truncation (more/less) of description text
                $('tr.desc td.value', $row).each(function(element) {
                    var $this = $(this), $full, $short, truncLen = 100, fullDesc = $(this).html();
                    if (fullDesc.length > truncLen) {
                        $this.empty();
                        $full = $('<span>' + fullDesc + '</span>');
                        $short = $('<span>' + fullDesc.substring(0, truncLen) + '...</span>');
                        var $shorten = $('<a href="#">Less</a>').click(function(e) {
                            $full.hide();
                            $short.show();
                            e.preventDefault();
                        });
                        var $expand = $('<a href="#">More</a>').click(function(e) {
                            $short.hide();
                            $full.show();
                            e.preventDefault();
                        });
                        $full.hide().append($shorten);
                        $short.append($expand);
                        $this.append($short).append($full);
                    }
                });
                return $row;
            },
            render: function() {
                var $table = $('<table class="content-list"/>');
                var $tbody = $('<tbody/>').appendTo($table);
                if (this.collection.size() > 0) {
                    this.collection.each(function(item, index) {
                        $tbody.append(this.getRowHtml(item, index));
                    }, this);
                } else {
                    $tbody.append('<tr class="odd"><td colspan="2">No results available.</td></tr>');
                }
                this.$results.html($table);
                this.$results.prepend('<div class="total">Search returned ' + this.collection.totalResults + ' results.</div>');
                // Only scroll if we have a full page or our results size is long enough
                if (this.collection.size() >= pageSize || $table[0].scrollHeight > 600) {
                    this.$scrollLoader = $table.evScrollLoader({
                        height: 600,
                        callback: this.loadMore
                    });
                }
                this.collection.bind('add', this.addHandler);
            }
        });

        var PlaylistResultsView = ResultsView.extend({
            modelClass: PlaylistSettings,
            previewClass: PlaylistPreviewView,
            initialize: function(options) {
                ResultsView.prototype.initialize.call(this, options);
            },
            getRowHtml: function(item, index) {
                var html =
                    '  <tr class="' + (index % 2 ? 'odd' : 'even') + '">' +
                    '    <td class="content-actions">' +
                    '      <div class="action-links">' +
                    '        <a class="action-add" href="#" title="Choose ' + item.get('Name') + '" rel="' + item.get('ID') + '"><span>Choose</span></a>' +
                    '        <a class="action-preview" href="#" title="Preview: ' + item.get('Name') + '" rel="' + item.get('ID') + '"><span>Preview: ' + item.get('Name') + '</span></a>' +
                    '      </div>' +
                    '    </td>' +
                    '    <td class="content-meta">' +
                    '      <span>' + item.get('Name') + '</span>' +
                    '    </td>' +
                    '  </tr>';
                return html;
            },
            render: function() {
                var $table = $('<table class="content-list"/>');
                var $tbody = $('<tbody/>').appendTo($table);
                var rows = '';
                if (this.collection.size() > 0) {
                    this.collection.each(function(item, index) {
                        rows += this.getRowHtml(item, index);
                    }, this);
                } else {
                    rows +=
                        '  <tr class="odd"><td colspan="2">No results available.</td></tr>';
                }
                $tbody.append(rows);
                this.$results.html($table);
                this.$results.prepend('<div class="total">Search returned ' + this.collection.totalResults + ' results.</div>');
                if (this.collection.size() >= pageSize || $table[0].scrollHeight > 600) {
                    this.$scrollLoader = $table.evScrollLoader({
                        height: 600,
                        callback: this.loadMore
                    });
                }
                this.collection.bind('add', this.addHandler);
            }
        });

        /*
         * Encapsulates views to manage search, display and selection of Ensemble videos and playlists.
         */
        var PickerView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'chooseItem', 'hidePicker', 'showPicker', 'hideHandler');
                eventAggr.bind('hidePickers', this.hideHandler);
                this.$el.hide();
                this.field = options.field;
                this.hider = new HiderView({
                    id: this.id + '-hider',
                    tagName: 'div',
                    className: 'ev-hider',
                    picker: this
                });
                this.$el.append(this.hider.$el);
                this.hider.render();
            },
            events: {
                'click a.action-add': 'chooseItem'
            },
            chooseItem: function(e) {
                var id = $(e.target).attr('rel');
                var content = this.resultsView.collection.get(id);
                this.model.set({
                    id: id,
                    content: content.toJSON()
                });
                this.field.model.set(this.model.attributes);
                this.hidePicker();
                e.preventDefault();
            },
            hidePicker: function() {
                this.$el.fadeOut('fast');
            },
            showPicker: function() {
                // In case our authentication status has changed...re-render our hider
                this.hider.render();
                this.$el.fadeIn('fast');
            },
            hideHandler: function(picker) {
                if (!picker || (this !== picker)) {
                    this.hidePicker();
                }
            }
        });

        var BaseCollection = localBB.Collection.extend({
            model: localBB.Model.extend({
                idAttribute: 'ID'
            }),
            parse: function(response) {
                return response.Data;
            }
        });

        var Videos = BaseCollection.extend({
            initialize: function(models, options) {
                this.filterOn = options.filterOn;
                this.filterValue = options.filterValue;
                this.sourceUrl = options.sourceUrl;
                this.pageSize = pageSize;
                this.pageIndex = 1;
                this.hasMore = true;
            },
            url: function() {
                var api_url = ensembleUrl + this.sourceUrl;
                var sizeParam = 'PageSize=' + this.pageSize;
                var indexParam = 'PageIndex=' + this.pageIndex;
                var onParam = 'FilterOn=' + encodeURIComponent(this.filterOn);
                var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
                var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
                return urlCallback(url);
            }
        });

        var VideoPickerView = PickerView.extend({
            initialize: function(options) {
                PickerView.prototype.initialize.call(this, options);
                _.bindAll(this, 'loadVideos');
                this.searchView = new SearchView({
                    id: this.id + '-search',
                    tagName: 'div',
                    className: 'ev-search',
                    picker: this
                });
                this.$el.append(this.searchView.$el);
                this.searchView.render();
                this.resultsView = new VideoResultsView({
                    id: this.id + '-results',
                    tagName: 'div',
                    className: 'ev-results clearfix',
                    picker: this
                });
                this.$el.append(this.resultsView.$el);
            },
            showPicker: function() {
                PickerView.prototype.showPicker.call(this);
                this.searchView.$('input[type="text"]').focus();
                this.loadVideos();
            },
            loadVideos: function() {
                var searchVal = $.trim(this.model.get('search').toLowerCase());
                var sourceId = this.model.get('sourceId');
                var sourceUrl = sourceId === 'content' ? '/api/Content' : '/api/SharedContent';
                var videos = videosCache[getUser() + sourceId + searchVal];
                if (!videos) {
                    videos = new Videos({}, {
                        sourceUrl: sourceUrl,
                        filterOn: '',
                        filterValue: searchVal
                    });
                    videos.fetch({
                        picker: this,
                        success: _.bind(function(collection, response, options) {
                            var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                            var size = _.size(response.Data);
                            if (size === totalRecords) {
                                collection.hasMore = false;
                            } else {
                                collection.hasMore = true;
                                collection.pageIndex += 1;
                            }
                            videosCache[getUser() + sourceId + searchVal] = collection;
                            this.resultsView.collection = collection;
                            this.resultsView.render();
                        }, this),
                        error: _.bind(function(collection, xhr, options) {
                            _.bind(ajaxError, this)(xhr, _.bind(function() {
                                this.loadVideos();
                            }, this));
                        }, this)
                    });
                } else {
                    this.resultsView.collection = videos;
                    this.resultsView.render();
                }
            }
        });

        var Organizations = BaseCollection.extend({
            url: function() {
                var api_url = ensembleUrl + '/api/Organizations';
                // Make this arbitrarily large so we can retrieve ALL orgs in a single request
                var sizeParam = 'PageSize=9999';
                var indexParam = 'PageIndex=1';
                var url = api_url + '?' + sizeParam + '&' + indexParam;
                return urlCallback(url);
            }
        });

        var Libraries = BaseCollection.extend({
            initialize: function(models, options) {
                this.filterValue = options.organizationId;
            },
            url: function() {
                var api_url = ensembleUrl + '/api/Libraries';
                // Make this arbitrarily large so we can retrieve ALL libraries under an org in a single request
                var sizeParam = 'PageSize=9999';
                var indexParam = 'PageIndex=1';
                var onParam = 'FilterOn=OrganizationId';
                var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
                var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
                return urlCallback(url);
            }
        });

        var Playlists = BaseCollection.extend({
            initialize: function(models, options) {
                this.filterValue = options.filterValue;
                this.pageSize = pageSize;
                this.pageIndex = 1;
                this.hasMore = true;
            },
            url: function() {
                var api_url = ensembleUrl + '/api/Playlists';
                var sizeParam = 'PageSize=' + this.pageSize;
                var indexParam = 'PageIndex=' + this.pageIndex;
                var onParam = 'FilterOn=LibraryId';
                var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
                var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
                return urlCallback(url);
            }
        });

        var OrganizationSelectView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'render');
                this.picker = options.picker;
                this.$el.html('<option value="-1">Loading...</option>');
                this.collection.bind('reset', this.render);
            },
            render: function() {
                this.$el.html('');
                this.collection.each(function(org) {
                    var selected = (this.picker.model.get('organizationId') === org.id ? 'selected="selected"' : '');
                    this.$el.append('<option value="' + org.id + '" ' + selected + '>' + org.get('Name') + '</option>');
                }, this);
                if (this.collection.size() === 1) {
                    this.$el.hide();
                } else {
                    this.$el.show();
                }
                this.$el.trigger('change');
            }
        });

        var LibrarySelectView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'render');
                this.picker = options.picker;
                this.$el.html('<option value="-1">Loading...</option>');
                this.collection.bind('reset', this.render);
            },
            render: function() {
                this.$el.html('');
                this.collection.each(function(lib) {
                    var selected = (this.picker.model.get('libraryId') === lib.id ? 'selected="selected"' : '');
                    this.$el.append('<option value="' + lib.id + '" ' + selected + '>' + lib.get('Name') + '</option>');
                }, this);
                this.$el.trigger('change');
            }
        });

        var PlaylistSelectView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization', 'changeLibrary', 'handleSubmit');
                this.picker = options.picker;
                this.id = options.id;
                var orgSelectId = this.id + '-org-select';
                this.$el.append('<label for="' + orgSelectId + '">Organization:</label>');
                this.orgSelect = new OrganizationSelectView({
                    id: orgSelectId,
                    tagName: 'select',
                    className: 'form-select organizations',
                    picker: this.picker,
                    collection: new Organizations({}, {})
                });
                this.$el.append(this.orgSelect.$el);
                var libSelectId = this.id + '-lib-select';
                this.$el.append('<label for="' + libSelectId + '">Library:</label>');
                this.libSelect = new LibrarySelectView({
                    id: libSelectId,
                    tagName: 'select',
                    className: 'form-select libraries',
                    picker: this.picker,
                    collection: new Libraries({}, {})
                });
                this.$el.append(this.libSelect.$el);
                var html =
                    '<input type="button" value="Go" class="form-submit" />' +
                    '<div class="loader"></div>' +
                    '<div class="ev-poweredby"><a tabindex="-1" target="_blank" href="http://ensemblevideo.com"><span>Powered by Ensemble</span></a></div>';
                this.$el.append(html);
                var $loader = this.$('div.loader');
                $loader.bind('ajaxSend', _.bind(function(e, xhr, settings) {
                    if (this.picker === settings.picker) {
                        $loader.addClass('loading');
                    }
                }, this)).bind('ajaxComplete', _.bind(function(e, xhr, settings) {
                    if (this.picker === settings.picker) {
                        $loader.removeClass('loading');
                    }
                }, this));
            },
            events: {
                'change select.organizations': 'changeOrganization',
                'change select.libraries': 'changeLibrary',
                'click input.form-submit': 'handleSubmit'
            },
            changeOrganization: function(e) {
                this.picker.model.set({
                    organizationId: e.target.value
                });
                this.loadLibraries();
            },
            changeLibrary: function(e) {
                this.picker.model.set({
                    libraryId: e.target.value
                });
                this.picker.loadPlaylists();
            },
            handleSubmit: function(e) {
                this.picker.loadPlaylists();
                e.preventDefault();
            },
            loadOrgs: function() {
                var orgs = orgsCache[getUser()];
                if (!orgs) {
                    orgs = new Organizations({}, {});
                    orgs.fetch({
                        picker: this.picker,
                        success: _.bind(function(collection, response, options) {
                            orgsCache[getUser()] = collection;
                            this.orgSelect.collection.reset(collection.models);
                        }, this),
                        error: _.bind(function(collection, xhr, options) {
                            _.bind(ajaxError, this)(xhr, _.bind(function() {
                                this.loadOrgs();
                            }, this));
                        }, this)
                    });
                } else {
                    this.orgSelect.collection.reset(orgs.models);
                }
            },
            loadLibraries: function() {
                var orgId = this.picker.model.get('organizationId');
                var libs = libsCache[getUser() + orgId];
                if (!libs) {
                    libs = new Libraries({}, {
                        organizationId: orgId
                    });
                    libs.fetch({
                        picker: this.picker,
                        success: _.bind(function(collection, response, options) {
                            libsCache[getUser() + orgId] = collection;
                            this.libSelect.collection.reset(collection.models);
                        }, this),
                        error: _.bind(function(collection, xhr, options) {
                            _.bind(ajaxError, this)(xhr, _.bind(function() {
                                this.loadLibraries();
                            }, this));
                        }, this)
                    });
                } else {
                    this.libSelect.collection.reset(libs.models);
                }
            }
        });

        var PlaylistPickerView = PickerView.extend({
            initialize: function(options) {
                PickerView.prototype.initialize.call(this, options);
                _.bindAll(this, 'loadPlaylists');
                this.playlistSelect = new PlaylistSelectView({
                    id: this.id + '-playlist-select',
                    tagName: 'div',
                    className: 'ev-playlist-select',
                    picker: this
                });
                this.$el.append(this.playlistSelect.$el);
                this.resultsView = new PlaylistResultsView({
                    id: this.id + '-results',
                    tagName: 'div',
                    className: 'ev-results clearfix',
                    picker: this
                });
                this.$el.append(this.resultsView.$el);
            },
            showPicker: function() {
                PickerView.prototype.showPicker.call(this);
                this.playlistSelect.loadOrgs();
                this.playlistSelect.$('select').filter(':visible').first().focus();
            },
            loadPlaylists: function() {
                var libraryId = this.model.get('libraryId');
                var playlists = playlistsCache[getUser() + libraryId];
                if (!playlists) {
                    playlists = new Playlists({}, {
                        filterValue: libraryId
                    });
                    playlists.fetch({
                        picker: this,
                        success: _.bind(function(collection, response, options) {
                            var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                            var size = _.size(response.Data);
                            if (size === totalRecords) {
                                collection.hasMore = false;
                            } else {
                                collection.hasMore = true;
                                collection.pageIndex += 1;
                            }
                            playlistsCache[getUser() + libraryId] = collection;
                            this.resultsView.collection = collection;
                            this.resultsView.render();
                        }, this),
                        error: _.bind(function(collection, xhr, options) {
                            _.bind(ajaxError, this)(xhr, _.bind(function() {
                                this.loadPlaylists();
                            }, this));
                        }, this)
                    });
                } else {
                    this.resultsView.collection = playlists;
                    this.resultsView.render();
                }
            }
        });

        /*
         * View for our field (element that we set with the selected content identifier)
         */
        var FieldView = localBB.View.extend({
            initialize: function(options) {
                _.bindAll(this, 'chooseHandler', 'optionsHandler', 'removeHandler', 'previewHandler');
                this.$field = options.$field;
                var pickerOptions = {
                        id: this.id + '-picker',
                        tagName: 'div',
                        className: 'ev-' + this.model.get('type') + '-picker',
                        field: this
                };
                var settingsOptions = {
                        id: this.id + '-settings',
                        tagName: 'div',
                        className: 'ev-settings',
                        field: this
                };
                if (this.model instanceof VideoSettings) {
                    this.modelClass = VideoSettings;
                    this.pickerClass = VideoPickerView;
                    this.settingsClass = VideoSettingsView;
                    this.previewClass = VideoPreviewView;
                    this.encoding = new VideoEncoding({});
                    if (!this.model.isNew()) {
                        this.encoding.set({ fetchId: this.model.id });
                        this.encoding.fetch({
                            dataType: 'jsonp'
                        });
                    }
                    this.model.bind('change:id', _.bind(function() {
                        // Only fetch encoding if identifier is set
                        if (this.model.id) {
                            this.encoding.set({ fetchId: this.model.id });
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
                    _.extend(settingsOptions, { encoding: this.encoding });
                } else if (this.model instanceof PlaylistSettings) {
                    this.modelClass = PlaylistSettings;
                    this.pickerClass = PlaylistPickerView;
                    this.settingsClass = PlaylistSettingsView;
                    this.previewClass = PlaylistPreviewView;
                }
                this.picker = new this.pickerClass(_.extend({}, pickerOptions, {
                    // We don't want to modify field model until we actually pick a new video...so use a copy as our current model
                    model: new this.modelClass(this.model.toJSON())
                }));
                this.settings = new this.settingsClass(settingsOptions);
                this.$field.after(this.picker.$el);
                this.renderActions();
                this.model.bind('change', _.bind(function() {
                    if (!this.model.isNew()) {
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
                eventAggr.trigger('hidePickers', this);
                if (this.picker.$el.is(':hidden')) {
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
                this.model.set(this.model.defaults, { silent: true });
                this.renderActions();
                e.preventDefault();
            },
            previewHandler: function(e) {
                var element = e.currentTarget;
                var previewView = new this.previewClass({
                    el: element,
                    encoding: this.encoding,
                    model: this.model
                });
                e.preventDefault();
            },
            renderActions: function() {
                var html = '<div class="logo"><a target="_blank" href="' + ensembleUrl + '"><span>Ensemble Logo</span></a></div>';
                var label = (this.model instanceof VideoSettings) ? 'Video' : 'Playlist';
                if (!this.$actions) {
                    this.$actions = $('<div class="ev-field"/>');
                    this.$field.after(this.$actions);
                }
                if (this.model.id) {
                    var name = this.model.id, content = this.model.get('content');
                    if (content) {
                        name = content.Name || content.Title;
                    }
                    var thumbnail = '';
                    // Validate thumbnailUrl as it could potentially have been modified and we want to protect against XSRF
                    // (a GET shouldn't have side effects...but make sure we actually have a thumbnail url just in case)
                    var re = new RegExp('^' + ensembleUrl.toLocaleLowerCase() + '\/app\/assets\/');
                    if (content.ThumbnailUrl && re.test(content.ThumbnailUrl.toLocaleLowerCase())) {
                        thumbnail =
                            '<div class="thumbnail">' +
                            '  <img alt="Video thumbnail" src="' + content.ThumbnailUrl + '"/>' +
                            '</div>';
                    }
                    html +=
                        thumbnail +
                        '<div class="title">' + name + '</div>' +
                        '<div class="ev-field-actions">' +
                        '  <a href="#" class="action-choose" title="Change ' + label + '"><span>Change ' + label + '<span></a>' +
                        '  <a href="#" class="action-preview" title="Preview: ' + name + '"><span>Preview: ' + name + '<span></a>' +
                        // TODO - temporarily disabled playlist settings until it is implemented
                        (this.model instanceof VideoSettings ? '    <a href="#" class="action-options" title="' + label + ' Embed Options"><span>' + label + ' Embed Options<span></a>' : '') +
                        '  <a href="#" class="action-remove" title="Remove ' + label + '"><span>Remove ' + label + '<span></a>' +
                        '</div>';
                } else {
                    html +=
                        '<div class="title"><em>Add ' + (this.model instanceof VideoSettings ? 'video' : 'playlist') + '.</em></div>' +
                        '<div class="ev-field-actions">' +
                        '  <a href="#" class="action-choose" title="Choose ' + label + '"><span>Choose ' + label + '<span></a>' +
                        '</div>';
                }
                this.$actions.html(html);
            }
        });

        this.handleField = function(fieldWrap, settingsModel, fieldSelector) {
            var $field = $(fieldSelector, fieldWrap);
            var fieldView = new FieldView({
                id: fieldWrap.id,
                el: fieldWrap,
                model: settingsModel,
                $field: $field
            });
        };

        this.handleEmbed = function(embedWrap, settingsModel) {
            if (settingsModel instanceof VideoSettings) {
                var videoEmbed = new VideoEmbedView({
                    el: embedWrap,
                    model: settingsModel
                });
            } else {
                var playlistEmbed = new PlaylistEmbedView({
                    el: embedWrap,
                    model: settingsModel
                });
            }
        };

    };

    return {
        VideoSettings: VideoSettings,
        PlaylistSettings: PlaylistSettings,
        EnsembleApp: EnsembleApp
    };

});
