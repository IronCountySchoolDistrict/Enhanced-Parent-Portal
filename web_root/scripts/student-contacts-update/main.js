/*global require*/
require.config({
    baseUrl: '/scripts',
    paths: {
        // app modules
        contactsTable: '/scripts/student-contacts-update/contacts-table',
        buttons: '/scripts/student-contacts-update/buttons',

        // external dependencies
        dataTables: '//cdn.datatables.net/1.10.2/js/jquery.dataTables',
        tableTools: '//cdn.datatables.net/tabletools/2.2.3/js/dataTables.tableTools',
        zeroClipboard: '//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard',
        underscore: 'underscore/underscore'
    }
});

require(['contactsTable', 'buttons'],
    function (contactsTable, buttons) {
        'use strict';
        var $dataTable = contactsTable.main();
        buttons.main($dataTable);
    });