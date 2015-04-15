/*global define, $j, psData*/

define(['actions', 'service', 'underscore'], function (actions, service, _) {
    'use strict';
    return {
        main: function () {
            this.addContactButton();
            this.bindEditButton();
            this.bindAddButton();
            this.bindPreventDefault();
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
                var priorityInt = parseInt(rowData.contactData.priority);
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
                var priorityInt = parseInt(rowData.contactData.contact_id);
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
            $j('#parents-guardians-content').prepend('<button id="add-par-guar-contact" class="add-cont-btn">Add Contact</button>');
            $j('#emergency-contacts-content').prepend('<button id="add-emerg-contact" class="add-cont-btn">Add Contact</button>');

            $j('#parents-guardians-content button, #emergency-contacts-content button').button({
                icons: {
                    primary: 'ui-icon-plus'
                }
            });
            $j('.ui-button-text').css({'color': '#fff'});
        },

        bindPreventDefault: function () {
            $j('.contact-form').on('submit', function(event) {
                event.preventDefault();
            });
        },

        bindEditButton: function () {
            var _this = this;
            $j('body').on('click', '.editcontact', function (event) {
                var $eventTarget = $j(event.target);
                var $parentRow = $eventTarget.closest('tr');

                $eventTarget.parents('.contacts-content').find('.editcontact').hide();
                $eventTarget.parents('.contacts-content').find('.add-cont-btn').hide();

                var contactData = $parentRow.data('contactData');
                actions.editContact(contactData, $parentRow);
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

                var newRow = $j('<tr></tr>');
                $j(buttonTable).find('tbody').prepend(newRow);

                $target.parents('.contacts-content').find('.editcontact').hide();
                $target.parents('.contacts-content').find('.add-cont-btn').hide();

                actions.addContact(newRow, addParGuar, allPriorities);
            });
        }
    };
});