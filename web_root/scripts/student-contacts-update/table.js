/*global define, $j*/

define(['dataTables', 'tableTools'], function (dataTable, tableTools) {
    return {
        main: function () {
            var $dataTable = this.bindDatatables();
            this.addContactButton();

            return $dataTable;
        },
        bindDatatables: function () {
            var $table = $j('#holder').addClass('display').dataTable({
                "bPaginate": false,
                "bFilter": false,
                "bJQueryUI": true,
                "sDom": '<"H"lfr<"addcontact">>t<"F"ip>',
                "aaSorting": [
                    [4, 'asc'],
                    [5, 'asc']
                ],
                "aoColumnDefs": [
                    {"bSortable": false, "aTargets": ['_all']},
                    {"bVisible": false, "aTargets": [4, 5]},
                    {"sWidth": "100px", "aTargets": [3]},
                    {
                        "render": function (data, type, full) {
                            var result = '';
                            if ($j.isEmptyObject(full) || full == "") {
                                return "";
                            }
                            result += '<p style="font-weight:bold;">' + full.firstname + ' ' + full.lastname + '</p>';
                            if (full.priority.trim() != "") {
                                result += '<span style="font-size:8pt;">(Contact Priority #' + full.priority + ')</span><br />';
                            }
                            result += '<span style="font-size:8pt;">(' + full.relation + ')</span>';
                            return result;
                        },
                        "aTargets": [0]
                    },
                    {
                        "render": function (data, type, full) {
                            var result = '';
                            if ($j.isEmptyObject(full) || full == "") {
                                return '';
                            }
                            var address = full.street.trim() == '' ? '' : full.street + '<br />';
                            address += full.city.trim() == '' ? '' : full.city + ',';
                            address += full.state + ' ' + full.zip;
                            if (full.street.trim() != '') {
                                result += '<a href="http://maps.google.com/?z=14&q=' + full.street + ', ' + full.city + ', ' + full.state + ', ' + full.zip + ' (' + oObj.aData[0].firstname + ' ' + oObj.aData[0].lastname + ')&output" target="_blank">' + address + '</a><br />';
                            }
                            else {
                                result += address;
                            }
                            if (full.mailto == "1") {
                                result += "*Receives mailings";
                            }
                            return result;
                        },
                        "aTargets": [1]
                    },
                    {
                        "mRender": function (data, type, full) {
                            var result = '';
                            if ($j.isEmptyObject(info) || full == "") {
                                return "";
                            }
                            result += '<p>';
                            if (full.email.trim() != "") {
                                result += '<span class="infoheader">Email: </span><a href="mailto:' + full.email + '">' + full.email + '</a><br/><span class="button" onclick="copyEmail(\'' + full.email + '\');" >+Add to automated emails</span><br />';
                            }
                            if (full.homephone.trim() != "") {
                                result += '<span class="infoheader">Home: </span>' + full.homephone + '<br />';
                            }
                            if (full.cellphone.trim() != "") {
                                result += '<span class="infoheader">Cell: </span>' + full.cellphone + '<br />';
                            }
                            if (full.workphone.trim() != "") {
                                result += '<span class="infoheader">Work: </span>' + full.workphone + '<br />';
                            }
                            if (full.employer.trim() != "") {
                                result += '<span class="infoheader">Employer: </span>' + full.employer + '<br />';
                            }
                            result += '</p>';
                            return result;
                        },
                        "aTargets": [2]
                    }
                ],
                "fnDrawCallback": function () {
                    $j('#holder td').removeClass('sorting_1 sorting_2 sorting_3');
                }
            });

            return $table;
        },

        addContactButton: function() {
            //create add contact button, and bind click event handler
            /**
             * @see sDom option in dataTable() initialization.
             */
            $j('.addcontact').append('<button>Add Contact</button>');
            $j('.addcontact button').button({
                icons: {
                    primary: 'ui-icon-plus'
                }
            });
        }

    }
});