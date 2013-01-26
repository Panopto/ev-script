/*global define*/
define(function(require) {

    'use strict';

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
