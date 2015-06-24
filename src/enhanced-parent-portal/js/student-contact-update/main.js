/*global require,loadingDialogInstance*/

// Use app-specific base URL here so other dependency import paths don't get affected
var appBaseUrl = "/* @echo IMAGE_SERVER_URL *//enhanced-parent-portal/js";

require.config({
    paths: {
        // app modules
        tableModule: appBaseUrl + '/student-contact-update/table-module',
        service: appBaseUrl + '/student-contact-update/service',
        actions: appBaseUrl + '/student-contact-update/actions',
        config: appBaseUrl + '/student-contact-update/config',
        tooltip: appBaseUrl + '/student-contact-update/tooltip',

        parsley: '//cdnjs.cloudflare.com/ajax/libs/parsley.js/2.0.5/parsley',
        underscore: 'underscore/underscore'
    }
});

require(['tableModule', 'actions', 'tooltip'],
    function (tableModule, actions, tooltip) {
        'use strict';
        loadingDialogInstance.open();
        tableModule.main();
        actions.main();
        tooltip.main();
        $j('#btn-student-contacts').attr({'class': 'selected'});
    });