(function($) {

  function clearDTSearches(dtTable) {
    dtTable.search( '' )
      .columns().search( '' )
      .draw();
  }

  function openDetailsDialog($anchor_elem) {

    var title = $anchor_elem.data('title');


    var status_note = $anchor_elem.data('statusNote');
    var due_date = $anchor_elem.data('dueDate');
    var modal_title = "Details for " + title;

    var modal_html = ""
    var $modal_content = $('#to-do-modal-content').html(Drupal.settings.toDoStatusModal);

    $modal_content.find('.td-title').html(title);
    $modal_content.find('.td-status-note').html(status_note);
    $modal_content.find('.td-due-date').html(due_date);
    $modal_content.dialog({
      dialogClass: 'to-do-modal-content',
      title: 'Details for ' + title,
      width: "auto",
      height: "auto",
      autoOpen: true
    });
  }


  var $table_wrapper = $('#to-do').find('table');
  $.fn.dataTableExt.oStdClasses.sPageButton = "favorites-ignore fa";
  $.fn.dataTableExt.oStdClasses.sTable = "eportal-responsive-table";

  // If the datatables loading has an error gracefully handle with a message
  $.fn.dataTable.ext.errMode = function(settings, helpPage, message) {
    $('#progress-tracker').find('.dataTables_empty').html("Unable to connect to service.");
    console.log(message);
  };
  $.fn.dataTableExt.oApi.fnPagingInfo = function(oSettings) {
    return {
      "iStart": oSettings._iDisplayStart,
      "iEnd": oSettings.fnDisplayEnd(),
      "iLength": oSettings._iDisplayLength,
      "iTotal": oSettings.fnRecordsTotal(),
      "iFilteredTotal": oSettings.fnRecordsDisplay(),
      "iPage": oSettings._iDisplayLength === -1 ?
        0 : Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
      "iTotalPages": oSettings._iDisplayLength === -1 ?
        0 : Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength) - 1
    };
  };
  var datatable_options = {
    "ajax": Drupal.settings.basePath + 'to_do/load_data',
    "dom": 'trp',
    "order": [[3, "asc"]],
    "bLengthChange": false,
    "iDisplayLength": 3,
    "processing": true,
    "language": {
      "processing": ""
    },
    "columnDefs": [
      // Hide last 2 rows (timestamp, part code)
      {"targets": [-1, -2], "visible": false},
      {"targets": [2], className: "text-left"},
      {"targets": [1], "width": "300px", className: "small-screen-td-header text-left"},
      {
        "targets": [0],
        className: "skinny-col hidden-for-small-screen vertical-top",
        "searchable": false,
        "orderable": false
      }
    ],
    "autoWidth": false,
    "pagingType": "simple",
    "fnRowCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      // Add data-titles for each column
      $('td:eq(2)', nRow).attr('data-title', "Domain");
      $('td:eq(3)', nRow).attr('data-title', "Due");


    },
    "fnDrawCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      var pageInfo = this.fnPagingInfo();
      var pageNo = pageInfo.iPage + 1;
      var totalPages = pageInfo.iTotalPages + 1;

      if (totalPages > 1) {
        var $current_li = $('<li />', {
          class: 'pager-current'
        }).html(pageNo + ' of ' + totalPages);
        $('#to-do').find('.dataTables_paginate li:first').after($current_li);
      }

    },
    fnInitComplete: function() {
      //Initialize YADCF
      // Overriding datatable class to allow Eportal's custom datatable styling
      yadcf.init($table_wrapper.DataTable(), [
          {
            column_number: 4,
            filter_match_mode: 'contains',
            filter_reset_button_text: false,
            filter_container_id: "to-do-yadcf-filter-part-code",
            filter_default_label: "- Any -"
          }
        ]
      );

      $('#yadcf-filter-domain').show();
    }
  };

  // Create index column that updates on sorting
  var dtTable = $table_wrapper.DataTable(datatable_options);
  dtTable.columns().iterator('column', function (ctx, idx) {
    $(dtTable.column(idx).header()).append('<span class="sort-icon" />');
  });

  dtTable.on('search.dt', function() {
    dtTable.column(0, {order: 'applied'}).nodes().each(function(cell, i) {
      cell.innerHTML = i + 1;
    });
  });

  $('#to-do').on('click', '.td-status', function() {
    openDetailsDialog($(this));
  });

  $('#to-do-yadcf-filter-domain').on('change', 'select', function() {
    var selected_domain = $(this).val().toLowerCase();
    var $part_code_select = $('#yadcf-filter-part-code');
    var $report_type_select = $('#yadcf-filter-report-type');
    $part_code_select.hide().find('option[value="-1"]').prop('selected', 'selected').trigger('change');
    $report_type_select.hide().find('option[value="-1"]').prop('selected', 'selected').trigger('change');
    if (selected_domain === "cedri") {
      $part_code_select.show();
    } else if (selected_domain === "lead") {
      $report_type_select.show();
    }
  });

  $('#refresh-to-do').click(function() {
    var $to_do = $('#to-do');
    // Reload datatable, forcing reload of data not using cache
    $table_wrapper.find('td').hide();
    $to_do.find('.dataTables_processing').text("Loading...");
    //Remove data, pass false to not use cache
    dtTable.ajax.url(Drupal.settings.basePath + 'to_do/load_data/false').load(function() {
      // Show table after successfully refreshing
      $table_wrapper.find('td').show();
      $to_do.find('.dataTables_processing').text("");
    });

  });

  $('.todo_filter_button').click(function() {
    if (!$(this).hasClass('filter-applied')) {
      clearDTSearches(dtTable);
      var search_criteria = $(this).data('search');
      dtTable.search('')
        .columns(5).search(search_criteria)
        .draw();
      $('.todo_filter_button').removeClass('filter-applied');
      $(this).addClass('filter-applied');
    }
  });


})(jQuery);
