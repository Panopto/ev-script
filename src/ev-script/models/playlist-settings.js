define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'playlist',
            width: '800',
            height: '1000',
            layout: 'list',
            sortby: 'DateAdded',
            desc: true,
            search: '',
            categories: '',
            resultscount: '',
            embedcode: false,
            statistics: true,
            duration: true,
            attachments: true,
            annotations: true,
            links: true,
            credits: true,
            socialsharing: false,
            autoplay: false,
            showcaptions: false,
            dateproduced: true,
            audiopreviewimage: false,
            captionsearch: true,
            viewersreport: true,
            axdxs: false,
            nextup: true,
            featuredcontentid: '',
            embedtype: 'fixed',
            forceembedtype: false
        }
    });
});
