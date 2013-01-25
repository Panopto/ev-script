/*global define*/
define(function(require) {

  'use strict';

  var $ = require('jquery'),
      _ = require('underscore'),
      Backbone = require('backbone'),
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
          if (this.collection.size() >= this.config.pageSize || $table[0].scrollHeight > 600) {
              this.$scrollLoader = $table.evScrollLoader({
                  height: 600,
                  callback: this.loadMore
              });
          }
          this.collection.bind('add', this.addHandler);
      }
  });

});
