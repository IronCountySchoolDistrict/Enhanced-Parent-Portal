/*global require*/
require.config({
    baseUrl: '/scripts',
    paths: {
        // app modules
        table: '/scripts/student-contacts-update/table',
        buttons: '/scripts/student-contacts-update/buttons',
        service: '/scripts/student-contacts-update/service',
        actions: '/scripts/student-contacts-update/actions',

        // external dependencies
        //dataTables: '//cdn.datatables.net/1.10.2/js/jquery.dataTables',
        //tableTools: '//cdn.datatables.net/tabletools/2.2.3/js/dataTables.tableTools',
        //zeroClipboard: '//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard',
        underscore: 'underscore/underscore'
    }
});

require(['table', 'buttons', 'actions'],
    function (table, buttons, actions) {
        'use strict';
        var $dataTable = table.main();
        buttons.main($dataTable);
        actions.main($dataTable);
    });