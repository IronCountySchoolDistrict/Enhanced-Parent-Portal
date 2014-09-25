/*global define, $j*/

define(['service'], function(service) {
    return {
        main: function($dataTable) {
            this.loadContacts();
        },
        loadContacts: function($dataTable) {
            var options = {
                studentsdcid: psData.studentfrn.slice(3)
            };
            var contactsAjax = service.getContacts(options);
            contactsAjax.done(function(contacts) {
                $j.each(contacts, function(contact) {
                    console.dir(contact);
                })
            });
        }
    };
});