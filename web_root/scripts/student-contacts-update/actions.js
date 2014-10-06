/*global define, $j, psData*/

define(['service', 'underscore', 'config'], function (service, _, config) {
    'use strict';
    return {
        main: function () {
            this.loadContacts();
        },


        /**
         *
         * @param contacts {Array}
         * @param stagingContacts {Array}
         */
        getArrayOfContactIds: function (contacts, stagingContacts) {
            var contactTableName = contacts.name.toLowerCase();
            var stagingContactsTableName = stagingContacts.name.toLowerCase();
            var allContacts = contacts;
            allContacts.concat(stagingContacts);
            var contactIds = [];
            _.each(allContacts, function(contact) {

            });
        },

        /**
         * @param stagingContacts {Object}
         * @param contactId {String}
         * @private
         * @returns {Object|Boolean}
         */
        _getStagingContactById: function (stagingContacts, contactId) {
            var contactsStagingTableName = config.studentContactsStagingTable.toLowerCase();
            var idMatches = _.filter(stagingContacts, function(contact) {
                return contact.tables[contactsStagingTableName].contact_id === contactId;
            });
            if (idMatches.length === 1) {
                return idMatches[0];
            } else {
                return false;
            }
        },

        loadContacts: function () {
            var options = {
                studentsdcid: psData.studentfrn.slice(3)
            };
            var parGuarContactsAjax = service.getParGuars(options);
            var parGuarContactsStagingAjax = service.getParGuarsStaging(options);

            var emergContactsAjax = service.getEmergConts(options);
            var emergContactsStagingAjax = service.getEmergContsStaging(options);

            var deferredObjects = [];
            deferredObjects.push(parGuarContactsAjax);
            deferredObjects.push(parGuarContactsStagingAjax);
            deferredObjects.push(emergContactsAjax);
            deferredObjects.push(emergContactsStagingAjax);
            var _this = this;
            $j.when.apply($j, deferredObjects).done(function (parGuarContacts, parGuarContactsStaging, emergContacts, emergContactsStaging) {
                var contactsTableName = parGuarContacts[0].name.toLowerCase();
                var contactsStagingTableName = parGuarContactsStaging[0].name.toLowerCase();

                var parGuarContactRecords = parGuarContacts[0].record;
                var parGuarContactStagingRecords = parGuarContactsStaging[0].record;

                var emergContactRecords = emergContacts[0].record;
                var emergContactStagingRecords = emergContactsStaging[0].record;
                $j.each(parGuarContactRecords, function (index, contact) {
                    var contactId = contact.tables[contactsTableName].contact_id;
                    var stagingContact = _this._getStagingContactById(parGuarContactStagingRecords, contactId);
                    var contactData;
                    if (stagingContact) {
                        contactData = stagingContact.tables[contactsStagingTableName];
                        _this.renderContact(contactData, null, true, true);
                    } else {
                        contactData = contact.tables[contactsTableName];
                        _this.renderContact(contactData, null, false, false);
                    }
                });

                $j.each(emergContactRecords, function (index, contact) {
                    var contactId = contact.tables[contactsTableName].contact_id;
                    var stagingContact = _this._getStagingContactById(emergContactStagingRecords, contactId);
                    var contactData;
                    if (stagingContact) {
                        contactData = stagingContact.tables[contactsStagingTableName];
                        _this.renderContact(contactData, null, true, false);
                    } else {
                        contactData = contact.tables[contactsTableName];
                        _this.renderContact(contactData, null, false, false);
                    }
                });
            });
        },

        /**
         * @param contactData {Object}
         * @param [row] {jQuery} - Row that will have its content replaced with the contact template.
         * Leaving this param empty will insert the row at the end of the table.
         * @param [showUpdateMsg] {Boolean} - If true, prepend the updated contact information.
         * @param isParGuar {Boolean} - Which contacts table should this contact be rendered into?
         */
        renderContact: function (contactData, row, showUpdateMsg, isParGuar) {
            var contactTemplate = $j('#contact-template').html();
            var renderedTemplate = _.template(contactTemplate, {'contact': contactData});
            var rowSelector;

            if (!row) {
                row = $j('<tr>' + renderedTemplate + '</tr>');
                if (isParGuar) {
                    $j('#parents-guardians-table tbody').append(row);
                } else {
                    $j('#emergency-contacts-table tbody').append(row);
                }
            } else {
                row.html('').html(renderedTemplate);
            }

            var prevElem = row.prev();
            if (prevElem) {
                var prevClass = prevElem.attr('class');
            }
            if (showUpdateMsg && prevClass !== 'contact-update-msg') {
                var updatedTemplate = $j($j('#contact-updated-template').html());
                updatedTemplate.insertBefore(row);
            }
            //var newRow = $j('#parents-guardians-table tr').last();
            row.data({'contactData': contactData});
        },

        /**
         *
         * @param contactData {Object}
         * @param row {jQuery}
         */
        editContact: function (contactData, row, isParGuar) {
            var numSelector = isParGuar ? '#parents-guardians-table' : '#emergency-contacts-table';
            var numOfContacts = $j(numSelector).find('tr').not('.inforow').length;
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

        addContact: function(row, isParGuar) {
            var numSelector = isParGuar ? '#parents-guardians-table' : '#emergency-contacts-table';
            var numOfContacts = $j(numSelector).find('tr').not('.inforow').length;
            var newContactTemplate = $j('#new-contact-template').html();
            var renderedTemplate = _.template(newContactTemplate, {numOfContacts: numOfContacts});
            $j(row).html('').html(renderedTemplate);
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