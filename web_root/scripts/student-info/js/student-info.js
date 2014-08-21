/*global $j*/

$j(function () {
    var config = {
        // PowerSchool Point of Contact server, which will talk with the PS REST API.
        "psPoc": "https://psapi.irondistrict.org",

        // Student Contacts Database Extension Table Name
        "stuInfoStagingDbe": "u_student_info_staging"
    };

    loadingDialogInstance.open();

    var studentInInfoStaging;
    $j.get(config['psPoc'] + '/student-info/staging/' + psData.studentDcid, function (resp) {

        // Check if student has staging record
        if (resp.record.length === 0) {
            studentInInfoStaging = false;
        } else {
            studentInInfoStaging = true;
        }

        if (studentInInfoStaging) {
            $j('#staging-on-file').css({'display': 'block'});
        }

        //loadOnFileData();
        loadStagingData();
    }, 'json');

    // Load staging data into form.
    function loadStagingData() {
        $j.get(config['psPoc'] + '/student-info/staging/' + psData.studentDcid, function (resp) {
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

    $j('#student-info-form').submit(function (event) {
        if (stagingFormIsEmpty()) {
            $j('.staging').css({'display': 'none'});
            var deleteFieldName = 'DC-Students:' + psData.studentDcid + '.U_STUDENT_CONTACTS.U_STUDENT_INFO_STAGING:' + psData.studentInfoStagingId;
            var deleteData = {
                'ac': 'prim'
            };
            deleteData[deleteFieldName] = 'on';
            $j.ajax({
                type: "POST",
                data: deleteData,
                url: "/admin/changesrecorded.white.html"
            });
        }

        //event.preventDefault();
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
            url: "/admin/students/emailconfig.html"
        }).done(function (resp) {
            console.dir(resp);
        });
        return true;
    });

    // Populate student email address on page load
    var studentEmailValue = $j('#studEmail_0').val();
    $j('#on-file-student-email').val(studentEmailValue);
});