/*global $j, loadingDialogInstance, psData*/

$j(function () {
    'use strict';

    var config = {
        // PowerSchool Point of Contact server, which will talk with the PS REST API.
        "psPoc": "https://psapi.irondistrict.org",

        // Student Contacts Database Extension Table Name
        "stuInfoStagingDbe": "u_student_info_staging"
    };

    function setEnableDemoUpdate() {
        var enableDemoUpdateName = $j('#enable-demo-update').attr('name');
        var postData = {
            ac: 'prim'
        };
        // Since the parent portal settings are set up a bit counter-intuitively (1 is disabled, 0 or null is enabled),
        // set this value to 1 (on) if the dropdown option selected was 1 (true/disabled), and set it to 0 (off) if dropdown selected was 0 (false/enabled)
        postData[enableDemoUpdateName] = $j('#enable-demo-update').val() ? 'on': 'off';
        return $j.ajax({
            type: 'POST',
            data: postData,
            url: '/admin/changesrecorded.white.html'
        });
    }

    function setEnableDemoUpdateFormVal() {
        var enableDemoUpdate = $j('#enable-demo-update');
        var enableDemoUpdateVal = enableDemoUpdate.data().value;
        if (enableDemoUpdateVal === 1) {
            enableDemoUpdate.val(enableDemoUpdateVal);
            // If enableDemoUpdateVal is not 1, it could either be 0 or null.
        } else {
            enableDemoUpdate.val('0');
        }
    }

    // Populate student email address on page load
    $j.get('/admin/students/brij_renderform.html?frn=001' + psData.studentFrn, function (studentEmailHtml) {
        $j.get('/admin/students/studentinfochange.html?frn=001' + psData.studentDcid, function () {
            setEnableDemoUpdateFormVal();
            var parsedHtml = $j.parseHTML(studentEmailHtml);
            var $html = $j(parsedHtml);
            var studentEmailValue = $html.find('#studEmail_0').val();
            $j('#on-file-student-email').val(studentEmailValue);

            loadingDialogInstance.open();

            var studentInInfoStaging;
            $j.get('/admin/json/student-in-info-verify.json.html?studentsdcid=' + psData.studentDcid, function (resp) {

                // Check if student has staging record
                // If this student doesn't have a record in the U_DEF_EXT_STUDENTS table,
                // a blank object ({}) is returned, so this check will be false.
                // If it's blank, the second expression will not give an exception because of short-circuit evaluation.
                if (resp.hasOwnProperty('student_info_verify') && resp.student_info_verify === 1) {
                    student_info_verify = true;
                } else {
                    studentInInfoStaging = false;
                }

                if (psData.parent_verify.trim() === "1") {
                    $j('#parent-verify').attr('checked', 'checked');
                }

                if (studentInInfoStaging) {
                    $j('#staging-on-file').css({'display': 'block'});
                    loadStagingData();
                } else if (psData.parent_verify === "1") {
                    $j('.linkDescList').css({'display': 'none'});
                    var template = $j('#parent-verify-msg-template').html();
                    var insertSelector = $j('table').eq(0);
                    $j(template).insertAfter(insertSelector);
                    loadingDialogInstance.forceClose();
                } else {
                    $j('.linkDescList').css({'display': 'none'});
                    $j('#uncheck-span').css({'display': 'none'});
                    $j('#parent-verify').css({'display': 'none'});
                    loadingDialogInstance.forceClose();
                }

                // Load staging data into form.
                function loadStagingData() {
                    $j.get(config.psPoc + '/api/schema/search/' + config.stuInfoStagingDbe + '/studentsdcid==' + psData.studentDcid, function (resp) {
                        loadingDialogInstance.forceClose();

                        var studentInfo = resp.record[0].tables[config.stuInfoStagingDbe];
                        $j('#staging-mailing-street').val(studentInfo.mailing_street);
                        $j('#staging-mailing-city').val(studentInfo.mailing_city);
                        $j('#staging-mailing-state').val(studentInfo.mailing_state);
                        $j('#staging-mailing-zip').val(studentInfo.mailing_zip);

                        $j('#staging-residence-street').val(studentInfo.residence_street);
                        $j('#staging-residence-city').val(studentInfo.residence_city);
                        $j('#staging-residence-state').val(studentInfo.residence_state);
                        $j('#staging-residence-zip').val(studentInfo.residence_zip);

                        $j('#staging-student-email').val(studentInfo.student_email);
                        $j('#staging-student-cell-phone').val(studentInfo.student_cell_phone);
                        $j('#staging-dentist-name').val(studentInfo.dentist_name);
                        $j('#staging-dentist-phone').val(studentInfo.dentist_phone);
                        $j('#staging-doctor-name').val(studentInfo.doctor_name);
                        $j('#staging-doctor-phone').val(studentInfo.doctor_phone);
                    }, 'json');
                }

                /**
                 * @returns {Boolean} - true if all staging fields are empty, false if not empty.
                 */
                function stagingFormIsEmpty() {
                    var isEmpty = true;
                    if ($j('#staging-mailing-street').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-mailing-city').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-mailing-state').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-mailing-zip').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-residence-street').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-residence-city').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-residence-state').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-residence-zip').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-student-email').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-student-cell-phone').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-dentist-name').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-dentist-phone').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-doctor-name').val()) {
                        isEmpty = false;
                    }
                    if ($j('#staging-doctor-phone').val()) {
                        isEmpty = false;
                    }
                    return isEmpty;
                }

                // Save student email before the rest of the form submits
                $j('#approve-dentist-name').on('click', function (event) {
                    var fieldName = $j('#on-file-dentist-name').attr('name');
                    approveFieldChange(fieldName, 'staging-dentist-name');
                });
                $j('#approve-dentist-phone').on('click', function (event) {
                    var fieldName = $j('#on-file-dentist-phone').attr('name');
                    approveFieldChange(fieldName, 'staging-dentist-phone');
                });

                $j('#student-info-form').one('submit', function (event) {
                    event.preventDefault();
                    if (stagingFormIsEmpty() && studentInInfoStaging) {
                        setEnableDemoUpdate().done(function() {
                            $j('.staging').attr({'disabled': 'disabled'});
                            var deleteFieldName = 'DC-Students:' + psData.studentDcid + '.U_STUDENT_INFO.U_STUDENT_INFO_STAGING:' + psData.studentInfoStagingId;
                            var deleteData = {
                                'ac': 'prim'
                            };
                            deleteData[deleteFieldName] = 'on';
                            $j.ajax({
                                type: "POST",
                                data: deleteData,
                                async: false,
                                url: "/admin/changesrecorded.white.html"
                            }).done(function () {
                                var postData = {
                                    'userSentContact.email': $j('#on-file-student-email').val(),
                                    'userSentContact.id': psData.psmStudentContactId,
                                    'userSentContact.studentID': psData.psmStudentId,
                                    'userSentContact.studentContactTypeID': psData.psmStudentContactTypeId,
                                    'deleteFlag_0': 'deleteFlag_0',
                                    'ac': 'brij:studentemail/StoreStudentEmails',
                                    'doc': '/admin/students/emailconfig.html',
                                    'render_in_java': 'true',
                                    'frn': psData.studentFrn
                                };

                                $j.ajax({
                                    type: "POST",
                                    data: postData,
                                    async: false,
                                    url: "/admin/students/emailconfig.html"
                                }).done(function (resp) {
                                    $j.get('/admin/students/studentinfochange.html', function () {
                                        return true;
                                    });
                                });
                            });
                        });
                    }
                });
            }, 'json');
        });
    });
});