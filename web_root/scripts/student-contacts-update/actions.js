/*global define, $j, psData*/

define(['service', 'underscore', 'config'], function (service, _, config) {
    'use strict';
    return {
        main: function () {
            this.loadContacts();
        },

        loadContacts: function () {
            var options = {
                studentsdcid: psData.studentfrn.slice(3)
            };
            var contactsAjax = service.getParGuars(options);
            var _this = this;
            contactsAjax.done(function (contacts) {
                var contactsTableName = contacts.name.toLowerCase();
                var contactRecords = contacts.record;
                $j.each(contactRecords, function (index, contact) {
                    var contactData = contact.tables[contactsTableName];
                    _this.renderContact(contactData);
                });
            });
        },

        /**
         * @param contactData {Object}
         * @param [row] {jQuery} - Row that will have its content replaced with the contact template.
         * Leaving this param empty will insert the row at the end of the table.
         * @param [showUpdateMsg] {Boolean} - If true, prepend the updated contact information.
         */
        renderContact: function (contactData, row, showUpdateMsg) {
            var contactTemplate = $j('#contact-template').html();
            var renderedTemplate = _.template(contactTemplate, {'contact': contactData});
            if (!row) {
                $j('#parents-guardians-table tbody').append('<tr>' + renderedTemplate + '</tr>');
            } else {
                row.html('').html(renderedTemplate);

                var prevClass = row.prev().attr('class');
                if (showUpdateMsg && prevClass !== 'contact-update-msg') {
                    var updatedTemplate = $j($j('#contact-updated-template').html());
                    updatedTemplate.insertBefore(row);
                }
            }
            var newRow = $j('#parents-guardians-table tr').last();
            newRow.data({'contactData': contactData});
        },

        /**
         *
         * @param contactData {Object}
         * @param row {jQuery}
         */
        editContact: function (contactData, row) {
            var numOfContacts = $j('#parents-guardians-table tr').not('.inforow').length;
            var editContactTemplate = $j('#edit-contact-template').html();
            var context = {
                'numOfContacts': numOfContacts,
                'contact': contactData
            };
            var renderedTemplate = _.template(editContactTemplate, context);
            $j(row).html('').html(renderedTemplate);

            // Set the correct option in the priority dropdown to be selected.
            _.each($j('#priority option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.priority) {
                    $option.attr({'selected': 'selected'});
                }
            });

            // Set the correct option in the relationship dropdown to be selected.
            _.each($j('#relationship option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.relationship) {
                    $option.attr({'selected': 'selected'});
                }
            });

            // Set the correct option in the residence state drop down to be selected.
            _.each($j('#residence-state option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.relationship) {
                    $option.attr({'selected': 'selected'});
                }
            });

            // Set the correct option in the mailing state drop down to be selected.
            _.each($j('#mailing-state option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.relationship) {
                    $option.attr({'selected': 'selected'});
                }
            });
        },

        /**
         * Create an object with the data in the edit contact form
         * @param row {jQuery}
         */
        deserializeContact: function (row) {
            return {
                email: row.find('#email').val(),
                employer: row.find('#employer').val(),
                first_name: row.find('#first-name').val(),
                last_name: row.find('#last-name').val(),
                mailing_city: row.find('#mailing-city').val(),
                mailing_state: row.find('#mailing-state').val(),
                mailing_street: row.find('#mailing-street').val(),
                mailing_zip: row.find('#mailing-zip').val(),
                phone1: row.find('#phone1').val(),
                phone1type: row.find('#phone1type').val(),
                phone2: row.find('#phone2').val(),
                phone2type: row.find('#phone2type').val(),
                phone3: row.find('#phone1').val(),
                phone3type: row.find('#phone3type').val(),
                priority: row.find('#priority').val(),
                relationship: row.find('#relationship').val(),
                residence_city: row.find('#residence-city').val(),
                residence_state: row.find('#residence-state').val(),
                residence_street: row.find('#residence-street').val(),
                residence_zip: row.find('#residence-zip').val()
            };
        },

        /**
         * @param contactData {Object}
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updateStagingContact: function (contactData, contactRecordId) {
            var studentContactsStagingTable = config.studentContactsStagingTable;
            var requestObj = {
                name: config.studentContactsStagingTable,
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);
            return service.updateStagingContact(jsonContactData, contactRecordId);
        },

        /**
         *
         * @param contactData {Object}
         * @param studentsDcid {Number}
         * @param legalGuardian {Boolean}
         * @param contactId {String}
         */
        newStagingContact: function (contactData, studentsDcid, legalGuardian, contactId) {
            contactData.legal_guardian = legalGuardian ? "1" : "0";
            contactData.studentsdcid = studentsDcid;
            contactData.contact_id = contactId;
            var studentContactsStagingTable = config.studentContactsStagingTable;
            var requestObj = {
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);
            return service.newStagingContact(jsonContactData);
        }
    };
});