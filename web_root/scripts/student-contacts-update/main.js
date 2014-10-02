/*global require*/
require.config({
    baseUrl: '/scripts',
    paths: {
        // app modules
        table: '/scripts/student-contacts-update/table',
        buttons: '/scripts/student-contacts-update/buttons',
        service: '/scripts/student-contacts-update/service',
        actions: '/scripts/student-contacts-update/actions',
        config: '/scripts/student-contacts-update/config',

        underscore: 'underscore/underscore'
    }
});

require(['table', 'buttons', 'actions'],
    function (table, buttons, actions) {
        'use strict';
        var $dataTable = table.main();
        //buttons.main($dataTable);
        actions.main($dataTable);
    });