define(function(require) {

    var _ = require('underscore'),
        BaseModel = require('ev-script/models/base'),
        ArrayAdapter = require('select2/select2/data/array'),
        Utils = require('select2/select2/utils'),
        InfiniteScroll = require('select2/select2/dropdown/infiniteScroll');

    function HapiAdapter ($element, options) {

        options.set('resultsAdapter', Utils.Decorate(
            options.get('resultsAdapter'),
            InfiniteScroll
        ));

        this.hapiOptions = options.get('hapi');
        this.hapiOptions.collection.on('reset', _.bind(function() {
            $element.val(null).trigger('change.select2');
        }, this));
        $element.on('hapi:updateTemplates', _.bind(function(e, templates) {
            this.hapiOptions.templates = templates;
        }, this));
        $element.on('hapi:useGet', _.bind(function(e) {
            this.hapiOptions.useGet = true;
        }, this));

        HapiAdapter.__super__.constructor.call(this, $element, options);
    }

    Utils.Extend(HapiAdapter, ArrayAdapter);

    HapiAdapter.prototype.current = function (callback) {

        var $selected = this.$element.find(':selected'),
            collection = this.hapiOptions.collection;
        if (!$selected.length || !collection.size()) {
            if (this.hapiOptions.useGet) {
                this.hapiOptions.useGet = false;
                var item = new this.hapiOptions.modelClass({}, {
                        href: this.hapiOptions.templates.get.expand({
                            id: this.hapiOptions.defaultId
                        })
                    });

                item.fetch({
                    picker: this.hapiOptions.picker,
                    success: _.bind(function(model, response, options) {
                        collection.add(new BaseModel(response, {}));
                        this.select({
                            id: response.id,
                            text: response.name,
                            selected: true
                        });
                    }, this),
                    error: _.bind(this.hapiOptions.ajaxError, this)
                });
            } else if (!collection.size()) {
                this.query({
                    pageNumber: 1,
                    term: ''
                }, _.bind(function(data) {
                    var first = _.first(data.results);
                    first.selected = true;
                    this.select(first);
                }, this));
            } else {
                var model = collection.at(0);
                this.select({
                    id: model.id,
                    text: model.get('name'),
                    selected: true
                });
            }
        } else {
            if ($selected.val() === '' || collection.findWhere({ 'id': $selected.val() })) {
                callback([this.item($selected)]);
            } else {
                callback([]);
            }
        }
    };

    HapiAdapter.prototype.query = function (params, callback) {
        var items = new this.hapiOptions.modelClass({}, {
            href: this.hapiOptions.templates.search.expand({
                pageSize: 100,
                pageNumber: params.page,
                search: params.term
            })
        });
        items.fetch({
            picker: this.hapiOptions.picker,
            success: _.bind(function(model, response, options) {
                var next = model.getLink('next'),
                    embedded = model.getEmbedded(this.hapiOptions.collectionName),
                    collection = this.hapiOptions.collection,
                    noneOption = this.hapiOptions.noneOption,
                    dataMap = function(model) {
                        return {
                            id: model.id,
                            text: model.get('name')
                        };
                    };

                if (embedded) {
                    collection.add(embedded.models);
                }

                var data = {
                    results: [],
                    pagination: {
                        more: next
                    }
                };

                if (noneOption && !params.page) {
                    data.results.push(noneOption);
                }

                data.results = data.results.concat(_.map(embedded.models, dataMap));

                callback(data);
            }, this),
            error: _.bind(this.hapiOptions.ajaxError, this)
        });

    };

    return HapiAdapter;
});
