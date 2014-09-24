/*global define, $j*/

define(['dataTables', 'tableTools'], function (dataTable, tableTools) {
    return {
        main: function () {
            var $dataTable = this.bindDatatables();
            this.addContactButton();

            return $dataTable;
        },
        bindDatatables: function () {
            var sortKeyColIndex = 0;
            var $table = $j('#holder').addClass('display').dataTable({
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
                    {"bVisible": false, "aTargets": [sortKeyColIndex, 5, 6]},
                    {"sWidth": "100px", "aTargets": [4]},
                    {
                        "fnRender": function (oObj) {
                            var result = '';
                            var info = oObj.aData[1];
                            if ($j.isEmptyObject(info) || info == "") {
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
                            if ($j.isEmptyObject(info) || info == "") {
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
                            if ($j.isEmptyObject(info) || info == "") {
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