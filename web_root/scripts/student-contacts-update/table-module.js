/*global define, $j, psData*/

define(['actions', 'service', 'underscore'], function (actions, service, _) {
    'use strict';
    return {
        main: function () {
            this.addContactButton();
            this.bindEditButton();
            this.bindAddButton();
            this.setupParsley();
        },

        /**
         * Extract all priorities from the DOM
         * @param contactRows {jQuery}
         * @returns {String[]}
         * @private
         */
        _getAllContactPriorities: function (contactRows) {
            var allPriorities = [];
            _.each(contactRows, function (contactRow) {
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
            _.each(contactRows, function (contactRow) {
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
            $j('.editcontact').hide();
            //create add contact button, and bind click event handler
            /**
             * @see sDom option in dataTable() initialization.
             */
            $j('#parents-guardians-content').prepend('<button id="add-par-guar-contact" class="add-cont-btn">Add Contact</button>');
            $j('#emergency-contacts-content').prepend('<button id="add-emerg-contact" class="add-cont-btn">Add Contact</button>');

            $j('#parents-guardians-content button, #emergency-contacts-content button').button({
                icons: {
                    primary: 'ui-icon-plus'
                }
            });
            $j('.ui-button-text').css({'color': '#fff'});
        },

        bindEditButton: function () {
            $j('.editcontact').hide();
            var _this = this;
            $j('body').on('click', '.editcontact', function (event) {
                var $eventTarget = $j(event.target);
                var $parentRow = $eventTarget.closest('tr');

                $eventTarget.parents('.contacts-content').find('.editcontact').hide();
                $eventTarget.parents('.contacts-content').find('.add-cont-btn').hide();

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
                $eventTarget.parents('.contacts-content').find('.editcontact').show();
                $eventTarget.parents('.contacts-content').find('.add-cont-btn').show();
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
                            contactData.id = resp.result[0].success_message.id;
                        }

                        actions.renderContact(contactData, $closestRow, true);
                    });
                });
            });
        },

        bindAddButton: function () {
            var _this = this;
            $j('#add-par-guar-contact, #add-emerg-contact').on('click', function (event) {
                var allPriorities = _this._getAllContactPriorities(_this._getAllContactRows());
                var $target = $j(event.target);
                var $targetButton = $target.closest('button');
                $targetButton.css({'display': 'none'});
                var addParGuar = $targetButton.attr('id') === 'add-par-guar-contact';
                var buttonTable = addParGuar ? '#parents-guardians-table' : '#emergency-contacts-table';
                var insertSelector = $j(buttonTable).find('tbody tr').last();
                var newRow = $j('<tr></tr>');
                newRow.insertAfter(insertSelector);
                actions.addContact(newRow, addParGuar, allPriorities);
                _this.bindSaveButton(addParGuar);
            });
        },

        setupParsley: function () {
            window.ParsleyValidator
                .addValidator('resaddress', function (value) {
                    /**
                     *
                     * @type {boolean}
                     */
                    var resFieldsEmpty = $('#residence-street').val() === "" &&
                        $('#residence-city').val() === "" &&
                        $('#residence-state').val() === "" &&
                        $('#residence-zip').val() === "";
                    if (resFieldsEmpty) {
                        return true;
                    } else {
                        return !!value;
                    }

                }, 100)
                .addMessage('en', 'resaddress', 'All address fields must be filled in');

            window.ParsleyValidator
                .addValidator('mailaddress', function (value) {
                    /**
                     *
                     * @type {boolean}
                     */
                    var mailFieldsEmpty = $('#mailing-street').val() === "" &&
                        $('#mailing-city').val() === "" &&
                        $('#mailing-state').val() === "" &&
                        $('#mailing-zip').val() === "";
                    if (mailFieldsEmpty) {
                        return true;
                    } else {
                        return !!value;
                    }

                }, 100)
                .addMessage('en', 'mailaddress', 'All address fields must be filled in');

            window.ParsleyValidator
                .addValidator('onephonereq', function (value) {
                    /**
                     *
                     * @type {boolean}
                     */
                    var allPhonesEmpty = $('#phone1type').val() === "" &&
                        $('#phone1').val() === "" &&
                        $('#phone2type').val() === "" &&
                        $('#phone2').val() === "" &&
                        $('#phone3type').val() === "" &&
                        $('#phone3').val() === "";

                    if (allPhonesEmpty) {
                        return false;
                    } else {
                        return true;
                    }

                }, 100)
                .addMessage('en', 'onephonereq', 'At least one phone number is required.');

            window.ParsleyValidator
                .addValidator('phone1num', function (value) {
                    if ($('#phone1type').val() === "" && $('#phone1').val() === "") {
                        return true;
                    } else if ($('#phone1type').val() !== "" && $('#phone1').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone1num', 'Phone type was given, number is required.');

            window.ParsleyValidator
                .addValidator('phone1type', function (value) {
                    if ($('#phone1type').val() === "" && $('#phone1').val() === "") {
                        return true;
                    } else if ($('#phone1').val() !== "" && $('#phone1type').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone1type', 'Phone number was given, type is required.');

            window.ParsleyValidator
                .addValidator('phone2num', function (value) {
                    if ($('#phone2type').val() === "" && $('#phone2').val() === "") {
                        return true;
                    } else if ($('#phone2type').val() !== "" && $('#phone2').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone2num', 'Phone type was given, number is required.');

            window.ParsleyValidator
                .addValidator('phone2type', function (value) {
                    if ($('#phone2type').val() === "" && $('#phone2').val() === "") {
                        return true;
                    } else if ($('#phone2').val() !== "" && $('#phone2type').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone2type', 'Phone number was given, type is required.');

            window.ParsleyValidator
                .addValidator('phone3num', function (value) {
                    if ($('#phone3type').val() === "" && $('#phone3').val() === "") {
                        return true;
                    } else if ($('#phone3type').val() !== "" && $('#phone3').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone3num', 'Phone type was given, number is required.');

            window.ParsleyValidator
                .addValidator('phone3type', function (value) {
                    if ($('#phone3type').val() === "" && $('#phone3').val() === "") {
                        return true;
                    } else if ($('#phone3').val() !== "" && $('#phone3type').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone3type', 'Phone number was given, type is required.');

            window.ParsleyValidator
                .addValidator('phonelength', function (value) {
                    var valLength = value.split("_").join("").length;
                    return valLength === 12 || valLength === 0;
                }, 100)
                .addMessage('en', 'phonelength', 'Please completely fill in this phone number.');

            $j('#contact-form').parsley({
                // bootstrap form classes
                errorsWrapper: '<span class=\"help-block\" style="display: block;white-space: normal;word-wrap: break-word;"></span>',
                errorTemplate: '<span class="error-message"></span>',
                excluded: ':hidden'
            });
        }
    };
});