/*global $j*/

var config = {
    // PowerSchool Point of Contact server, which will talk with the PS REST API.
    "psPoc": "https://psit.irondistrict.org",

    // Student Contacts Database Extension Table Name
    "stuInfoStagingDbe": "u_student_info_staging"
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

    loadOnFileData();
    loadStagingData();
}, 'json');

// Load on-file (from students table) data into form.
function loadOnFileData() {
    $j.get(config['psPoc'] + '/student-info/' + psData.studentDcid, function (resp) {
        var studentInfo = resp.student;
        $j('#on-file-mailing-street').val(studentInfo.addresses.mailing.street);
        $j('#on-file-mailing-city').val(studentInfo.addresses.mailing.city);
        $j('#on-file-mailing-state').val(studentInfo.addresses.mailing.state_province);
        $j('#on-file-mailing-zip').val(studentInfo.addresses.mailing.postal_code);

        $j('#on-file-residence-street').val(studentInfo.addresses.physical.street);
        $j('#on-file-residence-city').val(studentInfo.addresses.physical.city);
        $j('#on-file-residence-state').val(studentInfo.addresses.physical.state_province);
        $j('#on-file-residence-zip').val(studentInfo.addresses.physical.postal_code);

        $j('#on-file-student-email').val(studentInfo.contact_info.email);

        // Find the students_extension object
        // If the table_extension is an array of objects, there is data for both
        // u_student_extension and studentcorefields
        // If table_extension is an object, only the studentcorefields table has data in
        // it.
        var studentsExtension;
        if (Object.prototype.toString.call(studentInfo._extension_data._table_extension) === '[object Array]') {
            var studentsExtension = $j.grep(studentInfo._extension_data._table_extension, function (elem) {
                if (elem.name === 'u_students_extension') {
                    return elem._field;
                }
            });
            if (studentsExtension.length !== 0) {
                // Grep returns an array of matching objects, set studentsExtension to first object in array.
                studentsExtension = studentsExtension[0];
            }


            // If table_extension is an Object with the name "u_students_extension", set it to studentsExtension
        } else if(studentInfo._extension_data._table_extension.name === 'u_students_extension') {
            studentsExtension = studentInfo._extension_data._table_extension._field;
        }

        // If there is more than one field in the U_STUDENTS_EXTENSION table, this value is an array

        if (studentsExtension) {
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
            $j('#on-file-student-cell-phone').val(studentCellPhone.value);
        }

        $j('#on-file-doctor-name').val(studentInfo.contact.doctor_name);
        $j('#on-file-doctor-phone').val(studentInfo.contact.doctor_phone);

        // Find the students_extension object
        // If the table_extension is an array of objects, there is data for both
        // u_student_extension and studentcorefields
        // If table_extension is an object, only the studentcorefields table has data in
        // it.
        var studentCoreFieldsExt;
        if (Object.prototype.toString.call(studentInfo._extension_data._table_extension) === '[object Array]') {
            var studentCoreFieldsExt = $j.grep(studentInfo._extension_data._table_extension, function (elem) {
                if (elem.name === 'studentcorefields') {
                    return elem._field;
                }
            });
            if (studentCoreFieldsExt.length !== 0) {
                // Grep returns an array of matching objects, set studentsExtension to first object in array.
                studentCoreFieldsExt = studentCoreFieldsExt[0];
            }


            // If table_extension is an Object with the name "u_students_extension", set it to studentCoreFieldsExt
        } else if(studentInfo._extension_data._table_extension.name === 'studentcorefields') {
            studentCoreFieldsExt = studentInfo._extension_data._table_extension._field;
        }

        // If there is more than one field in the U_STUDENTS_EXTENSION table, this value is an array

        if (studentCoreFieldsExt) {
            var dentistName;

            if (Object.prototype.toString.call(studentCoreFieldsExt._field) === '[object Array]') {
                dentistName = $j.grep(studentCoreFieldsExt._field, function (elem) {
                    if (elem.name === 'dentist_name') {
                        return elem;
                    }
                });
                // If there is only field in U_STUDENTS_EXTENSION, this will be an object with the value.
            } else {
                dentistName = studentCoreFieldsExt._field;
            }

            if (dentistName.length !== 0) {
                dentistName = dentistName[0];
            }

            if(dentistName) {
                $j('#on-file-dentist-name').val(dentistName.value);
            }

            var dentistPhone;

            if (Object.prototype.toString.call(studentCoreFieldsExt._field) === '[object Array]') {
                dentistPhone = $j.grep(studentCoreFieldsExt._field, function (elem) {
                    if (elem.name === 'dentist_phone') {
                        return elem;
                    }
                });
                // If there is only field in U_STUDENTS_EXTENSION, this will be an object with the value.
            } else {
                dentistPhone = studentCoreFieldsExt._field;
            }

            if (dentistPhone.length !== 0) {
                dentistPhone = dentistPhone[0];
            }

            if(dentistPhone) {
                $j('#on-file-dentist-phone').val(dentistPhone.value);
            }
        }
    }, 'json');
}

// Load staging data into form.
function loadStagingData() {
    $j.get(config['psPoc'] + '/student-info/staging/' + psData.studentDcid, function (resp) {
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

$j(function() {
    $j('#approve-dentist-name').on('click', function(event) {
        var fieldName = $j('#on-file-dentist-name').attr('name');
        approveFieldChange(fieldName, 'staging-dentist-name');
    });
    $j('#approve-dentist-phone').on('click', function(event) {
        var fieldName = $j('#on-file-dentist-phone').attr('name');
        approveFieldChange(fieldName, 'staging-dentist-phone');
    });

})
