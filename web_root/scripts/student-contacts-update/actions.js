/*global define, $j, psData, loadingDialogInstance*/

define(['service', 'underscore', 'config', 'tableModule', 'parsley'], function (service, _, config, tableModule, parsley) {
    'use strict';
    return {
        main: function () {
            this.loadContacts();
        },

        /**
         * @type Object[]
         */
        _contactsCollection: [],

        /**
         * @param stagingContacts {Object}
         * @param contactId {String}
         * @private
         * @returns {Object|Boolean}
         */
        _getStagingContactById: function (stagingContacts, contactId) {
            var contactsStagingTableName = config.studentContactsStagingTable.toLowerCase();
            var idMatches = _.filter(stagingContacts, function (contact) {
                return contact.tables[contactsStagingTableName].contact_id === contactId;
            });
            if (idMatches.length === 1) {
                return idMatches[0];
            } else {
                return false;
            }
        },

        _addRowColorClasses: function () {
            var oddRows = $j('tr.contact:odd');
            oddRows.addClass('oddRow');
            _.each(oddRows, function (row) {
                var $row = $j(row);
                if ($row.prev().attr('class') === 'contact-update-msg') {
                    $row.prev().addClass('oddRow');
                }
            });
        },

        /**
         *
         * @param {jQuery} row
         * @private
         */
        _renderUpdateMessage: function (row) {
            var updatedTemplate = $j($j('#contact-updated-template').html());
            updatedTemplate.insertBefore(row);
        },

        /**
         * @return {Array}
         */
        loadContacts: function () {
            this.contacts = {};
            this.contacts.live = [];
            this.contacts.staging = [];

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

                // This probably doesn't need to be separated by parGuar/emerg contact.
                // In the future, separate this just by staging/live table.
                var contactsTableName = parGuarContacts[0].name.toLowerCase();
                var contactsStagingTableName = parGuarContactsStaging[0].name.toLowerCase();

                var parGuarContactRecords = parGuarContacts[0].record;
                var parGuarContactStagingRecords = parGuarContactsStaging[0].record;

                var emergContactRecords = emergContacts[0].record;
                var emergContactStagingRecords = emergContactsStaging[0].record;

                $j.each(parGuarContactRecords, function (index, contact) {
                    var contactId = contact.tables[contactsTableName].contact_id;
                    _this.contacts.live.push(contact.tables[contactsTableName]);
                    var stagingContact = _this._getStagingContactById(parGuarContactStagingRecords, contactId);
                    var contactData;
                    if (stagingContact) {
                        contactData = stagingContact.tables[contactsStagingTableName];
                        _this.renderContact(contactData, null, true, true);
                    } else {
                        contactData = contact.tables[contactsTableName];
                        _this.renderContact(contactData, null, false, true);
                    }
                });

                $j.each(emergContactRecords, function (index, contact) {
                    var contactId = contact.tables[contactsTableName].contact_id;
                    _this.contacts.live.push(contact.tables[contactsTableName]);
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

                // Look for new staging records that have no corresponding live records
                $j.each(emergContactStagingRecords, function (index, contact) {
                    var contactId = contact.tables[contactsStagingTableName].contact_id;

                    // Does this staging record have a corresponding live-table record?
                    var stagingHasLive = _.filter(_this.contacts.live, function (liveContact) {
                        return liveContact.contact_id === contactId;
                    });

                    // If there were no matches, this is a new contact that is still in the staging table
                    if (stagingHasLive.length === 0) {
                        var contactData = contact.tables[contactsStagingTableName];
                        _this.renderContact(contactData, null, true, false);
                    }
                });

                $j.each(parGuarContactStagingRecords, function (index, contact) {
                    _this.contacts.staging.push(contact.tables[contactsStagingTableName]);
                });

                $j.each(emergContactStagingRecords, function (index, contact) {
                    _this.contacts.staging.push(contact.tables[contactsStagingTableName]);
                });

                loadingDialogInstance.forceClose();

                _this._addRowColorClasses();
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

            if (contactData.phone1type) {
                contactData.phone1type = contactData.phone1type.charAt(0).toUpperCase() + contactData.phone1type.slice(1);
            }
            if (contactData.phone2type) {
                contactData.phone2type = contactData.phone2type.charAt(0).toUpperCase() + contactData.phone2type.slice(1);
            }
            if (contactData.phone3type) {
                contactData.phone3type = contactData.phone3type.charAt(0).toUpperCase() + contactData.phone3type.slice(1);
            }
            var renderedTemplate = _.template(contactTemplate, {'contact': contactData});

            if (!row) {
                row = $j('<tr class="contact">' + renderedTemplate + '</tr>');
                if (isParGuar) {
                    $j('#parents-guardians-table tbody').append(row);
                } else {
                    $j('#emergency-contacts-table tbody').append(row);
                }
            } else {
                row.html('').html(renderedTemplate);
            }


            var prevElem = row.prev();

            if (prevElem.length) {
                // If there is a previous element, this is not the first contact in the table.
                var prevClass = prevElem.attr('class');

                if (prevClass) {
                    if (showUpdateMsg && prevClass.indexOf('contact-update-msg') === -1) {
                        this._renderUpdateMessage(row);
                    }
                }

            } else if (showUpdateMsg) {
                // This is the first row without the update message before it, so only check if the update message needs to be shown
                this._renderUpdateMessage(row);
            }

            //var newRow = $j('#parents-guardians-table tr').last();
            row.data({'contactData': contactData});
        },

        /**
         *
         * @param contactId {Number|String}
         */
        setupParsley: function () {
            window.ParsleyValidator
                .addValidator('resaddress', function (value) {
                    /**
                     *
                     * @type {boolean}
                     */
                    var resFieldsEmpty = $j('#residence-street').val() === "" &&
                        $j('#residence-city').val() === "" &&
                        $j('#residence-state').val() === "" &&
                        $j('#residence-zip').val() === "";
                    if (resFieldsEmpty) {
                        return true;
                    } else {
                        return !!value;
                    }

                }, 100)
                .addMessage('en', 'resaddress', 'Partial address not allowed, please complete residence address.');

            window.ParsleyValidator
                .addValidator('mailaddress', function (value) {
                    /**
                     *
                     * @type {boolean}
                     */
                    var mailFieldsEmpty = $j('#mailing-street').val() === "" &&
                        $j('#mailing-city').val() === "" &&
                        $j('#mailing-state').val() === "" &&
                        $j('#mailing-zip').val() === "";
                    if (mailFieldsEmpty) {
                        return true;
                    } else {
                        return !!value;
                    }

                }, 100)
                .addMessage('en', 'mailaddress', 'Partial address not allowed, please complete mailing address.');

            window.ParsleyValidator
                .addValidator('onephonereq', function (value) {
                    /**
                     *
                     * @type {boolean}
                     */
                    var allPhonesEmpty = $j('#phone1type').val() === "" &&
                        $j('#phone1').val() === "" &&
                        $j('#phone2type').val() === "" &&
                        $j('#phone2').val() === "" &&
                        $j('#phone3type').val() === "" &&
                        $j('#phone3').val() === "";

                    if (allPhonesEmpty) {
                        return false;
                    } else {
                        return true;
                    }

                }, 100)
                .addMessage('en', 'onephonereq', 'At least one phone number is required.');

            window.ParsleyValidator
                .addValidator('phone1num', function (value) {
                    if ($j('#phone1type').val() === "" && $j('#phone1').val() === "") {
                        return true;
                    } else if ($j('#phone1type').val() !== "" && $j('#phone1').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone1num', 'Phone type was given, number is required.');

            window.ParsleyValidator
                .addValidator('phone1type', function (value) {
                    if ($j('#phone1type').val() === "" && $j('#phone1').val() === "") {
                        return true;
                    } else if ($j('#phone1').val() !== "" && $j('#phone1type').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone1type', 'Phone number was given, type is required.');

            window.ParsleyValidator
                .addValidator('phone2num', function (value) {
                    if ($j('#phone2type').val() === "" && $j('#phone2').val() === "") {
                        return true;
                    } else if ($j('#phone2type').val() !== "" && $j('#phone2').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone2num', 'Phone type was given, number is required.');

            window.ParsleyValidator
                .addValidator('phone2type', function (value) {
                    if ($j('#phone2type').val() === "" && $j('#phone2').val() === "") {
                        return true;
                    } else if ($j('#phone2').val() !== "" && $j('#phone2type').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone2type', 'Phone number was given, type is required.');

            window.ParsleyValidator
                .addValidator('phone3num', function (value) {
                    if ($j('#phone3type').val() === "" && $j('#phone3').val() === "") {
                        return true;
                    } else if ($j('#phone3type').val() !== "" && $j('#phone3').val() === "") {
                        return false;
                    } else {
                        return true;
                    }
                }, 100)
                .addMessage('en', 'phone3num', 'Phone type was given, number is required.');

            window.ParsleyValidator
                .addValidator('phone3type', function (value) {
                    if ($j('#phone3type').val() === "" && $j('#phone3').val() === "") {
                        return true;
                    } else if ($j('#phone3').val() !== "" && $j('#phone3type').val() === "") {
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

            var parsley = $j('.contact-form').parsley({
                // bootstrap form classes
                errorsWrapper: '<span class=\"help-block\" style="display: block;white-space: normal;word-wrap: break-word;"></span>',
                errorTemplate: '<span class="error-message"></span>',
                excluded: ':hidden'
            });

            var _this = this;

            _.each(parsley, function (parsleyElem) {
                parsleyElem.subscribe('parsley:form:validated', function (ParsleyForm) {
                    if (ParsleyForm.validationResult) {
                        var $eventTarget = $j(event.target);

                        $eventTarget.parents('.contacts-content').find('.editcontact').show();
                        $eventTarget.parents('.contacts-content').find('.add-cont-btn').show();

                        var $closestRow = $eventTarget.find('.savecontact').parents('tr');
                        var isParGuarContact = $closestRow.closest('#parents-guardians-table').length > 0;
                        var contactData = _this.deserializeContact($closestRow);

                        var newPriority = parseInt($('#priority').val());
                        var oldPriority = parseInt(contactsCollection[contactId][1].priority);
                        if (newPriority !== oldPriority) {
                            // First priority contact is getting changed.
                            if (newPriority > oldPriority) {
                                $.each(contactsCollection, function (index, contact) {
                                    if (parseInt(contact[1].priority) > parseInt(oldPriority) && parseInt(contact[1].priority) <= parseInt(newPriority)) {
                                        var postData = {
                                            name: 'u_student_contacts6',
                                            tables: {
                                                'u_student_contacts6': {
                                                    priority: (parseInt(contact[1].priority) - 1).toString()
                                                }
                                            }
                                        };
                                        saveContact(postData, contact[1].record_id).done(function () {
                                            // Find the rows that were updated and refresh them
                                            // Get all rows that contain a td with a p element (only contact rows have this)
                                            var tableRows = $('tr:has("td p")');
                                            var updatedRow;
                                            $.each(tableRows, function (index, tableRow) {
                                                var rowContactId = m_table.fnGetData(tableRow)[m_keyindex];
                                                if (rowContactId === contact[0]) {
                                                    updatedRow = tableRow;
                                                }
                                                if (updatedRow) {
                                                    refreshContact(rowContactId, updatedRow);
                                                }
                                                updatedRow = null;
                                            });
                                        });
                                    }


                                });
                            } else if (newPriority < oldPriority) {
                                $.each(contactsCollection, function (index, contact) {
                                    if (parseInt(contact[1].priority) < parseInt(oldPriority) && parseInt(contact[1].priority) >= parseInt(newPriority)) {
                                        var postData = {
                                            name: 'u_student_contacts6',
                                            tables: {
                                                'u_student_contacts6': {
                                                    priority: (parseInt(contact[1].priority) + 1).toString()
                                                }
                                            }
                                        };
                                        saveContact(postData, contact[1].record_id).done(function () {
                                            // Find the rows that were updated and refresh them
                                            // Get all rows that contain a td with a p element (only contact rows have this)
                                            var tableRows = $('tr:has("td p")');
                                            var updatedRow;
                                            $.each(tableRows, function (index, tableRow) {
                                                var rowContactId = m_table.fnGetData(tableRow)[m_keyindex];
                                                if (rowContactId === contact[0]) {
                                                    updatedRow = tableRow;
                                                }
                                                if (updatedRow) {
                                                    refreshContact(rowContactId, updatedRow);
                                                }
                                                updatedRow = null;
                                            });
                                        });
                                    }
                                });
                            }
                        }

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
                                ajaxFunc = _this.updateStagingContact(contactData, stagingRecordId);
                            } else if (contactInitData) {
                                ajaxFunc = _this.newStagingContact(contactData, psData.studentsDcid, isParGuarContact, contactInitData.contact_id);
                            } else {
                                var largestContactId;
                                if (window.allContactIds.length > 0) {
                                    largestContactId = window.allContactIds[window.allContactIds.length - 1];
                                } else {
                                    largestContactId = 1;
                                }
                                var newContactId = largestContactId + 1;
                                newContactId = newContactId.toString();
                                ajaxFunc = _this.newStagingContact(contactData, psData.studentsDcid, isParGuarContact, newContactId);
                            }

                            ajaxFunc.done(function (resp) {
                                if (contactInitData) {
                                    contactData.contact_id = contactInitData.contact_id;
                                    contactData.id = contactInitData.id;
                                } else {
                                    contactData.contact_id = newContactId;
                                    contactData.id = resp.result[0].success_message.id;
                                }

                                _this.renderContact(contactData, $closestRow, true);
                            });
                        });
                    }
                });
            });
        },

        /**
         *
         * @param contactData {Object}
         * @param row {jQuery}
         */
        editContact: function (contactData, row) {
            var allContacts = this.contacts.live.concat(this.contacts.staging);
            var numOfContacts = _.uniq(_.pluck(allContacts, 'contact_id')).length;
            var editContactTemplate = $j('#edit-contact-template').html();
            var context = {
                'numOfContacts': numOfContacts,
                'contact': contactData
            };
            var renderedTemplate = _.template(editContactTemplate, context);
            $j(row).html('').html(renderedTemplate);

            this.setupParsley();

            var _this = this;
            $j('button.cancelcontact').on('click', function (event) {
                var $eventTarget = $j(event.target);
                var isParGuar = !!$eventTarget.parents('#parents-guardians-table').length;
                $eventTarget.parents('.contacts-content').find('.editcontact').show();
                $eventTarget.parents('.contacts-content').find('.add-cont-btn').show();
                _this.renderContact(contactData, row, false, isParGuar);
            });

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
                if ($option.val() === contactData.residence_state) {
                    $option.attr({'selected': 'selected'});
                }
            });

            // Set the correct option in the mailing state drop down to be selected.
            _.each($j('#mailing-state option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.mailing_state) {
                    $option.attr({'selected': 'selected'});
                }
            });

            // Set the correct option in the phone1type drop down to be selected.
            _.each($j('#phone1type option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.phone1type) {
                    $option.attr({'selected': 'selected'});
                }
            });

            // Set the correct option in the phone2type drop down to be selected.
            _.each($j('#phone2type option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.phone2type) {
                    $option.attr({'selected': 'selected'});
                }
            });

            // Set the correct option in the phone3type drop down to be selected.
            _.each($j('#phone3type option'), function (option) {
                var $option = $j(option);
                if ($option.val() === contactData.phone3type) {
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

        addContact: function (row, isParGuar, allPriorities) {
            var numSelector = isParGuar ? '#parents-guardians-table' : '#emergency-contacts-table';
            var allContacts = this.contacts.live.concat(this.contacts.staging);
            // Add 1 to the length to account for the new contact
            var numOfContacts = _.uniq(_.pluck(allContacts, 'contact_id')).length + 1;

            // Add 1 to stop int so the last number is included in the array.
            var numRange = _.range(1, numOfContacts + 1);
            var unusedPriorities = _.difference(numRange, allPriorities);
            var newContactTemplate = $j('#new-contact-template').html();
            var renderedTemplate = _.template(newContactTemplate, {unusedPriorities: unusedPriorities});
            $j(row).html('').html(renderedTemplate);

            this.setupParsley();

            var _this = this;
            $j('button.cancelcontact').on('click', function (event) {
                var $eventTarget = $j(event.target);
                var isParGuar = !!$eventTarget.parents('#parents-guardians-table').length;
                $eventTarget.parents('.contacts-content').find('.editcontact').show();
                $eventTarget.parents('.contacts-content').find('.add-cont-btn').show();
                $eventTarget.parents('tr').remove();
            });
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