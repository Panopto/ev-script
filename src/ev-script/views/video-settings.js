/*global define*/
define(function(require) {

  'use strict';

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
