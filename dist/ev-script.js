/**
 * ev-script 0.1.0 2013-01-26
 * Ensemble Video Integration Library
 * https://github.com/jmpease/ev-script
 * Copyright (c) 2013 Symphony Video, Inc.
 * Licensed MIT, GPL-2.0
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['jquery', 'underscore', 'backbone'], factory);
    } else {
        // Browser globals
        root.EV = factory(root.$, root._, root.Backbone);
    }
}(this, function ($, _, Backbone) {

/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/*global define*/
define('ev-script/models/video-settings',['backbone'], function(Backbone) {

  

  return Backbone.Model.extend({
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
});

/*global define*/
define('ev-script/models/playlist-settings',['backbone'], function(Backbone) {

    

    return Backbone.Model.extend({
        defaults: {
            type: 'playlist'
        }
    });
});

/*global define*/
define('ev-script/views/hider',['require','underscore','backbone'],function(require) {

    

    var _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'hideHandler', 'logoutHandler', 'render');
            this.picker = options.picker;
            this.app = options.app;
            this.app.eventAggr.bind('authSet', this.render);
            this.app.eventAggr.bind('authRemoved', this.render);
        },
        events: {
            'click a.action-hide': 'hideHandler',
            'click a.action-logout': 'logoutHandler'
        },
        render: function() {
            var html = '<a class="action-hide" href="#" title="Hide Picker">Hide</a>' + (this.app.auth.hasAuth() ? '<a class="action-logout" href="#" title="Logout">Logout</a>' : '');
            this.$el.html(html);
        },
        hideHandler: function(e) {
            this.picker.hidePicker();
            e.preventDefault();
        },
        logoutHandler: function(e) {
            this.app.auth.removeAuth();
            e.preventDefault();
        }
    });

});

/*global define*/
define('ev-script/views/picker',['require','jquery','underscore','backbone','ev-script/views/hider'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        HiderView = require('ev-script/views/hider');

    /*
     * Encapsulates views to manage search, display and selection of Ensemble videos and playlists.
     */
    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'chooseItem', 'hidePicker', 'showPicker', 'hideHandler');
            this.$el.hide();
            this.app = options.app;
            this.field = options.field;
            this.app.eventAggr.bind('hidePickers', this.hideHandler);
            this.hider = new HiderView({
                id: this.id + '-hider',
                tagName: 'div',
                className: 'ev-hider',
                picker: this,
                app: this.app
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
            if(!picker || (this !== picker)) {
                this.hidePicker();
            }
        }
    });

});

/*global define*/
define('ev-script/views/search',['require','underscore','backbone'],function(require) {

    

    var _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'searchHandler', 'doSearch', 'autoSearch');
            this.picker = options.picker;
            this.app = options.app;
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

});

/*global define*/
define('ev-script/views/results',['require','jquery','underscore','backbone'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

    /*
     * Base object for result views since video and playlist results are rendered differently
     */
    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'render', 'loadMore', 'addHandler', 'previewItem');
            this.picker = options.picker;
            this.$results = $('<div class="results"/>');
            this.$el.append(this.$results);
            this.app = options.app;
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
                content: item.toJSON(),
                app: this.app
            };
            var previewView = new this.previewClass({
                el: element,
                model: new this.modelClass(settings),
                app: this.app
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
                        this.app.auth.ajaxError(xhr, _.bind(function() {
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

});

/*global define*/
define('ev-script/views/preview',['require','jquery','underscore','backbone','ev-script/models/video-settings'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        VideoSettings = require('ev-script/models/video-settings');

    return Backbone.View.extend({
        initialize: function(options) {
            this.app = options.app;
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
                        model: this.model,
                        app: this.app
                    });
                    $dialogWrap.html(embedView.$el);
                }, this),
                close: function(event, ui) {
                    $dialogWrap.dialog('destroy').remove();
                }
            });
        }
    });

});

