define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'playlist',
            width: '1000',
            height: '590',
            layout: 'showcase',
            sortby: 'DateAdded',
            desc: true,
            search: '',
            categories: '',
            resultscount: '',
            embedcode: false,
            statistics: true,
            attachments: true,
            notes: true,
            links: true,
            logo: true,
            metadata: true,
            socialsharing: false,
            autoplay: false,
            comments: true,
            showcaptions: false,
            audiopreviewimage: false,
            captionsearch: true,
            viewersreport: true,
            axdxs: false,
            nextup: true,
            featuredcontentid: '',
            embedtype: 'responsive',
            forceembedtype: false,
            jswrapper: true
        }
    });
});
