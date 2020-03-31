var token = $.cookie("access_token");

function DataTableEntry() {

    function bindDataTable(tableId, targets, renderFn, ajaxEndPoint, ajaxType, ajaxData, columns, initComplete, pageLen, header, footer) {
        var ajax = basicAjaxConfig(ajaxEndPoint, ajaxType, tableId, ajaxData)
        return basicConfig(tableId, targets, renderFn, ajax, columns, initComplete, pageLen, header, footer);
    }
    function bindGroupDataTable(tableId, indx, rowGroup, targets, renderFn, ajaxEndPoint, ajaxType, ajaxData, columns, initComplete) {

        return $(tableId).DataTable({
            dom: 'Bfrtip',
            buttons: [
                'print'
            ],
            processing: true,
            serverSide: true,
            columnDefs: [{

                searchable: false,
                sortable: false,
                targets: targets,
                render: renderFn
            }],
            //dom: 'Bfrtip',
            buttons: [
                'copy', 'excel', 'pdf'
            ],
            language: {
                processing: '<div class="tbl-loader-txt"><img src="/content/img/loader.gif" /> <b>Processing...</b></div>'
            },
            ajax: {
                url: ajaxEndPoint,
                type: ajaxType,
                scrollX: true,
                data: function (d) {
                    var info = $(tableId).DataTable().page.info();
                    ajaxData.pagenumber = info.page + 1;
                    ajaxData.pageSize = d.length;
                    return ajaxData;
                },
                dataType: "json",
                cache: false,
                headers: {
                    "Authorization": "Berear " + token,
                    // "Content-Type": "application/x-www-form-urlencoded"
                },
                complete: function (httpObj, textStatus) {
                    // console.log(httpObj)
                    if (httpObj.status == 401) {
                        window.location.href = '/login.html';
                    }
                },
                dataFilter: function (data) {
                    var returnedDataTable = jQuery.parseJSON(data);
                    if (returnedDataTable && returnedDataTable.data != null) {
                        var json = {};
                        json.recordsTotal = returnedDataTable.data.total;
                        json.recordsFiltered = returnedDataTable.data.total;
                        json.data = returnedDataTable.data.data;//arr;
                        return JSON.stringify(json); // return JSON string
                    }
                    else {
                        $('.pg-notfound').show();
                        //   $('#ready_orders_wrapper').hide();
                        var json = {};
                        json.recordsTotal = 0;
                        json.recordsFiltered = 0;
                        json.data = '';
                        return JSON.stringify(json);
                    }
                },
            },
            initComplete: initComplete,
            columns: columns,
            order: [[indx, 'desc']],
            rowGroup: rowGroup
        });

    }

    function bindDataTableAction(tableId, targets, renderFn, ajaxEndPoint, ajaxType, ajaxData, columns) {
        var ajax = basicAjaxConfig(ajaxEndPoint, ajaxType, tableId, ajaxData)
        return basicConfig(tableId, targets, renderFn, ajax, columns)
    }

    function basicConfig(tableId, targets, renderFn, ajaxObj, columns, initComplete, pageLen, header, footer) {
        //if (pageLen == undefined) pageLen = 10;
        return $(tableId).DataTable({
            pageLength: (pageLen) ? pageLen : 10,
            processing: true,
            serverSide: true,
            searching: false,
            columnDefs: [{
                searchable: false,
                sortable: false,
                targets: targets,
                render: renderFn
            }],
            dom: (pageLen) ? 'Bfrtip' : 'Blfrtip',
            buttons: [
                {
                    extend: 'print',
                    text: '<i class="fas fa-print"></i> Print',
                    className: 'btn-sm wbtn noselect tbl-btn',
                    title: header,
                    customize: function (win) {
                        win.document.title = 'Print Report';
                        $(win.document.body).find('tbody tr:last')
                            .after(footer());
                        $(win.document.body).find('table tr td')
                            .css('color', '#000');
                        $(win.document.body).find('thead tr th')
                            .css({ 'color': '#000', 'border-bottom': '1px solid #000', 'border-top': '1px solid #000' });
                        $(win.document.body).find('.tdfg')
                            .css({ 'border-top': '1px solid #000' });
                        $(win.document.body).find('.tdlg')
                            .css({ 'border-bottom': '1px solid #000' });
                    },
                    messageTop: null,
                    messageBottom: null
                }
            ],
            language: {
                processing: '<div class="tbl-loader-box"><img src="/assets/plugins/global/images/owl.carousel/ajax-loader.gif" /> <b>Processing...</b></div>'
            },
            ajax: ajaxObj,
            initComplete: initComplete,
            columns: columns
        });
    }

    function basicAjaxConfig(ajaxEndPoint, ajaxType, tableId, ajaxData) {
        return {
            url: ajaxEndPoint,
            type: ajaxType,
            scrollX: true,
            data: function (d) {
                var info = $(tableId).DataTable().page.info();
                ajaxData.pagenumber = info.page + 1;
                ajaxData.pageSize = d.length;
                return ajaxData;
            },

            dataType: "json",
            cache: false,
            headers: {
                "Authorization": "Berear " + token,
                // "Content-Type": "application/x-www-form-urlencoded"
            },
            complete: function (httpObj, textStatus) {
                // console.log(httpObj)

                if (httpObj.status == 401) {
                    window.location.href = '/login.html';
                }
            },
            dataFilter: function (data) {
                var returnedDataTable = jQuery.parseJSON(data);
                // console.log(returnedDataTable.data);
                if (returnedDataTable && returnedDataTable.data != null) {
                    var json = {};
                    json.recordsTotal = returnedDataTable.data.total;
                    json.recordsFiltered = returnedDataTable.data.total;
                    if (returnedDataTable.data.totalForReport)
                        json.totalForReport = returnedDataTable.data.totalForReport;
                    json.data = returnedDataTable.data.data;//arr;
                    return JSON.stringify(json); // return JSON string
                }
                else {
                    $('.pg-notfound').show();
                    var json = {};
                    json.recordsTotal = 0;
                    json.recordsFiltered = 0;
                    json.data = '';
                    return JSON.stringify(json);
                }
            }
        }
    }




    function getDate(myDate) {
        return myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate() + " "
            + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds();
    }

    this.bindDataTable = bindDataTable;
    this.bindGroupDataTable = bindGroupDataTable;
    this.bindDataTableAction = bindDataTableAction;
    this.getStringDate = getDate;
};