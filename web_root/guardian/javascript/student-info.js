/*global $*/

$j(document).ready(function () {
    var config = {
        // PowerSchool Point of Contact server, which will talk with the PS REST API.
        "psPoc": "https://psit.irondistrict.org",

        // Student Contacts Database Extension Table Name
        "stuInfoDbe": "u_student_info"
    };

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
    }, 'json');

    // Load on-file data into form.
    $j.get(config['psPoc'] + '/student-info/' + psData.studentDcid, function (resp) {
        var studentInfo = resp.student;
        $j('#on-file-mailing-street').text(studentInfo.addresses.mailing.street);
        $j('#on-file-mailing-city').text(studentInfo.addresses.mailing.city);
        $j('#on-file-mailing-state').text(studentInfo.addresses.mailing.state_province);
        $j('#on-file-mailing-zip').text(studentInfo.addresses.mailing.postal_code);

        $j('#on-file-residence-street').text(studentInfo.addresses.physical.street);
        $j('#on-file-residence-city').text(studentInfo.addresses.physical.city);
        $j('#on-file-residence-state').text(studentInfo.addresses.physical.state_province);
        $j('#on-file-residence-zip').text(studentInfo.addresses.physical.postal_code);

        $j('#on-file-student-email').text(studentInfo.contact_info.email);

        // Find the students_extension object
        var studentsExtension = $j.grep(studentInfo._extension_data._table_extension, function (elem) {
            if (elem.name === 'u_students_extension') {
                return elem._field;
            }
        });

        studentsExtension = studentsExtension[0];
        // If there is more than one field in the U_STUDENTS_EXTENSION table, this value is an array
        var studentCellPhone;
        if (Object.prototype.toString.call(studentsExtension._field) === '[object Array]') {
            studentCellPhone = $j.grep(studentsExtension, function (elem) {
                if (elem.name === 'student_cell_number') {
                    return elem;
                }
            });
            // If there is only field in U_STUDENTS_EXTENSION, this will be an object with the value.
        } else {
            studentCellPhone = studentsExtension._field;
        }


        $j('#on-file-student-cell-phone').text(studentCellPhone.value);

        $j('#on-file-doctor-name').text(studentInfo.contact.doctor_name);
        $j('#on-file-doctor-phone').text(studentInfo.contact.doctor_phone);


        var studentCoreFieldsExt = $j.grep(studentInfo._extension_data._table_extension, function (elem) {
            if (elem.name === 'studentcorefields') {
                return elem._field;
            }
        });
        studentCoreFieldsExt = studentCoreFieldsExt[0]._field;

        var dentist_name = $j.grep(studentCoreFieldsExt, function (elem) {
            if (elem.name === 'dentist_name') {
                return elem;
            }
        });

        var dentist_phone = $j.grep(studentCoreFieldsExt, function (elem) {
            if (elem.name === 'dentist_phone') {
                return elem;
            }
        });

        dentist_name = dentist_name[0];
        dentist_phone = dentist_phone[0];

        $j('#on-file-dentist-name').text(dentist_name.value);
        $j('#on-file-dentist-phone').text(dentist_phone.value);
    }, 'json');


    $j('#demographic-update-form').on('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var postData = {
            'mailing-street': $j('#mailing-street').val(),
            'mailing-city': $j('#mailing-city').val(),
            'mailing-state': $j('#mailing-state').val(),
            'mailing-zip': $j('#mailing-zip').val(),
            'residence-street': $j('#residence-street').val(),
            'residence-city': $j('#residence-city').val(),
            'residence-state': $j('#residence-state').val(),
            'residence-zip': $j('#residence-zip').val(),
            'student-email': $j('#student-email').val(),
            'student-cell-phone': $j('#student-cell-phone').val(),
            'doctor-name': $j('#doctor-name').val(),
            'doctor-phone': $j('#doctor-phone').val(),
            'dentist-name': $j('#dentist-name').val(),
            'dentist-phone': $j('#dentist-phone').val()
        };

        // This student doesn't have a staging table record, so make a new one.
        if (!studentInInfoStaging) {
            $j.ajax({
                url: config['psPoc'] + '/student-info/staging/new/' + psData.studentDcid,
                type: "POST",
                dataType: "json",
                data: postData
            }).done(function (resp) {
                console.dir(resp);
            });
        } else {
            // This student already has a staging table record, so update it
            var stagingId = resp.record[0].id;
            $j.ajax({
                url: config['psPoc'] + '/student-info/staging/update/' + stagingId,
                type: "POST",
                dataType: "json",
                data: postData
            }).done(function (resp) {
                console.dir(resp)
            });
        }
    });
});
