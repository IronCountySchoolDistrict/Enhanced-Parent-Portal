/*global $*/

$(document).ready(function () {
    var config = {
        // PowerSchool Point of Contact server, which will talk with the PS REST API.
        "psPoc": "https://psit.irondistrict.org",

        // Student Contacts Database Extension Table Name
        "stuInfoDbe": "u_student_info"
    };

    // Load on-file data into form.
    $.get(config['psPoc'] + '/student-info/' + psData.studentDcid, function (resp) {
        var studentInfo = resp.student;
        $('#on-file-mailing-street').text(studentInfo.addresses.mailing.street);
        $('#on-file-mailing-city').text(studentInfo.addresses.mailing.city);
        $('#on-file-mailing-state').text(studentInfo.addresses.mailing.state_province);
        $('#on-file-mailing-zip').text(studentInfo.addresses.mailing.postal_code);

        $('#on-file-residence-street').text(studentInfo.addresses.physical.street);
        $('#on-file-residence-city').text(studentInfo.addresses.physical.city);
        $('#on-file-residence-state').text(studentInfo.addresses.physical.state_province);
        $('#on-file-residence-zip').text(studentInfo.addresses.physical.postal_code);

        $('#on-file-student-email').text(studentInfo.contact_info.email);

        // Find the students_extension object
        var studentsExtension = $.grep(studentInfo._extension_data._table_extension, function (elem) {
            if (elem.name === 'u_students_extension') {
                return elem._field;
            }
        });

        studentsExtension = studentsExtension[0];
        // If there is more than one field in the U_STUDENTS_EXTENSION table, this value is an array
        var studentCellPhone;
        if (Object.prototype.toString.call(studentsExtension._field) === '[object Array]') {
            studentCellPhone = $.grep(studentsExtension, function (elem) {
                if (elem.name === 'student_cell_number') {
                    return elem;
                }
            });
            // If there is only field in U_STUDENTS_EXTENSION, this will be an object with the value.
        } else {
            studentCellPhone = studentsExtension._field;
        }


        $('#on-file-student-cell-phone').text(studentCellPhone.value);

        $('#on-file-doctor-name').text(studentInfo.contact.doctor_name);
        $('#on-file-doctor-phone').text(studentInfo.contact.doctor_phone);


        var studentCoreFieldsExt = $.grep(studentInfo._extension_data._table_extension, function (elem) {
            if (elem.name === 'studentcorefields') {
                return elem._field;
            }
        });
        studentCoreFieldsExt = studentCoreFieldsExt[0]._field;

        var dentist_name = $.grep(studentCoreFieldsExt, function (elem) {
            if (elem.name === 'dentist_name') {
                return elem;
            }
        });

        var dentist_phone = $.grep(studentCoreFieldsExt, function (elem) {
            if (elem.name === 'dentist_phone') {
                return elem;
            }
        });

        dentist_name = dentist_name[0];
        dentist_phone = dentist_phone[0];

        $('#on-file-dentist-name').text(dentist_name.value);
        $('#on-file-dentist-phone').text(dentist_phone.value);
    }, 'json');

    $('#demographic-update-form').on('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        //Check if student already has student info record in staging_info_staging table
        $.get(config['psPoc'] + '/student-info/staging/' + psData.studentDcid, function (resp) {

            var postData = {
                'mailing-street': $('#mailing-street').val(),
                'mailing-city': $('#mailing-city').val(),
                'mailing-state': $('#mailing-state').val(),
                'mailing-zip': $('#mailing-zip').val(),
                'residence-street': $('#residence-street').val(),
                'residence-city': $('#residence-city').val(),
                'residence-state': $('#residence-state').val(),
                'residence-zip': $('#residence-zip').val(),
                'student-email': $('#student-email').val(),
                'student-cell-phone': $('#student-cell-phone').val(),
                'doctor-name': $('#doctor-name').val(),
                'doctor-phone': $('#doctor-phone').val(),
                'dentist-name': $('#dentist-name').val(),
                'dentist-phone': $('#dentist-phone').val()
            };

            // This student doesn't have a staging table record, so make a new one.
            if (resp.record.length === 0) {
                $.ajax({
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
                $.ajax({
                    url: config['psPoc'] + '/student-info/staging/update/' + stagingId,
                    type: "POST",
                    dataType: "json",
                    data: postData
                }).done(function (resp) {
                    console.dir(resp)
                });
            }
        }, 'json');
    });
});
