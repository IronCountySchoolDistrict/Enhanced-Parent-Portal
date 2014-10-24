/*global define, $j, psData*/

define(['actions', 'service', 'underscore'], function (actions, service, _) {
    'use strict';
    return {
        main: function () {
            this.addContactButton();
            this.bindEditButton();
            this.bindAddButton();
        },

        /**
         * Extract all priorities from the DOM
         * @param contactRows {jQuery}
         * @returns {String[]}
         * @private
         */
        _getAllContactPriorities: function (contactRows) {
            var allPriorities = [];
            _.each(contactRows, function(contactRow) {
                var rowData = $j(contactRow).data();
                var priorityInt = Number.parseInt(rowData.contactData.priority);
                allPriorities.push(priorityInt);
            });
            return allPriorities.sort();
        },

        /**
         * Extract all contact_ids from the DOM
         * @param contactRows
         * @returns {Array}
         * @private
         */
        _getAllContactIds: function (contactRows) {
            var allContactIds = [];
            _.each(contactRows, function(contactRow) {
                var rowData = $j(contactRow).data();
                var priorityInt = Number.parseInt(rowData.contactData.contact_id);
                allContactIds.push(priorityInt);
            });
            return allContactIds.sort();
        },

        /**
         *
         * @returns {jQuery}
         * @private
         */
        _getAllContactRows: function () {
            return $j('tr.contact:not(".inforow"):not(".contact-update-msg")');
        },

        addContactButton: function () {
            //create add contact button, and bind click event handler
            /**
             * @see sDom option in dataTable() initialization.
             */
            $j('#parents-guardians-content').prepend('<button id="add-par-guar-contact">Add Contact</button>');
            $j('#emergency-contacts-content').prepend('<button id="add-emerg-contact">Add Contact</button>');

            $j('#parents-guardians-content button, #emergency-contacts-content button').button({
                icons: {
                    primary: 'ui-icon-plus'
                }
            });
            $j('.ui-button-text').css({'color': '#fff'});
        },

        bindEditButton: function () {
            var _this = this;
            $j('body').on('click', '.editcontact', function (event) {
                var $eventTarget = $j(event.target);
                var $parentRow = $eventTarget.closest('tr');
                var isParGuarContact = $parentRow.closest('#parents-guardians-table').length > 0;

                var contactData = $parentRow.data('contactData');
                actions.editContact(contactData, $parentRow, isParGuarContact);
                _this.bindSaveButton(isParGuarContact);
            });
        },

        /**
         *
         * @param isParGuarContact {Boolean}
         */
        bindSaveButton: function (isParGuarContact) {
            var _this = this;
            $j('.savecontact').on('click', function (event) {

                var $eventTarget = $j(event.target);

                var $closestRow = $eventTarget.closest('tr');
                var contactData = actions.deserializeContact($closestRow);

                var ajaxFunc;

                var stagingContactsAjax;
                if (isParGuarContact) {
                    stagingContactsAjax = service.getParGuarsStaging({studentsdcid: psData.studentsDcid});
                } else {
                    stagingContactsAjax = service.getEmergContsStaging({studentsdcid: psData.studentsDcid});
                }

                stagingContactsAjax.done(function (stagingContacts) {
                    /* If the contactData object is not present in the current row,
                     * this is a new contact.
                     * @see actions.renderContact
                     */
                    var contactInitData = $closestRow.data().contactData;
                    var stagingRecordId;

                    if (contactInitData) {
                        var stagingTableName = stagingContacts.name.toLowerCase();
                        _.each(stagingContacts.record, function (contact) {
                            if (contactInitData.contact_id === contact.tables[stagingTableName].contact_id) {
                                stagingRecordId = contactInitData.id;
                            }
                        });
                    }

                    if (stagingRecordId) {
                        ajaxFunc = actions.updateStagingContact(contactData, stagingRecordId);
                    } else if (contactInitData) {
                        ajaxFunc = actions.newStagingContact(contactData, psData.studentsDcid, isParGuarContact, contactInitData.contact_id);
                    } else {
                        var largestContactId;
                        if (window.allContactIds.length > 0) {
                            largestContactId = window.allContactIds[window.allContactIds.length - 1];
                        } else {
                            largestContactId = 1;
                        }
                        var newContactId = largestContactId + 1;
                        newContactId = newContactId.toString();
                        ajaxFunc = actions.newStagingContact(contactData, psData.studentsDcid, isParGuarContact, newContactId);
                    }

                    ajaxFunc.done(function (resp) {
                        if (contactInitData) {
                            contactData.contact_id = contactInitData.contact_id;
                            contactData.id = contactInitData.id;
                        } else {
                            contactData.contact_id = newContactId;
                            contactData.id =  resp.result[0].success_message.id;
                        }

                        actions.renderContact(contactData, $closestRow, true);
                    });
                });
            });
        },

        bindAddButton: function () {
            var _this = this;
            $j('#add-par-guar-contact, #add-emerg-contact').on('click', function(event) {
                var allPriorities = _this._getAllContactPriorities(_this._getAllContactRows());
                var $target = $j(event.target);
                var $targetButton =  $target.closest('button');
                $targetButton.css({'display': 'none'});
                var addParGuar = $targetButton.attr('id') === 'add-par-guar-contact';
                var buttonTable = addParGuar ? '#parents-guardians-table' : '#emergency-contacts-table';
                var insertSelector = $j(buttonTable).find('tbody tr').last();
                var newRow = $j('<tr></tr>');
                newRow.insertAfter(insertSelector);
                actions.addContact(newRow, addParGuar, allPriorities);
                _this.bindSaveButton(addParGuar);
            });
        }
    };
});