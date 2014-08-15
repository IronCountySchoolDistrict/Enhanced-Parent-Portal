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
