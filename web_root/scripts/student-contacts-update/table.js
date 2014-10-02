/*global define, $j, psData*/

define(['actions'], function (actions) {
    'use strict';
    return {
        main: function () {
            this.addContactButton();
            this.bindEditContact();
        },

        addContactButton: function () {
            //create add contact button, and bind click event handler
            /**
             * @see sDom option in dataTable() initialization.
             */
            $j('#parents-guardians-content, #emergency-contacts-content').prepend('<button>Add Contact</button>');
            $j('#parents-guardians-content button, #emergency-contacts-content button').button({
                icons: {
                    primary: 'ui-icon-plus'
                }
            });
            $j('.ui-button-text').css({'color': '#fff'});
        },

        bindEditContact: function () {
            var _this = this;
            $j('body').on('click', '.editcontact', function (event) {
                var $eventTarget = $j(event.target);
                var $parentRow = $eventTarget.closest('tr');
                var isParGuarContact = $parentRow.closest('#parents-guardians-table').length > 0;
                var contactData = $parentRow.data('contactData');
                actions.editContact(contactData, $parentRow);
                _this.bindSaveButton(isParGuarContact);
            });
        },

        bindSaveButton: function (isParGuarContact) {
            $j('.savecontact').on('click', function (event) {
                var $eventTarget = $j(event.target);
                var $closestRow = $eventTarget.closest('tr');
                var contactData = actions.deserializeContact($closestRow);

                /* If the contactData object is not present in the current row,
                 * this is a new contact, so add extra fields to the contactData object.
                 * @see actions.renderContact
                 */
                var contactInitData = $closestRow.data().contactData;

                var ajaxFunc;
                if (!contactInitData) {
                    contactData.legal_guardian = isParGuarContact;
                    ajaxFunc = actions.saveNewContact(contactData, psData.studentsDcid);

                } else {
                    ajaxFunc = actions.saveUpdateContact(contactData, contactInitData.id);
                }
                ajaxFunc.done(function(resp) {
                    actions.renderContact(contactData, $closestRow);
                });
            });
        }
    };
});