/*global $,psData,confirm, loadingDialogInstance*/

String.prototype.trim = function () {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
};

function copyEmail(email) {
    if (email.trim().length === 0) {
        return;
    }
    var data = email.trim();
    var current = $("#auto_emails").val();
    if (current.length > 0) {
        data = current + "," + email.trim();
    }
    $("#auto_emails").val(data);
}

function copyGuardianEmail(n) {
    $('#contact' + n + '_email').val($('#guardianemail' + n).text());
}

function copyAddress(type, n) {
    $('#c' + n + '_street').val($('#' + type + 'street' + n).text());
    $('#c' + n + '_city').val($('#' + type + 'city' + n).text());
    $('#c' + n + '_state').val($('#' + type + 'state' + n).text());
    $('#c' + n + '_zip').val($('#' + type + 'zip' + n).text());
}

function copyPhone(n) {
    $('#contact' + n + '_homephone').val($('#studentphone' + n).text());
}

function cleanEmailList() {
    var autoEmailsSelector = $('#auto_emails');
    var emails = autoEmailsSelector.val().replace(/\s+/g, ''); //clean all white space
    emails = emails.replace(/;+/g, ',').replace(/,+$/, ''); //all semi-colons to commas, remove trailing comma
    autoEmailsSelector.val(emails); //update field with clean value
}

var $ = jQuery;

