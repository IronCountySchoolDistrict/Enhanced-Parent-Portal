/*global require,loadingDialogInstance*/
require.config({
    baseUrl: '<!-- @echo IMAGE_SERVER_URL -->/enhanced-parent-portal/js',
    paths: {
        // app modules
        tableModule: '/student-contacts-update/table-module',
        service: '/student-contacts-update/service',
        actions: '/student-contacts-update/actions',
        config: '/student-contacts-update/config',
        tooltip: '/student-contacts-update/tooltip',

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