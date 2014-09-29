/*global define, $j*/

define(['service', 'underscore'], function(service, _) {
    return {
        main: function($dataTable) {
            this.loadContacts($dataTable);
        },
        loadContacts: function($dataTable) {
            var options = {
                studentsdcid: psData.studentfrn.slice(3)
            };
            var contactsAjax = service.getParGuars(options);
            contactsAjax.done(function(contacts) {
                var contactsTableName = contacts.name.toLowerCase();
                var contactRecords = contacts.record;
                $j.each(contactRecords, function(index, contact) {
                    var contactData = contact.tables[contactsTableName];
                    var contactTemplate = $j('#contact-template').html();
                    var renderedTemplate = _.template(contactTemplate, {'contact': contactData});
                    $j('tbody').append(renderedTemplate);
                });
            });
        }
    };
});