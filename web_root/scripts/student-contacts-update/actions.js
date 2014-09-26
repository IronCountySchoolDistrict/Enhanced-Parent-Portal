/*global define, $j*/

define(['service'], function(service) {
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
                    // Object that matches the correct format for insertting into datatables row.
                    var dataTablesContact = [
                        {
                            "priority": contactData.priority ? contactData.priority : "",
                            "firstname": contactData.first_name ? contactData.first_name : "",
                            "lastname": contactData.last_name ? contactData.last_name : "",
                            "relation": contactData.relationship ? contactData.relationship : ""
                        },
                        {
                            "street": contactData.address ? contactData.address : "",
                            "city": contactData.city ? contactData.city : "",
                            "state": contactData.state ? contactData.state : "",
                            "zip": contactData.zip ? contactData.zip : ""
                        },
                        {
                            "email": contactData.email ? contactData.email : "",
                            "homephone": contactData.home_phone ? contactData.home_phone : "",
                            "cellphone": contactData.cell_phone ? contactData.cell_phone : "",
                            "workphone": contactData.work_phone ? contactData.work_phone : "",
                            "employer": contactData.employer ? contactData.employer : ""
                        },
                        "<button class='editcontact'>Edit</button><br /><button class='deletecontact'>Delete</button>",
                        contactData.priority ? priority : "",
                            contactData.last_name + ' ' + contactData.first_name
                    ];
                    //$dataTable.fnAddData(dataTablesContact);
                    $dataTable.fnAddData([
                        {
                            "priority": contactData.priority ? contactData.priority : "",
                            "firstname": contactData.first_name ? contactData.first_name : "",
                            "lastname": contactData.last_name ? contactData.last_name : "",
                            "relation": contactData.relationship ? contactData.relationship : ""
                        },
                        {
                            "street": contactData.address ? contactData.address : "",
                            "city": contactData.city ? contactData.city : "",
                            "state": contactData.state ? contactData.state : "",
                            "zip": contactData.zip ? contactData.zip : ""
                        }]);
                });
            });
        }
    };
});