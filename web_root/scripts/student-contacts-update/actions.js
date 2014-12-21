/*global define, $j, psData, loadingDialogInstance*/

define(['service', 'underscore', 'config', 'tableModule', 'parsley'], function (service, _, config, tableModule, parsley) {
    'use strict';
    return {
        main: function () {
            this.loadContacts();
        },

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
            $j.when.apply($j, deferredObjects).then(function (parGuarContacts, parGuarContactsStaging, emergContacts, emergContactsStaging) {
            //$j.when.apply($j, deferredObjects).then(function (parGuarContacts) {

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
                        contactData.contactIsStaging = true;
                        _this.renderContact(contactData, null, true, true);
                    } else {
                        contactData = contact.tables[contactsTableName];
                        contactData.contactIsStaging = false;
                        _this.renderContact(contactData, null, false, true);
                    }
                });

                // Look for new parent/guardian staging records that have no corresponding live records
                $j.each(parGuarContactStagingRecords, function (index, contact) {
                    var contactId = contact.tables[contactsStagingTableName].contact_id;

                    // Does this staging record have a corresponding live-table record?
                    var stagingHasLive = _.filter(_this.contacts.live, function (liveContact) {
                        return liveContact.contact_id === contactId;
                    });

                    // If there were no matches, this is a new contact that is still in the staging table
                    if (stagingHasLive.length === 0) {
                        var contactData = contact.tables[contactsStagingTableName];
                        contactData.contactIsStaging = true;
                        _this.renderContact(contactData, null, true, true);
                    }
                });

                $j.each(emergContactRecords, function (index, contact) {
                    var contactId = contact.tables[contactsTableName].contact_id;
                    _this.contacts.live.push(contact.tables[contactsTableName]);
                    var stagingContact = _this._getStagingContactById(emergContactStagingRecords, contactId);
                    var contactData;
                    if (stagingContact) {
                        contactData = stagingContact.tables[contactsStagingTableName];
                        contactData.contactIsStaging = true;
                        _this.renderContact(contactData, null, true, false);
                    } else {
                        contactData = contact.tables[contactsTableName];
                        contactData.contactIsStaging = false;
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
                        contactData.contactIsStaging = true;
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
            loadingDialogInstance.closeDialog();
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
                    loadingDialogInstance.open();
                    if (ParsleyForm.validationResult) {
                        var $eventTarget = $j(ParsleyForm.$element);

                        $eventTarget.parents('.contacts-content').find('.editcontact').show();
                        $eventTarget.parents('.contacts-content').find('.add-cont-btn').show();

                        var $closestRow = $eventTarget.find('.savecontact').parents('tr');
                        var isParGuarContact = $closestRow.closest('#parents-guardians-table').length > 0;
                        var contactCoreData = _this.deserializeCoreContact($closestRow);
                        var contactEmailData = _this.deserializeEmailContact($closestRow);
                        var contactPhone1Data = _this.deserializePhone1Contact($closestRow);
                        var contactPhone2Data = _this.deserializePhone2Contact($closestRow);
                        var contactPhone3Data = _this.deserializePhone3Contact($closestRow);

                        var ajaxFunc = [];

                        var stagingContactsAjax = [];

                        // If the row .data() object is not empty, create or update the staging record for the existing live-side contact
                        // If object is empty, this is a new contact (no live side contact, create new staging)
                        if (Object.keys($closestRow.data()).length !== 0) {
                            if (isParGuarContact) {
                                stagingContactsAjax.push(service.getParGuarsStaging({studentsdcid: psData.studentsDcid}));
                                stagingContactsAjax.push($j.getJSON('data/getEmailStaging.json.html?cdcid=' + $closestRow.data().contactData.contactdcid + '&sdcid=' + $closestRow.data().contactData.studentsdcid));
                                stagingContactsAjax.push($j.getJSON('data/getPhoneStaging.json.html?cdcid=' + $closestRow.data().contactData.contactdcid + '&sdcid=' + $closestRow.data().contactData.studentsdcid));
                            } else {
                                stagingContactsAjax.push(service.getEmergContsStaging({studentsdcid: psData.studentsDcid}));
                                stagingContactsAjax.push($j.getJSON('data/getEmailStaging.json.html?cdcid=' + $closestRow.data().contactData.contactdcid + '&sdcid=' + $closestRow.data().contactData.studentsdcid));
                                stagingContactsAjax.push($j.getJSON('data/getPhoneStaging.json.html?cdcid=' + $closestRow.data().contactData.contactdcid + '&sdcid=' + $closestRow.data().contactData.studentsdcid));
                            }

                            // Get all staging contacts for this student
                            $j.when.apply($j, stagingContactsAjax).done(function (stagingContacts, emailStaging, phoneStaging) {

                                var contactInitData = $closestRow.data().contactData;
                                var stagingRecordId;
                                var stagingEmailRecordId;
                                var stagingPhone1RecordId;
                                var stagingPhone2RecordId;
                                var stagingPhone3RecordId;

                                phoneStaging[0].pop();


                                if (contactInitData) {
                                    var stagingTableName = stagingContacts[0].name.toLowerCase();
                                    _.each(stagingContacts[0].record, function (contact) {
                                        if (contactInitData.contact_id === contact.tables[stagingTableName].contact_id) {
                                            stagingRecordId = contactInitData.id;
                                            stagingEmailRecordId = emailStaging[0].id;
                                            stagingPhone1RecordId = phoneStaging[0][0].id;
                                            stagingPhone2RecordId = phoneStaging[0][1].id;
                                            stagingPhone3RecordId = phoneStaging[0][2].id;
                                        }
                                    });
                                }

                                /* If the contactCoreData object is not present in the current row,
                                 * this is a new contact.
                                 * @see actions.renderContact
                                 */
                                // If the parent is updating an existing staging record
                                if (stagingRecordId) {
                                    // since the staging record is already created, we already know the stagingcontactDcid, so all update requests
                                    // can be sent simultaneously
                                    ajaxFunc.push(_this.updateStagingContact(contactCoreData, stagingRecordId));
                                    ajaxFunc.push(_this.updateEmailStagingContact(contactEmailData, stagingEmailRecordId));
                                    ajaxFunc.push(_this.updatePhoneStagingContact(contactPhone1Data, stagingPhone1RecordId));
                                    ajaxFunc.push(_this.updatePhoneStagingContact(contactPhone2Data, stagingPhone2RecordId));
                                    ajaxFunc.push(_this.updatePhoneStagingContact(contactPhone3Data, stagingPhone3RecordId));

                                    $j.when.apply(ajaxFunc).done(function (contactCoreDataResp, contactEmailDataResp, contactPhoneDataResp) {
                                        if (contactInitData) {
                                            contactCoreData.contact_id = contactInitData.contact_id;
                                            contactCoreData.id = contactInitData.id;
                                        } else {
                                            contactCoreData.contact_id = newContactId;
                                            contactCoreData.id = contactCoreDataResp.result[0].success_message.id;
                                        }

                                        _this.renderContact(contactCoreData, $closestRow, true);
                                    });

                                    // If the contact exists, but there is no staging contact to update,
                                    // so create new staging records for the existing (live side) contact
                                } else if (contactInitData) {
                                    // Since the contact staging record is not yet created, create the main staging record before creating the email/phone records after the contact
                                    // because we don't yet know the new contact record's id/contactdcid
                                    _this.newStagingContact(contactCoreData, psData.studentsDcid, isParGuarContact, contactInitData.contact_id).done(function (newContactStagingResp) {
                                        var newStagingContactDcid = newContactStagingResp.newContactStagingDcid;
                                        ajaxFunc.push(_this.newEmailStagingContact(contactEmailData, psData.studentsDcid, newStagingContactDcid));
                                        ajaxFunc.push(_this.newPhoneStagingContact(contactPhone1Data, psData.studentsDcid, newStagingContactDcid));
                                        ajaxFunc.push(_this.newPhoneStagingContact(contactPhone2Data, psData.studentsDcid, newStagingContactDcid));
                                        ajaxFunc.push(_this.newPhoneStagingContact(contactPhone3Data, psData.studentsDcid, newStagingContactDcid));

                                        $j.when.apply($j, ajaxFunc).done(function (contactCoreDataResp, contactEmailDataResp, contactPhoneDataResp) {
                                            if (contactInitData) {
                                                contactCoreData.contact_id = contactInitData.contact_id;
                                                contactCoreData.id = contactInitData.id;
                                            } else {
                                                contactCoreData.contact_id = newContactId;
                                                contactCoreData.id = contactCoreDataResp.result[0].success_message.id;
                                            }

                                            _this.renderContact(contactCoreData, $closestRow, true);
                                        });
                                    });
                                }
                            });
                        } else {
                            // Create a new staging record for a new live-side contact
                            // newContactId.json.html finds the highest, unused contact_id for the new staging contact
                            $j.getJSON('data/newContactId.json.html?sdcid=' + psData.studentsDcid, function(newContactIdResp) {
                                _this.newStagingContact(contactCoreData, psData.studentsDcid, isParGuarContact, newContactIdResp.contactnumber).done(function (newContactStagingResp) {
                                    var newStagingContactDcid = newContactStagingResp.newContactStagingDcid;
                                    ajaxFunc.push(_this.newEmailStagingContact(contactEmailData, psData.studentsDcid , newStagingContactDcid));
                                    ajaxFunc.push(_this.newPhoneStagingContact(contactPhone1Data, psData.studentsDcid, newStagingContactDcid));
                                    ajaxFunc.push(_this.newPhoneStagingContact(contactPhone2Data, psData.studentsDcid, newStagingContactDcid));
                                    ajaxFunc.push(_this.newPhoneStagingContact(contactPhone3Data, psData.studentsDcid, newStagingContactDcid));

                                    $j.when.apply($j, ajaxFunc).done(function (contactCoreDataResp, contactEmailDataResp, contactPhoneDataResp) {
                                        contactCoreData.id = contactCoreDataResp[0].result[0].success_message.id;
                                        _this.renderContact(contactCoreData, $closestRow, true);
                                    });
                                });
                            });
                        }
                    }
                });
            });
        },

        /**
         *
         * @param contactData {Object} - passed in from table-module by accessing the row.data() object
         * @param row {jQuery}
         */
        editContact: function (contactData, row) {
            var allContacts = this.contacts.live.concat(this.contacts.staging);
            var numOfContacts = _.uniq(_.pluck(allContacts, 'contact_id')).length;
            var editContactTemplate = $j('#edit-contact-template').html();
            var _this = this;

            var emailJsonUrl;
            var phoneJsonUrl;

            if (contactData.contactIsStaging) {
                emailJsonUrl = 'data/getEmailStaging.json.html?cdcid=' + contactData.id + '&sdcid=' + contactData.studentsdcid;
                phoneJsonUrl = 'data/getPhoneStaging.json.html?cdcid=' + contactData.id + '&sdcid=' + contactData.studentsdcid;
            } else {
                emailJsonUrl = 'data/getEmail.json.html?cdcid=' + contactData.id + '&sdcid=' + contactData.studentsdcid;
                phoneJsonUrl = 'data/getPhone.json.html?cdcid=' + contactData.id + '&sdcid=' + contactData.studentsdcid;
            }

            $j.getJSON(emailJsonUrl, function(email) {
                $j.getJSON(phoneJsonUrl, function(phone) {
                    phone.pop();
                    var context = {
                        'numOfContacts': numOfContacts,
                        'contact': contactData,
                        'email': email,
                        'phone': phone
                    };
                    var renderedTemplate = _.template(editContactTemplate, context);
                    $j(row).html('').html(renderedTemplate);

                    $j(row).data({'email': email});
                    $j(row).data({'phone': phone});


                    $j('button.cancelcontact').on('click', function (event) {
                        var $eventTarget = $j(event.target);
                        var isParGuar = !!$eventTarget.parents('#parents-guardians-table').length;
                        $eventTarget.parents('.contacts-content').find('.editcontact').show();
                        $eventTarget.parents('.contacts-content').find('.add-cont-btn').show();
                        $eventTarget.parents('form').parsley().destroy();
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
                        if (phone.length > 0) {
                            if ($option.val() === phone[0].phone_type) {
                                $option.attr({'selected': 'selected'});
                            }
                        }
                    });

                    // Set the correct option in the phone2type drop down to be selected.
                    _.each($j('#phone2type option'), function (option) {
                        var $option = $j(option);
                        if (phone.length > 1) {
                            if ($option.val() === phone[1].phone_type) {
                                $option.attr({'selected': 'selected'});
                            }
                        }
                    });

                    // Set the correct option in the phone3type drop down to be selected.
                    _.each($j('#phone3type option'), function (option) {
                        var $option = $j(option);
                        if (phone.length > 2) {
                            if ($option.val() === phone[2].phone_type) {
                                $option.attr({'selected': 'selected'});
                            }
                        }
                    });
                    _this.setupParsley();

                });
            });

        },

        /**
         * Create an object with the data in the edit contact form
         * @param row {jQuery}
         */
        deserializeCoreContact: function (row) {
            return {
                employer: row.find('#employer').val(),
                first_name: row.find('#first-name').val(),
                last_name: row.find('#last-name').val(),
                mailing_city: row.find('#mailing-city').val(),
                mailing_state: row.find('#mailing-state').val(),
                mailing_street: row.find('#mailing-street').val(),
                mailing_zip: row.find('#mailing-zip').val(),
                priority: row.find('#priority').val(),
                relationship: row.find('#relationship').val(),
                residence_city: row.find('#residence-city').val(),
                residence_state: row.find('#residence-state').val(),
                residence_street: row.find('#residence-street').val(),
                residence_zip: row.find('#residence-zip').val()
            };
        },

        /**
         * Create an object with the data in the edit contact form
         * @param row {jQuery}
         */
        deserializeEmailContact: function (row) {
            return {
                email_address: row.find('#email').val(),
                opts_high_priority: row.find('#email-opts-high-priority').is(':checked') ? "1" : "0",
                opts_general: row.find('#email-opts-general').is(':checked') ? "1" : "0",
                opts_attendance: row.find('#email-opts-attendance').is(':checked') ? "1" : "0",
                opts_survey: row.find('#email-opts-survey').is(':checked') ? "1" : "0"
            };
        },

        /**
         * Create an object with the data in the edit contact form
         * @param row {jQuery}
         */
        deserializePhone1Contact: function (row) {
            return {
                phone_number: row.find('#phone1').val(),
                phone_type: row.find('#phone1type').val(),
                phone_priority: "1",
                opts_voice_high_priority: row.find('#phone1-opts-voice-high-priority').is(':checked') ? "1" : "0",
                opts_voice_general: row.find('#phone1-opts-voice-general').is(':checked') ? "1" : "0",
                opts_voice_attendance: row.find('#phone1-opts-voice-attendance').is(':checked') ? "1" : "0",
                opts_voice_survey: row.find('#phone1-opts-voice-high-survey').is(':checked') ? "1" : "0",
                opts_text_high_priority: row.find('#phone1-opts-text-high-priority').is(':checked') ? "1" : "0",
                opts_text_general: row.find('#phone1-opts-text-general').is(':checked') ? "1" : "0",
                opts_text_attendance: row.find('#phone1-opts-text-attendance').is(':checked') ? "1" : "0",
                opts_text_survey: row.find('#phone1-opts-text-high-survey').is(':checked') ? "1" : "0"
            };
        },

        /**
         * Create an object with the data in the edit contact form
         * @param row {jQuery}
         */
        deserializePhone2Contact: function (row) {
            return {
                phone_number: row.find('#phone2').val(),
                phone_type: row.find('#phone2type').val(),
                phone_priority: "2",
                opts_voice_high_priority: row.find('#phone2-opts-voice-high-priority').is(':checked') ? "1" : "0",
                opts_voice_general: row.find('#phone2-opts-voice-general').is(':checked') ? "1" : "0",
                opts_voice_attendance: row.find('#phone2-opts-voice-attendance').is(':checked') ? "1" : "0",
                opts_voice_survey: row.find('#phone2-opts-voice-high-survey').is(':checked') ? "1" : "0",
                opts_text_high_priority: row.find('#phone2-opts-text-high-priority').is(':checked') ? "1" : "0",
                opts_text_general: row.find('#phone2-opts-text-general').is(':checked') ? "1" : "0",
                opts_text_attendance: row.find('#phone2-opts-text-attendance').is(':checked') ? "1" : "0",
                opts_text_survey: row.find('#phone2-opts-text-high-survey').is(':checked') ? "1" : "0"
            };
        },

        /**
         * Create an object with the data in the edit contact form
         * @param row {jQuery}
         */
        deserializePhone3Contact: function (row) {
            return {
                phone_number: row.find('#phone3').val(),
                phone_type: row.find('#phone3type').val(),
                phone_priority: "3",
                opts_voice_high_priority: row.find('#phone3-opts-voice-high-priority').is(':checked') ? "1" : "0",
                opts_voice_general: row.find('#phone3-opts-voice-general').is(':checked') ? "1" : "0",
                opts_voice_attendance: row.find('#phone3-opts-voice-attendance').is(':checked') ? "1" : "0",
                opts_voice_survey: row.find('#phone3-opts-voice-high-survey').is(':checked') ? "1" : "0",
                opts_text_high_priority: row.find('#phone3-opts-text-high-priority').is(':checked') ? "1" : "0",
                opts_text_general: row.find('#phone3-opts-text-general').is(':checked') ? "1" : "0",
                opts_text_attendance: row.find('#phone3-opts-text-attendance').is(':checked') ? "1" : "0",
                opts_text_survey: row.find('#phone3-opts-text-high-survey').is(':checked') ? "1" : "0"
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
         * @param contactData {Object}
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updateEmailStagingContact: function (contactData, contactRecordId) {
            var studentContactsStagingTable = config.studentContactsEmailStagingTable;
            var requestObj = {
                name: config.studentContactsEmailStagingTable,
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);
            return service.updateEmailStagingContact(jsonContactData, contactRecordId);
        },

        /**
         * @param contactData {Object}
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updatePhoneStagingContact: function (contactData, contactRecordId) {
            var studentContactsStagingTable = config.studentContactsPhoneStagingTable;
            var requestObj = {
                name: config.studentContactsPhoneStagingTable,
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);
            return service.updatePhoneStagingContact(jsonContactData, contactRecordId);
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
            contactData.contact_id = contactId.toString();
            contactData.status = "0";
            var studentContactsStagingTable = config.studentContactsStagingTable;
            var requestObj = {
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);

            // Set the new staging contact's contactdcid to the id of the record.
            return service.newStagingContact(jsonContactData).then(function(newContactResp) {
                var contactDcidData = {
                    contactdcid: newContactResp.result[0].success_message.id.toString()
                };
                var studentContactsStagingTable = config.studentContactsStagingTable.toLowerCase();
                var requestObj = {
                    tables: {}
                };
                requestObj.tables[studentContactsStagingTable] = contactDcidData;
                var jsonContactData = JSON.stringify(requestObj);
                return service.setStagingContactDcid(jsonContactData, newContactResp.result[0].success_message.id).then(function(resp) {
                    return {
                        'newContactStagingDcid': resp.result[0].success_message.id.toString()
                    }
                });
            });
        },

        setStagingContactDcid: function (contactData) {

            var studentContactsStagingTable = config.studentContactsStagingTable;
            var requestObj = {
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);
            return service.setStagingContactDcid(jsonContactData);
        },

        /**
         *
         * @param contactData {Object}
         * @param studentsDcid {Number}
         * @param contactDcid {String} - contactdcid of the new contact staging record
         */
        newEmailStagingContact: function (contactData, studentsDcid, contactDcid) {
            contactData.contactdcid = contactDcid;
            contactData.studentsdcid = studentsDcid;
            var studentContactsStagingTable = config.studentContactsEmailStagingTable;
            var requestObj = {
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);
            return service.newEmailStagingContact(jsonContactData);
        },

        /**
         *
         * @param contactData {Object}
         * @param studentsDcid {Number}
         * @param contactDcid {String} - contactdcid of the new contact staging record
         */
        newPhoneStagingContact: function (contactData, studentsDcid, contactDcid) {
            contactData.contactdcid = contactDcid;
            contactData.studentsdcid = studentsDcid;
            var studentContactsStagingTable = config.studentContactsPhoneStagingTable;
            var requestObj = {
                tables: {}
            };
            requestObj.tables[studentContactsStagingTable] = contactData;
            var jsonContactData = JSON.stringify(requestObj);
            return service.newPhoneStagingContact(jsonContactData);
        }
    };
});