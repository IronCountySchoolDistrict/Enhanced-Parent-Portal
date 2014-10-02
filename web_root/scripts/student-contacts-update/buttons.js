/*global define, $j*/

define(function() {
    'use strict';
    return {
        main: function($dataTable) {
            this.bindAddContact($dataTable);
            this.bindEditContact($dataTable);
            this.bindDeleteContact($dataTable);
        },
        bindAddContact: function($dataTable) {
            $j('body').on('click', '.addcontact', function () {
                $j('.addcontact').hide();
                $j.getJSON(m_requestURL, {"frn": psData.frn, "action": "addcontact", "sid": psData.curstudid})
                    .success(function (data) {
                        if (data.contactnumber > 0) {
                            var n = data.contactnumber;
                            var ridx = $dataTable.fnAddData([n, "", "", "", "", "", ""]);
                            var sourcerow = $dataTable.fnSettings().aoData[ridx].nTr;
                            $j.get(m_requestURL, {"frn": psData.frn, "gidx": n, "action": "geteditor"})
                                .success(function (editform) {
                                    var editrow = $dataTable.fnOpen(sourcerow, editform, "edit_row");
                                    $j('form', editrow).submit(function () {
                                        //copy mother/father to fields.txt in students table
                                        if ($j("#contact" + n + "_rel").val() == "Father") {
                                            syncParent('father', n);
                                        }
                                        else if ($j("#contact" + n + "_rel").val() == "Mother") {
                                            syncParent('mother', n);
                                        }
                                        $j.post('/admin/changesrecorded.white.html', $j(this).serialize())
                                            .success(function (data) {
                                                $dataTable.fnClose(sourcerow);
                                                refreshContact(n, sourcerow);
                                            });
                                        $j('.addcontact').show();
                                        return false;//prevent normal form submission
                                    });
                                    $j('.edit_cancel', editrow).click(function () {
                                        $dataTable.fnClose(sourcerow);
                                        $dataTable.fnDeleteRow(sourcerow);
                                        $j('.addcontact').show();
                                    });
                                });
                        }
                    });
            });
        },
        bindEditContact: function ($dataTable) {
            //bind click event on all edit icons
            $j('body').on('click', '.editcontact', function () {
                var row = $j(this).parents('tr')[0];
                if (row) {
                    var sourcerow = row;
                    var n = $dataTable.fnGetData(row)[m_keyindex];
                    $j.get(m_requestURL, {"frn": psData.frn, "gidx": n, "action": "geteditor"}
                    )
                        .success(function (editform) {
                            var editrow = $dataTable.fnOpen(row, editform, "edit_row");
                            $j('form', editrow).submit(function () {
                                //copy mother/father to fields.txt in students table
                                if ($j("#contact" + n + "_rel").val() == "Father") {
                                    syncParent('father', n);
                                }
                                else if ($j("#contact" + n + "_rel").val() == "Mother") {
                                    syncParent('mother', n);
                                }
                                $j.post('/admin/changesrecorded.white.html', $j(this).serialize()
                                )
                                    .success(function (data) {
                                        $dataTable.fnClose(sourcerow);
                                        refreshContact(n, sourcerow);
                                    });
                                return false;//prevent normal form submission
                            });
                            $j('.edit_cancel', editrow).click(function () {
                                $dataTable.fnClose(sourcerow);
                            });
                        });
                }
            });
        },
        bindDeleteContact: function($dataTable) {
            //bind click event on all delete icons
            $j('body').on('click', '.deletecontact', function () {
                var row = $j(this).parents('tr')[0];
                if (row) {
                    var sourcerow = row;
                    var d = $dataTable.fnGetData(row);
                    var n = d[m_keyindex];
                    var contactname = $j('td:first p', row).text();
                    if (confirm("Delete contact, \"" + contactname + "\"?")) {
                        //submitting blank custom fields.txt will cause PS to delete them
                        $j.ajax({
                            type: "GET",
                            async: true,
                            dataType: "html",
                            data: {"action": "deletecontact", "gidx": n, "frn": psData.frn}
                        })
                            .success(function (deldata) {
                                var p = {};
                                $j(deldata).find('input').each(function (idx, item) {
                                    var n = {};
                                    if ($j(item).attr('name') != 'ac') {
                                        n[$j(item).attr('name')] = '';
                                    } else {
                                        n[$j(item).attr('name')] = $j(item).attr('value');
                                    }
                                    $j.extend(p, n);
                                });
                                $j.post('/admin/changesrecorded.white.html', p
                                )
                                    .success(function (data) {
                                        $dataTable.fnDeleteRow(sourcerow);
                                    });
                            })
                            .error(function (jqxhr) {
                                displayError(jqxhr.statusText);
                            });
                    }
                }
            });
        }
    }
});