(function () {
    'use strict';
    var m_table;
    var m_keyindex = 0;
    var m_requestURL = '/admin/students/contacts/contactdata.html';
    $(document).ready(function () {
        var $ = jQuery;


        $.ajaxSetup({
            url: m_requestURL
        });
        $('#error_container').ajaxError(function (jqXHR, textStatus, errorThrown) {
            clearError();
            displayError("AJAX Error.  Page=" + settings.url + " Error=" + jqxhr.statusText);
        });
        m_table = $('#holder').addClass('display').dataTable({
            "bPaginate": false,
            "bFilter": false,
            "bJQueryUI": true,
            "sDom": '<"H"lfr<"addcontact">>t<"F"ip>',
            "aaSorting": [
                [5, 'asc'],
                [6, 'asc']
            ],
            "aoColumnDefs": [
                {"bSortable": false, "aTargets": ['_all']},
                {"bVisible": false, "aTargets": [m_keyindex, 5, 6]},
                {"sWidth": "100px", "aTargets": [4]},
                {
                    "fnRender": function (oObj) {
                        var result = '';
                        var info = oObj.aData[1];
                        if ($.isEmptyObject(info) || info == "") {
                            return "";
                        }
                        result += '<p style="font-weight:bold;">' + info.firstname + ' ' + info.lastname + '</p>';
                        if (info.priority.trim() != "") {
                            result += '<span style="font-size:8pt;">(Contact Priority #' + info.priority + ')</span><br />';
                        }
                        result += '<span style="font-size:8pt;">(' + info.relation + ')</span>';
                        return result;
                    },
                    "aTargets": [1]
                },
                {
                    "fnRender": function (oObj) {
                        var result = '';
                        var info = oObj.aData[2];
                        if ($.isEmptyObject(info) || info == "") {
                            return '';
                        }
                        var address = info.street.trim() == '' ? '' : info.street + '<br />';
                        address += info.city.trim() == '' ? '' : info.city + ',';
                        address += info.state + ' ' + info.zip;
                        if (info.street.trim() != '') {
                            result += '<a href="http://maps.google.com/?z=14&q=' + info.street + ', ' + info.city + ', ' + info.state + ', ' + info.zip + ' (' + oObj.aData[1].firstname + ' ' + oObj.aData[1].lastname + ')&output" target="_blank">' + address + '</a><br />';
                        }
                        else {
                            result += address;
                        }
                        if (info.mailto == "1") {
                            result += "*Receives mailings";
                        }
                        return result;
                    },
                    "aTargets": [2]
                },
                {
                    "fnRender": function (oObj) {
                        var result = '';
                        var info = oObj.aData[3];
                        if ($.isEmptyObject(info) || info == "") {
                            return "";
                        }
                        result += '<p>';
                        if (info.email.trim() != "") {
                            result += '<span class="infoheader">Email: </span><a href="mailto:' + info.email + '">' + info.email + '</a><br/><span class="button" onclick="copyEmail(\'' + info.email + '\');" >+Add to automated emails</span><br />';
                        }
                        if (info.homephone.trim() != "") {
                            result += '<span class="infoheader">Home: </span>' + info.homephone + '<br />';
                        }
                        if (info.cellphone.trim() != "") {
                            result += '<span class="infoheader">Cell: </span>' + info.cellphone + '<br />';
                        }
                        if (info.workphone.trim() != "") {
                            result += '<span class="infoheader">Work: </span>' + info.workphone + '<br />';
                        }
                        if (info.employer.trim() != "") {
                            result += '<span class="infoheader">Employer: </span>' + info.employer + '<br />';
                        }
                        result += '</p>';
                        return result;
                    },
                    "aTargets": [3]
                }
            ],
            "fnDrawCallback": function () {
                $('#holder td').removeClass('sorting_1 sorting_2 sorting_3');
            }
        });

        //create add contact button, and bind click event handler
        $('.addcontact').append('<button>Add Contact</button>');
        $('.addcontact button').button({
            icons: {
                primary: 'ui-icon-plus'
            }
        });
        $('body').on('click', '.addcontact', function () {
            $('.addcontact').hide();
            $.getJSON(m_requestURL, {"frn": psData.frn, "action": "addcontact", "sid": psData.curstudid})
                .success(function (data) {
                    if (data.contactnumber > 0) {
                        var n = data.contactnumber;
                        var ridx = m_table.fnAddData([n, "", "", "", "", "", ""]);
                        var sourcerow = m_table.fnSettings().aoData[ridx].nTr;
                        $.get(m_requestURL, {"frn": psData.frn, "gidx": n, "action": "geteditor"})
                            .success(function (editform) {
                                var editrow = m_table.fnOpen(sourcerow, editform, "edit_row");
                                $('form', editrow).submit(function () {
                                    //copy mother/father to fields.txt in students table
                                    if ($("#contact" + n + "_rel").val() == "Father") {
                                        syncParent('father', n);
                                    }
                                    else if ($("#contact" + n + "_rel").val() == "Mother") {
                                        syncParent('mother', n);
                                    }
                                    $.post('/admin/changesrecorded.white.html', $(this).serialize())
                                        .success(function (data) {
                                            m_table.fnClose(sourcerow);
                                            refreshContact(n, sourcerow);
                                        });
                                    $('.addcontact').show();
                                    return false;//prevent normal form submission
                                });
                                $('.edit_cancel', editrow).click(function () {
                                    m_table.fnClose(sourcerow);
                                    m_table.fnDeleteRow(sourcerow);
                                    $('.addcontact').show();
                                });
                            });
                    }
                });
        });
        //bind click event on all edit icons
        $('body').on('click', '.editcontact', function () {
            var row = $(this).parents('tr')[0];
            if (row) {
                var sourcerow = row;
                var n = m_table.fnGetData(row)[m_keyindex];
                $.get(m_requestURL, {"frn": psData.frn, "gidx": n, "action": "geteditor"})
                    .success(function (editform) {
                        var editrow = m_table.fnOpen(row, editform, "edit_row");
                        $('form', editrow).submit(function () {
                            //copy mother/father to fields.txt in students table
                            if ($("#contact" + n + "_rel").val() == "Father") {
                                syncParent('father', n);
                            }
                            else if ($("#contact" + n + "_rel").val() == "Mother") {
                                syncParent('mother', n);
                            }
                            $.post('/admin/changesrecorded.white.html', $(this).serialize()
                            )
                                .success(function (data) {
                                    m_table.fnClose(sourcerow);
                                    refreshContact(n, sourcerow);
                                });
                            return false;//prevent normal form submission
                        });
                        $('.edit_cancel', editrow).click(function () {
                            m_table.fnClose(sourcerow);
                        });
                    });
            }
        });
        //Fetch contact listing
        $.get('/ws/schema/table/U_Student_Contacts_Staging?q=studentsdcid==' + psData.curstudid)
            .done(function (data) {
                var tableName = data['record'][0]['name'];
                var contactsData = data['record'];
                $.each(contactsData, function (index, value) {
                    var record = value['tables'][tableName];
                    var aDataObj = [
                        "",
                        {
                            "priority": record.priority,
                            "firstname": record.first_name,
                            "lastname": record.last_name,
                            "relation": record.relationship
                        },
                        {
                            "street": record.street,
                            "city": record.city,
                            "state": record.state,
                            "zip": record.zip
                        },
                        {
                            "email": record.street,
                            "homephone": record.city,
                            "cellphone": record.state,
                            "workphone": record.zip
                        },
                        "<button class='editcontact'>Edit</button><br /><button class='deletecontact'>Delete</button>",
                        contactsData.priority,
                            contactsData.last_name + ',' + contactsData.first_name
                    ];

                    m_table.fnAddData(aDataObj);

                    $('.editcontact').button({
                        icons: {
                            primary: "ui-icon-pencil"
                        }
                    });
                    $('.deletecontact').button({
                        icons: {
                            primary: "ui-icon-trash"
                        }
                    });
                });
            });

        //bind click event on all delete icons
        $('body').on('click', '.deletecontact', function () {
            var row = $(this).parents('tr')[0];
            if (row) {
                var sourcerow = row;
                var d = m_table.fnGetData(row);
                var n = d[m_keyindex];
                var contactname = $('td:first p', row).text();
                if (confirm("Delete contact, \"" + contactname + "\"?")) {
                    //submitting blank custom fields.txt will cause PS to delete them
                    $.ajax({
                        type: "GET",
                        async: true,
                        dataType: "html",
                        data: {"action": "deletecontact", "gidx": n, "frn": psData.frn}
                    })
                        .success(function (deldata) {
                            var p = {};
                            $(deldata).find('input').each(function (idx, item) {
                                var n = {};
                                if ($(item).attr('name') != 'ac') {
                                    n[$(item).attr('name')] = '';
                                } else {
                                    n[$(item).attr('name')] = $(item).attr('value');
                                }
                                $.extend(p, n);
                            });
                            $.post('/admin/changesrecorded.white.html', p
                            )
                                .success(function (data) {
                                    m_table.fnDeleteRow(sourcerow);
                                });
                        })
                        .error(function (jqxhr) {
                            displayError(jqxhr.statusText);
                        });
                }
            }
        });


    });//End jquery document ready function

    function syncParent(syncname, n) {
        var f_lastfirst = '#sync_' + syncname + n;
        var f_dayphone = '#sync_' + syncname + 'dayphone' + n;
        var f_homephone = '#sync_' + syncname + '_home_phone' + n;
        var f_employer = '#sync_' + syncname + '_employer' + n;
        //determine what the day phonenber should be.
        var dayphoneval = $('#contact' + n + '_cellphone').val();
        if ($('#contact' + n + '_cellphone').val() != '') {
            dayphoneval = $('#contact' + n + '_cellphone').val();
        }
        else if ($('#contact' + n + '_workphone').val() != '') {
            dayphoneval = $('#contact' + n + '_workphone').val();
        }
        else {
            dayphoneval = $('#contact' + n + '_homephone').val();
        }
        //copy values for sync
        $(f_lastfirst).val($('#contact' + n + '_last').val() + ', ' + $('#contact' + n + '_first').val());
        $(f_homephone).val($('#contact' + n + '_homephone').val());
        $(f_employer).val($('#contact' + n + '_employer').val());
        $(f_dayphone).val(dayphoneval);
    }

    function refreshContact(num, row) {
        var settings = {"frn": psData.studentfrn, "action": "getcontact", "gidx": num};
        $.ajax({
            type: "GET",
            async: true,
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/json;charset=UTF-8");
                }
            },
            dataType: "text json",
            dataFilter: function (data) {
                data = data.replace(/[\r\n\t]/g, '');
                return data;
            },
            data: settings
        })
            .success(function (data, status) {
                if (row == null) {
                    m_table.fnAddData(data);
                }
                else {
                    m_table.fnUpdate(data, row);
                }
                $('.editcontact').button({
                    icons: {
                        primary: "ui-icon-pencil"
                    }
                });
                $('.deletecontact').button({
                    icons: {
                        primary: "ui-icon-trash"
                    }
                });
            });
    }

    function displayError(msg) {
        $('#error_container').html('<div id="alertmsg" style="padding: 0 0.7em;" class="ui-state-error ui-corner-all"><p><span style="float: left; margin-right: 0.3em;" class="ui-icon ui-icon-alert"></span><strong>Alert: </strong>' + msg + '</p></div>').show();
    }

    function clearError() {
        $('#error_container').empty().hide();
    }

}());