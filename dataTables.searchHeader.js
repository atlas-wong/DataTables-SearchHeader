$(document).on('init.dt', function (e, settings, json) {
    var $table = $(settings.nTable);

    if (!$table.hasClass('search-header')) {
        return;
    }

    // Copy thead to tfoot
    $tfoot = $('<tfoot/>');

    // Append fields
    for (k in settings.aoColumns) {
        var column = settings.aoColumns[k];
        var $th = $('<th/>');
        var fieldName = column.name ? column.name : column.data;
        
        $tfoot.append($th);
        
        if (!column.bSearchable) {
            $th.html('');
        } else if (column.searchType == 'select') {
            $th.html('<select style="width: 100%" class="datatable-search-field simple-search-field select-search-field" name="' + fieldName + '"></select>');
            $th.find('select').append('<option value=""></option>');
            
            // Check if searchOptions is array
            if (Object.keys(column.searchOptions).length > 0) {
                for (var i in column.searchOptions) {
                    // Check if searchOptions is key-value pair or simple string array
                    if (column.searchOptions[i].key && column.searchOptions[i].value) {
                        $th.find('select').append('<option value="' + column.searchOptions[i].key + '">' + column.searchOptions[i].value + '</option>');
                    } else {
                        $th.find('select').append('<option value="' + column.searchOptions[i] + '">' + column.searchOptions[i] + '</option>');
                    }
                }
            } else {
                console.log("column.searchOptions is not an array");
            }
        } else if (column.searchType == 'date') {
            $th.html('<input type="text" class="datatable-search-field simple-search-field date-search-field datepicker" name="' + fieldName + '"/>');
        } else if (column.searchType == 'date-range') {
            $th.html('<input type="text" placeholder="From" class="datatable-search-field date-range-search-field datepicker datatable-filter" name="' + fieldName + '_from"/><input type="text" placeholder="To" class="date-range-search-field datepicker datatable-filter" name="' + fieldName + '_to"/>');
        } else if (column.searchType == 'datetime') {
            $th.html('<input type="text" class="datatable-search-field simple-search-field datetime-search-field datetimepicker"/>');
        } else if (column.searchType == 'datetime-range') {
            $th.html('<input type="text" placeholder="From" class="datatable-search-field datetime-range-search-field datetimepicker datatable-filter" name="' + fieldName + '_from"/><input type="text" placeholder="To" class="datetime-range-search-field datetimepicker datatable-filter" name="' + fieldName + '_to"/>');
        } else {
            $th.html('<input type="text" class="datatable-search-field simple-search-field text-search-field" name="' + fieldName + '"/>');
        }

        // Hide column if not visible
        if (!column.bVisible) {
            $th.hide();
        }
    };
    
    $table.append($tfoot);

    var dt = $table.dataTable().api();

    // Handle Field Changes
    dt.columns().every(function () {
        var that = this;
        var $header = $table.find('tfoot th:nth-child(' + parseInt(this.index() + 1) + ')');
        var $input = $header.find('input.simple-search-field, select.simple-search-field');
        var throttleSearch = $.fn.dataTable.util.throttle(
            function (val) {
                that.search(val).draw();
            },
            300
        );
        
        $input
            .off()
            .on('keyup.DT change', function () {
                if (that.search() !== this.value) {
                    throttleSearch(this.value);
                }
            })
            .on('keypress.DT', function (e) {
                /* Prevent form submission */
                if (e.keyCode == 13) {
                    return false;
                }
            });
    });

    // Responsive Table
    dt.on('responsive-resize', function (e, datatable, columns) {
        for (var i in columns) {
            if (columns[i] === true)
                $table.find('tfoot th:nth-child(' + (parseInt(i) + 1) + ')').show();
            else
                $table.find('tfoot th:nth-child(' + (parseInt(i) + 1) + ')').hide();
        }
    });

    // Column visibility
    dt.on('column-visibility', function (e, datatable, column, visible) {
        if (visible === true)
            $table.find('tfoot th:nth-child(' + (column + 1) + ')').show();
        else
            $table.find('tfoot th:nth-child(' + (column + 1) + ')').hide();
    });
});