/*global define, $j*/

define(['config'], function(config) {
    'use strict';
    return {
        getParGuars: function (options) {
            return $j.getJSON(config.psApi + '/dbe/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1');
        },
        getParGuarsStaging: function (options) {
            return $j.getJSON(config.psApi + '/dbe/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1');
        },
        getEmergConts: function (options) {
            return $j.getJSON(config.psApi + '/dbe/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0');
        },
        getEmergContsStaging: function (options) {
            return $j.getJSON(config.psApi + '/dbe/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0');
        },

        /**
         * Get all parent-guardian contacts for a student that have been approved.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        /*
        getParGuars: function (options) {

            return $j.getJSON(config.psApi + '/dbe/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1')
                .then(function(resp) {
                    console.log('callback 1a');
                    // This PS API function returns an array of results matching the studentsdcid
                    $j.each(resp.record, function(i, contact) {
                        var contactdcid = contact.id;
                        var studentdcid = psData.studentsDcid;
                        return $j.getJSON('data/getEmail.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function(email) {
                            console.log('callback 1b');
                            resp.record[0].tables[config.studentContactsTable.toLowerCase()].email = email;
                            return $j.getJSON('data/getPhone.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function(phone) {
                                console.log('callback 1c');
                                phone.pop();
                                resp.record[0].tables[config.studentContactsTable.toLowerCase()].phone = phone;
                            });
                        });
                    });
                });
        },
        */


        /**
         * Get all parent-guardian contacts for a student that are in the contacts staging table.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        /*
        getParGuarsStaging: function (options) {
            return $j.getJSON(config.psApi + '/dbe/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1')
                .then(function (resp) {
                    var contactdcid = resp.record[0].id;
                    var studentdcid = psData.studentsDcid;
                    return $j.getJSON('data/getEmailStaging.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function (email) {
                        resp.record[0].tables[config.studentContactsTable.toLowerCase()].email = email;
                        return $j.getJSON('data/getPhoneStaging.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function (phone) {
                            phone.pop();
                            resp.record[0].tables[config.studentContactsTable.toLowerCase()].phone = phone;
                            return resp;
                        }, 'json');
                    }, 'json');
                });
        },*/

        /**
         * Get all emergency contacts for a student that have been approved.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        /*getEmergConts: function (options) {
            return $j.getJSON(config.psApi + '/dbe/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0')
                .then(function(resp) {
                    var contactdcid = resp.record[0].id;
                    var studentdcid = psData.studentsDcid;
                    return $j.getJSON('data/getEmail.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function (email) {
                        resp.record[0].tables[config.studentContactsTable.toLowerCase()].email = email;
                        return $j.getJSON('data/getPhone.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function (phone) {
                            phone.pop();
                            resp.record[0].tables[config.studentContactsTable.toLowerCase()].phone = phone;
                            return resp;
                        }, 'json');
                    }, 'json');
                });
        },*/

        /**
         * Get all emergency contacts for a student that are in the contacts staging table.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        /*getEmergContsStaging: function (options) {
            return $j.get(config.psApi + '/dbe/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0')
                .then(function (resp) {
                    var contactdcid = resp.record[0].id;
                    var studentdcid = psData.studentsDcid;
                    return $j.getJSON('data/getEmailStaging.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function (email) {
                        resp.record[0].tables[config.studentContactsTable.toLowerCase()].email = email;
                        return $j.getJSON('data/getPhoneStaging.json.html?cdcid=' + contactdcid + '&sdcid=' + studentdcid).then(function (phone) {
                            phone.pop();
                            resp.record[0].tables[config.studentContactsTable.toLowerCase()].phone = phone;
                            return resp;
                        });
                    });
                });
        },*/


        /**
         *
         * @param contactData {Object} - JSON-encoded contact data
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updateStagingContact: function (contactData, contactRecordId) {
            return $j.ajax({
                type: 'PUT',
                url: config.psApi + '/dbe/schema/' + config.studentContactsStagingTable + '/' + contactRecordId,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        /**
         *
         * @param contactData {Object}
         */
        newStagingContact: function (contactData) {
            return $j.ajax({
                type: 'POST',
                url: config.psApi + '/dbe/schema/' + config.studentContactsStagingTable,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        }
    };
});