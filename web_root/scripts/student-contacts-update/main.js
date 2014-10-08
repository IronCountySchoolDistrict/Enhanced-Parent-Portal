/*global require*/
require.config({
    baseUrl: '/scripts',
    paths: {
        // app modules
        table: '/scripts/student-contacts-update/table',
        service: '/scripts/student-contacts-update/service',
        actions: '/scripts/student-contacts-update/actions',
        config: '/scripts/student-contacts-update/config',

        underscore: 'underscore/underscore'
    }
});

require(['table', 'actions'],
    function (table, actions) {
        'use strict';
        table.main();
        actions.main();
    });