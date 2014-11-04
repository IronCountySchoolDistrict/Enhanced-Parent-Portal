/*global require,loadingDialogInstance*/
require.config({
    baseUrl: '/scripts',
    paths: {
        // app modules
        tableModule: '/scripts/student-contacts-update/table-module',
        service: '/scripts/student-contacts-update/service',
        actions: '/scripts/student-contacts-update/actions',
        config: '/scripts/student-contacts-update/config',

        parsley: '//cdnjs.cloudflare.com/ajax/libs/parsley.js/2.0.5/parsley.js',
        underscore: 'underscore/underscore'
    }
});

require(['tableModule', 'actions'],
    function (tableModule, actions) {
        'use strict';
        loadingDialogInstance.open();
        tableModule.main();
        actions.main();
    });