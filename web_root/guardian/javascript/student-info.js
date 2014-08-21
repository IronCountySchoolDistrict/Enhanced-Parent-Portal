/*global $*/

$(document).ready(function () {
    var config = {
        // PowerSchool Point of Contact server, which will talk with the PS REST API.
        "psPoc": "https://psapi.irondistrict.org",

        // Student Contacts Database Extension Table Name
        "stuInfoDbe": "u_student_info"
    };

    var studentInInfoStaging;
    var stagingId;
    $.get(config['psPoc'] + '/student-info/staging/' + psData.studentDcid, function (resp) {

        // Check if student has staging record
        if (resp.record.length === 0) {
            studentInInfoStaging = false;
        } else {
            stagingId = resp.record[0].id;
            studentInInfoStaging = true;
        }

        if (studentInInfoStaging) {
            $('#staging-on-file').css({'display': 'block'});
        }
    }, 'json');

    $('#demographic-update-form').on('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        $j.ajax({
            type: "POST",
            url: config['psPoc'] + '/student-info/parent-verify/' + psData.studentDcid,
            dataType: 'json'
        }).done(function(parentResp) {
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
            if (!studentInInfoStaging) {
                $.ajax({
                    url: config['psPoc'] + '/student-info/staging/new/' + psData.studentDcid,
                    type: "POST",
                    dataType: "json",
                    data: postData
                }).done(function (resp) {
                    window.location.href = "/guardian/changesrecorded.html";
                });
            } else {
                // This student already has a staging table record, so update it
                $.ajax({
                    url: config['psPoc'] + '/student-info/staging/update/' + stagingId,
                    type: "POST",
                    dataType: "json",
                    data: postData
                }).done(function (resp) {
                    window.location.href = "/guardian/changesrecorded.html";
                });
            }
        });
    });
});