/*global define*/
define('ev-script/views/video-embed',['require','backbone'],function(require) {

    

    var Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            this.app = options.app;
            // Width and height really should be set by now...but use a reasonable default if not
            var width = (this.model.get('width') ? this.model.get('width') : '640');
            var height = (this.model.get('height') ? this.model.get('height') : '360');
            var html =
                '<iframe src="' +
                this.app.config.ensembleUrl +
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

});

/*global define*/
define('ev-script/models/video-encoding',['require','backbone'],function(require) {

    

    var Backbone = require('backbone');

    return Backbone.Model.extend({
        idAttribute: 'videoID',
        initialize: function(attributes, options) {
            this.app = options.app;
        },
        url: function() {
            return this.app.config.ensembleUrl + '/app/api/content/show.json/' + this.get('fetchId');
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

});

/*global define*/
define('ev-script/views/video-preview',['require','underscore','ev-script/views/preview','ev-script/views/video-embed','ev-script/models/video-encoding'],function(require) {

    

    var _ = require('underscore'),
        PreviewView = require('ev-script/views/preview'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        VideoEncoding = require('ev-script/models/video-encoding');

    return PreviewView.extend({
        embedClass: VideoEmbedView,
        initialize: function(options) {
            this.app = options.app;
            this.encoding = options.encoding || new VideoEncoding({
                fetchId: this.model.id
            }, {
                app: this.app
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

});

/*global define*/
define('ev-script/views/video-results',['require','jquery','underscore','ev-script/views/results','ev-script/models/video-settings','ev-script/views/video-preview'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        ResultsView = require('ev-script/views/results'),
        VideoSettings = require('ev-script/models/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview');

    return ResultsView.extend({
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
            if (this.collection.size() >= this.app.config.pageSize || $table[0].scrollHeight > 600) {
                this.$scrollLoader = $table.evScrollLoader({
                    height: 600,
                    callback: this.loadMore
                });
            }
            this.collection.bind('add', this.addHandler);
        }
    });

});

/*global define*/
define('ev-script/collections/base',['require','backbone'],function(require) {

    

    var Backbone = require('backbone');

    return Backbone.Collection.extend({
        initialize: function(models, options) {
            this.app = options.app;
        },
        model: Backbone.Model.extend({
            idAttribute: 'ID'
        }),
        parse: function(response) {
            return response.Data;
        }
    });

});

/*global define*/
define('ev-script/collections/videos',['require','ev-script/collections/base'],function(require) {

    

    var BaseCollection = require('ev-script/collections/base');

    return BaseCollection.extend({
        initialize: function(models, options) {
            this.filterOn = options.filterOn;
            this.filterValue = options.filterValue;
            this.sourceUrl = options.sourceUrl;
            this.pageIndex = 1;
            this.hasMore = true;
            this.app = options.app;
        },
        url: function() {
            var api_url = this.app.config.ensembleUrl + this.sourceUrl;
            var sizeParam = 'PageSize=' + this.app.config.pageSize;
            var indexParam = 'PageIndex=' + this.pageIndex;
            var onParam = 'FilterOn=' + encodeURIComponent(this.filterOn);
            var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
            var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.app.config.urlCallback(url);
        }
    });

});

/*global define*/
define('ev-script/views/video-picker',['require','jquery','underscore','ev-script/views/picker','ev-script/views/search','ev-script/views/video-results','ev-script/collections/videos'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        SearchView = require('ev-script/views/search'),
        VideoResultsView = require('ev-script/views/video-results'),
        Videos = require('ev-script/collections/videos');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadVideos');
            this.searchView = new SearchView({
                id: this.id + '-search',
                tagName: 'div',
                className: 'ev-search',
                picker: this,
                app: this.app,
            });
            this.$el.append(this.searchView.$el);
            this.searchView.render();
            this.resultsView = new VideoResultsView({
                id: this.id + '-results',
                tagName: 'div',
                className: 'ev-results clearfix',
                picker: this,
                app: this.app
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
            var videos = this.app.cache.videosCache[this.app.auth.getUser() + sourceId + searchVal];
            if (!videos) {
                videos = new Videos({}, {
                    sourceUrl: sourceUrl,
                    filterOn: '',
                    filterValue: searchVal,
                    app: this.app
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
                        this.app.cache.videosCache[this.app.auth.getUser() + sourceId + searchVal] = collection;
                        this.resultsView.collection = collection;
                        this.resultsView.render();
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.app.auth.ajaxError(xhr, _.bind(function() {
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

});

/*global define*/
define('ev-script/views/settings',['require','underscore','backbone'],function(require) {

    

    var _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'show', 'cancelHandler', 'submitHandler');
            this.field = options.field;
            this.app = options.app;
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

});

/*global define*/
define('ev-script/views/video-settings',['require','underscore','ev-script/views/settings'],function(require) {

    

    var _ = require('underscore'),
        SettingsView = require('ev-script/views/settings');

    return SettingsView.extend({
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

});

/*global define*/
define('ev-script/views/organization-select',['require','underscore','backbone'],function(require) {

    

    var _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
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
            this.$el.trigger('change');
        }
    });

});

/*global define*/
define('ev-script/collections/organizations',['require','ev-script/collections/base'],function(require) {

    

    var BaseCollection = require('ev-script/collections/base');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
        },
        url: function() {
            var api_url = this.app.config.ensembleUrl + '/api/Organizations';
            // Make this arbitrarily large so we can retrieve ALL orgs in a single request
            var sizeParam = 'PageSize=9999';
            var indexParam = 'PageIndex=1';
            var url = api_url + '?' + sizeParam + '&' + indexParam;
            return this.app.config.urlCallback(url);
        }
    });

});

/*global define*/
define('ev-script/views/library-select',['require','underscore','backbone'],function(require) {

    

    var _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
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

});

/*global define*/
define('ev-script/collections/libraries',['require','ev-script/collections/base'],function(require) {

    

    var BaseCollection = require('ev-script/collections/base');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.organizationId;
        },
        url: function() {
            var api_url = this.app.config.ensembleUrl + '/api/Libraries';
            // Make this arbitrarily large so we can retrieve ALL libraries under an org in a single request
            var sizeParam = 'PageSize=9999';
            var indexParam = 'PageIndex=1';
            var onParam = 'FilterOn=OrganizationId';
            var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
            var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.app.config.urlCallback(url);
        }
    });

});

/*global define*/
define('ev-script/views/playlist-select',['require','jquery','underscore','backbone','ev-script/views/organization-select','ev-script/collections/organizations','ev-script/views/library-select','ev-script/collections/libraries'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        OrganizationSelectView = require('ev-script/views/organization-select'),
        Organizations = require('ev-script/collections/organizations'),
        LibrarySelectView = require('ev-script/views/library-select'),
        Libraries = require('ev-script/collections/libraries');

    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization', 'changeLibrary', 'handleSubmit');
            this.picker = options.picker;
            this.id = options.id;
            this.app = options.app;
            var orgSelectId = this.id + '-org-select';
            this.$el.append('<label for="' + orgSelectId + '">Organization:</label>');
            this.orgSelect = new OrganizationSelectView({
                id: orgSelectId,
                tagName: 'select',
                className: 'form-select organizations',
                picker: this.picker,
                app: this.app,
                collection: new Organizations({}, {
                    app: this.app
                })
            });
            this.$el.append(this.orgSelect.$el);
            var libSelectId = this.id + '-lib-select';
            this.$el.append('<label for="' + libSelectId + '">Library:</label>');
            this.libSelect = new LibrarySelectView({
                id: libSelectId,
                tagName: 'select',
                className: 'form-select libraries',
                picker: this.picker,
                app: this.app,
                collection: new Libraries({}, {
                    app: this.app
                })
            });
            this.$el.append(this.libSelect.$el);
            var html = '<input type="button" value="Go" class="form-submit" />' + '<div class="loader"></div>' + '<div class="ev-poweredby"><a tabindex="-1" target="_blank" href="http://ensemblevideo.com"><span>Powered by Ensemble</span></a></div>';
            this.$el.append(html);
            var $loader = this.$('div.loader');
            $loader.bind('ajaxSend', _.bind(function(e, xhr, settings) {
                if(this.picker === settings.picker) {
                    $loader.addClass('loading');
                }
            }, this)).bind('ajaxComplete', _.bind(function(e, xhr, settings) {
                if(this.picker === settings.picker) {
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
            var orgs = this.app.cache.orgsCache[this.app.auth.getUser()];
            if(!orgs) {
                orgs = new Organizations({}, {
                    app: this.app
                });
                orgs.fetch({
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        this.app.cache.orgsCache[this.app.auth.getUser()] = collection;
                        this.orgSelect.collection.reset(collection.models);
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.app.auth.ajaxError(xhr, _.bind(function() {
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
            var libs = this.app.cache.libsCache[this.app.auth.getUser() + orgId];
            if(!libs) {
                libs = new Libraries({}, {
                    organizationId: orgId,
                    app: this.app
                });
                libs.fetch({
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        this.app.cache.libsCache[this.app.auth.getUser() + orgId] = collection;
                        this.libSelect.collection.reset(collection.models);
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.app.auth.ajaxError(xhr, _.bind(function() {
                            this.loadLibraries();
                        }, this));
                    }, this)
                });
            } else {
                this.libSelect.collection.reset(libs.models);
            }
        }
    });

});

/*global define*/
define('ev-script/views/playlist-embed',['require','backbone'],function(require) {

    

    var Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            this.app = options.app;
            var html =
                '<iframe src="' + this.app.config.ensembleUrl +
                '/app/plugin/embed.aspx?DestinationID=' + this.model.get('id') +
                '" frameborder="0" style="width:800px;height:850px;" allowfullscreen></iframe>';
            this.$el.html(html);
        }
    });

});

/*global define*/
define('ev-script/views/playlist-preview',['require','ev-script/views/preview','ev-script/views/playlist-embed'],function(require) {

    

    var PreviewView = require('ev-script/views/preview'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed');

    return PreviewView.extend({
        embedClass: PlaylistEmbedView
    });

});

/*global define*/
define('ev-script/views/playlist-results',['require','jquery','ev-script/views/results','ev-script/models/playlist-settings','ev-script/views/playlist-preview'],function(require) {

    

    var $ = require('jquery'),
        ResultsView = require('ev-script/views/results'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview');

    return ResultsView.extend({
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
            if (this.collection.size() >= this.app.config.pageSize || $table[0].scrollHeight > 600) {
                this.$scrollLoader = $table.evScrollLoader({
                    height: 600,
                    callback: this.loadMore
                });
            }
            this.collection.bind('add', this.addHandler);
        }
    });

});

/*global define*/
define('ev-script/collections/playlists',['require','ev-script/collections/base'],function(require) {

    

    var BaseCollection = require('ev-script/collections/base');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.filterValue;
            this.pageIndex = 1;
            this.hasMore = true;
        },
        url: function() {
            var api_url = this.app.config.ensembleUrl + '/api/Playlists';
            var sizeParam = 'PageSize=' + this.app.config.pageSize;
            var indexParam = 'PageIndex=' + this.pageIndex;
            var onParam = 'FilterOn=LibraryId';
            var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
            var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.app.config.urlCallback(url);
        }
    });

});

/*global define*/
define('ev-script/views/playlist-picker',['require','jquery','underscore','ev-script/views/picker','ev-script/views/playlist-select','ev-script/views/playlist-results','ev-script/collections/playlists'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        PlaylistSelectView = require('ev-script/views/playlist-select'),
        PlaylistResultsView = require('ev-script/views/playlist-results'),
        Playlists = require('ev-script/collections/playlists');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadPlaylists');
            this.playlistSelect = new PlaylistSelectView({
                id: this.id + '-playlist-select',
                tagName: 'div',
                className: 'ev-playlist-select',
                picker: this,
                app: this.app
            });
            this.$el.append(this.playlistSelect.$el);
            this.resultsView = new PlaylistResultsView({
                id: this.id + '-results',
                tagName: 'div',
                className: 'ev-results clearfix',
                picker: this,
                app: this.app
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
            var playlists = this.app.cache.playlistsCache[this.app.auth.getUser() + libraryId];
            if(!playlists) {
                playlists = new Playlists({}, {
                    filterValue: libraryId,
                    app: this.app
                });
                playlists.fetch({
                    picker: this,
                    success: _.bind(function(collection, response, options) {
                        var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                        var size = _.size(response.Data);
                        if(size === totalRecords) {
                            collection.hasMore = false;
                        } else {
                            collection.hasMore = true;
                            collection.pageIndex += 1;
                        }
                        this.app.cache.playlistsCache[this.app.auth.getUser() + libraryId] = collection;
                        this.resultsView.collection = collection;
                        this.resultsView.render();
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.app.auth.ajaxError(xhr, _.bind(function() {
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

});

/*global define*/
define('ev-script/views/playlist-settings',['require','ev-script/views/settings'],function(require) {

    

    var SettingsView = require('ev-script/views/settings');

    return SettingsView.extend({
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

});

/*global define*/
define('ev-script/views/field',['require','jquery','underscore','backbone','ev-script/models/video-settings','ev-script/models/playlist-settings','ev-script/views/video-picker','ev-script/views/video-settings','ev-script/views/video-preview','ev-script/models/video-encoding','ev-script/views/playlist-picker','ev-script/views/playlist-settings','ev-script/views/playlist-preview'],function(require) {

    

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
            this.app = options.app;
            var pickerOptions = {
                id: this.id + '-picker',
                tagName: 'div',
                className: 'ev-' + this.model.get('type') + '-picker',
                field: this,
                app: this.app
            };
            var settingsOptions = {
                id: this.id + '-settings',
                tagName: 'div',
                className: 'ev-settings',
                field: this,
                app: this.app
            };
            if(this.model instanceof VideoSettings) {
                this.modelClass = VideoSettings;
                this.pickerClass = VideoPickerView;
                this.settingsClass = VideoSettingsView;
                this.previewClass = VideoPreviewView;
                this.encoding = new VideoEncoding({}, {
                    app: this.app
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
            this.app.eventAggr.trigger('hidePickers', this);
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
                app: this.app
            });
            e.preventDefault();
        },
        renderActions: function() {
            var html = '<div class="logo"><a target="_blank" href="' + this.app.config.ensembleUrl + '"><span>Ensemble Logo</span></a></div>';
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
                var re = new RegExp('^' + this.app.config.ensembleUrl.toLocaleLowerCase() + '\/app\/assets\/');
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

/*global define*/
define('ev-script/views/auth',['require','jquery','underscore','backbone'],function(require) {

    

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            this.app = options.app;
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
                title: 'Ensemble Video Login - ' + this.app.config.ensembleUrl,
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
                    this.app.eventAggr.trigger('hidePickers');
                }, this)
            });
            $('form', this.$dialog).submit(_.bind(function(e) {
                var $form = $(e.target);
                var username = $('#username', $form).val();
                var password = $('#password', $form).val();
                if (username && password) {
                    this.app.auth.setAuth(username, password);
                    this.$dialog.dialog('destroy').remove();
                    this.submitCallback();
                }
                e.preventDefault();
            }, this));
        }
    });

});

/*global define*/
define('ev-script',['require','backbone','underscore','jquery','ev-script/models/video-settings','ev-script/models/playlist-settings','ev-script/views/field','ev-script/views/auth','ev-script/views/video-embed','ev-script/views/playlist-embed'],function(require) {

    

    var root = this;

    var Backbone = require('backbone'),
        _ = require('underscore'),
        $ = require('jquery'),
        VideoSettings = require('ev-script/models/video-settings'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        FieldView = require('ev-script/views/field'),
        AuthView = require('ev-script/views/auth'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed');

    var EnsembleApp = function(appOptions) {

        appOptions = appOptions || {};

        var config = {
                authId: appOptions.authId || 'ensemble',
                ensembleUrl: appOptions.ensembleUrl || '',
                authPath: appOptions.authPath || '',
                authDomain: appOptions.authDomain || '',
                urlCallback: appOptions.urlCallback ||
                function(url) {
                    return url;
                },
                pageSize: parseInt(appOptions.pageSize || 100, 10)
            },
            auth = {
                cookieOptions: {
                    path: config.authPath
                },
                getUser: function() {
                    return $.cookie(config.authId + '-user');
                },
                setAuth: function(username, password) {
                    username += (config.authDomain ? '@' + config.authDomain : '');
                    $.cookie(config.authId + '-user', username, _.extend({}, auth.cookieOptions));
                    $.cookie(config.authId + '-pass', password, _.extend({}, auth.cookieOptions));
                    eventAggr.trigger('authSet');
                },
                removeAuth: function() {
                    $.cookie(config.authId + '-user', null, _.extend({}, auth.cookieOptions));
                    $.cookie(config.authId + '-pass', null, _.extend({}, auth.cookieOptions));
                    eventAggr.trigger('authRemoved');
                },
                hasAuth: function() {
                    return $.cookie(config.authId + '-user') && $.cookie(config.authId + '-pass');
                },
                ajaxError: function(xhr, authCallback) {
                    if (xhr.status === 401) {
                        auth.removeAuth();
                        var authView = new AuthView({
                            el: this.el,
                            submitCallback: authCallback,
                            app: app
                        });
                    } else if (xhr.status === 500) {
                        // Making an assumption that root is window here...
                        root.alert('It appears there is an issue with the Ensemble Video installation.');
                    } else if (xhr.status === 404) {
                        root.alert('Could not find requested resource.  This is likely a problem with the configured Ensemble Video base url.');
                    } else {
                        root.alert('An unexpected error occurred.  Check the server log for more details.');
                    }
                }
            },
            cache = {
                videosCache: [],
                orgsCache: [],
                libsCache: [],
                playlistsCache: []
            },
            eventAggr = _.extend({}, Backbone.Events),
            app = {
                config: config,
                auth: auth,
                cache: cache,
                eventAggr: eventAggr
            };

        this.handleField = function(fieldWrap, settingsModel, fieldSelector) {
            var $field = $(fieldSelector, fieldWrap);
            var fieldView = new FieldView({
                id: fieldWrap.id,
                el: fieldWrap,
                model: settingsModel,
                $field: $field,
                app: app
            });
        };

        this.handleEmbed = function(embedWrap, settingsModel) {
            if (settingsModel instanceof VideoSettings) {
                var videoEmbed = new VideoEmbedView({
                    el: embedWrap,
                    model: settingsModel,
                    app: app
                });
            } else {
                var playlistEmbed = new PlaylistEmbedView({
                    el: embedWrap,
                    model: settingsModel,
                    app: app
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
    // Register in the values from the outer closure for common dependencies
    // as local almond modules
    define('jquery', function () {
        return $;
    });
    define('underscore', function () {
        return _;
    });
    define('backbone', ['jquery', 'underscore'], function () {
        return Backbone;
    });

    // Use almond's special top-level, synchronous require to trigger factory
    // functions, get the final module value, and export it as the public
    // value.
    return require('ev-script');
}));
