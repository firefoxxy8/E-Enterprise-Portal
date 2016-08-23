var yadtf_topic_configs={source:{column:2},topic:{column:3},category:{column:4},tool_type:{column:5},training_level:{column:6},data_requirements:{column:7},relevance:{column:8}};!function(a){var b={init:function(){var b=a("<ul/>").insertAfter(this),c=(b.prev().andSelf().wrapAll("<div class='multiselect-to-checkboxes'></div>"),"_"+a(this).attr("id"));a(this).children("option").each(function(d){var e=a(this),f=c+d,g=a("<li/>").appendTo(b),h=a("<input type='checkbox' id='"+f+"'/>").appendTo(g).change(function(){var b=a(this).parents(".multiselect-to-checkboxes").find("select option").eq(d);a(this).is(":checked")?b.prop("selected",!0).parent().change():b.prop("selected",!1).parent().change()});e.is(":selected")&&h.prop("checked"),h.after("<label for='"+f+"'>"+e.text()+"</label>"),"true"==String(e.attr("data-placeholder")).toLowerCase()&&g.hide()}),a(this).hide()}};a.fn.multiSelectToCheckboxes=function(c){return b[c]?b[c].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof c&&c?void a.error("Method "+c+" does not exist on jQuery.multiSelectToCheckboxes"):b.init.apply(this,arguments)}}(jQuery);var LocalResourcesTable;!function(a){a.fn.dataTableExt.oApi.fnPagingInfo=function(a){return{iStart:a._iDisplayStart,iEnd:a.fnDisplayEnd(),iLength:a._iDisplayLength,iTotal:a.fnRecordsTotal(),iFilteredTotal:a.fnRecordsDisplay(),iPage:a._iDisplayLength===-1?0:Math.ceil(a._iDisplayStart/a._iDisplayLength),iTotalPages:a._iDisplayLength===-1?0:Math.ceil(a.fnRecordsDisplay()/a._iDisplayLength)-1}},LocalResourcesTable=function(b,c,d){a.fn.dataTableExt.oStdClasses.sPageButton="favorites-ignore fa";var e={bLengthChange:!1,iDisplayLength:5,bAutoWidth:!1,oLanguage:{sSearch:"Filter:"},pagingType:"simple",dom:"iftp",fnDrawCallback:function(c,d,e,f){var g=this.fnPagingInfo(),h=g.iPage+1,i=g.iTotalPages+1;if(i>1){var j=a("<li />",{class:"pager-current"}).html(h+" of "+i);b.find(".dataTables_paginate li:first").after(j)}a("td:first-child",c.nTable).addClass("resource-title"),a("td:nth-child(2)",c.nTable).addClass("resource-info"),a("td:nth-child(3)",c.nTable).addClass("resource-source").attr("data-title","Source"),a("td:nth-child(4)",c.nTable).addClass("resource-topic").attr("data-title","Topic"),a("td:nth-child(5)",c.nTable).addClass("resource-category").attr("data-title","Category")},columnDefs:[{targets:[5,6,7,8],visible:!1}]},f=!1,g="",h=b.attr("id");this.hideTable=function(){b.hide()},this.ajax_request=function(i){var j=this.topics,k=a("#user-local-resources-wrapper").find("[id^=_yadcf-filter]");a.ajax({beforeSend:function(){var c=b.find(".view-content");c.length>0?c.html("<p>Loading&hellip;</p>"):b.html("<p>Loading&hellip;</p>"),k.prop("checked",!1).prop("disabled",!0),a("#user-local-resources-wrapper").find(".your-selections .facet-topic-container").hide()},url:c,method:"POST",data:{filters:j},success:function(c){function l(a,b){return a.length<b?a:(a=a.substr(0,b),a=a.substr(0,Math.min(a.length,a.lastIndexOf(" "))),a+" ...")}var m=0;a("table[id^='datatable-']").each(function(){m=Math.max(m,parseInt(a(this).attr("id").substr("datatable-".length),10))}),m++;var n=a("<div>"+c+"</div>");if(g="datatable-"+m,n.find("table").attr("id",g),b.html(n.html()),n=b.find("table"),n.length>0){var o=n.DataTable(e);if(n.removeClass("dataTable display no-footer").addClass("views-table responsive-table usa-table-borderless"),updateDropdown(a("#user-lgc-topics-small-view")),i){var p="#embed-manage-lgc-"+j[0];a(p).addClass("selected")}var q=b.parents(".local.resources.wrapper").attr("id"),r=a("#"+q);a("#"+q+" .facet").html(""),yadcf.init(o,[{column_number:2,filter_type:"multi_select",filter_container_selector:"#"+q+" .source.facet",filter_match_mode:"exact",filter_reset_button_text:!1},{column_number:3,filter_type:"multi_select",filter_container_selector:"#"+q+" .topic.facet",filter_match_mode:"exact",filter_reset_button_text:!1},{column_number:4,filter_type:"multi_select",filter_container_selector:"#"+q+" .category.facet",filter_match_mode:"exact",filter_reset_button_text:!1},{column_number:5,filter_type:"multi_select",filter_container_selector:"#"+q+" .tool-type.facet",filter_match_mode:"exact",filter_reset_button_text:!1},{column_number:6,filter_type:"multi_select",filter_container_selector:"#"+q+" .training-level.facet",filter_match_mode:"exact",filter_reset_button_text:!1},{column_number:7,filter_type:"multi_select",filter_container_selector:"#"+q+" .data-requirements.facet",filter_match_mode:"exact",filter_reset_button_text:!1},{column_number:8,filter_type:"multi_select",filter_container_selector:"#"+q+" .relevance.facet",filter_match_mode:"exact",filter_reset_button_text:!1}]),a("#"+q).find(".facet select").each(function(){a(this).multiSelectToCheckboxes()});var s=a(".your-selections");if(0===s.find(".selection-lbl").length){var t="<div class='selection-lbl'>"+s.html()+"</div>";s.html(t)}var u;u="my"===d?r.find(".your-selections.my-resources"):r.find(".your-selections.all-resources"),a('div[id^="yadcf-filter-wrapper--'+h+'-wrapper"]').find("li").each(function(b){if(b>0){var c=a(this).closest(".facet").attr("class").replace("facet","").trim(),d=a(this).children("label").html(),e=c.replace("-","_"),f=yadtf_topic_configs[e].column;if(d.indexOf("(")<0){a(this).children("label").attr("title",d);var g="<span class='facet-topic-container' title='"+d+"'><span title = '"+d+"'>"+d+"</span><a href='javascript:void(0)'><span class='sr-only'>Remove "+d+"</span></a></span>";0===u.find('span[title="'+d+'"]').length&&(u.append(g),u.find("span.facet-topic-container").hide())}var h=a.grep(o.data(),function(a,b){return d.trim()==a[f].trim()},!1);d.indexOf("(")<0&&a(this).children("label").html(d+" ("+h.length+")")}}),a('div[id^="yadcf-filter-wrapper--'+q+'"]').find("input").click(function(b){var c=r.find('span.facet-topic-container[title="'+a(this).next().attr("title")+'"]'),d=(a(".your-selections"),c.is(":visible"));d?c.hide():(c.css("display","inline-block"),c.find("span").html(l(a(this).next().attr("title"),40)),c.find("a span").html("Remove "+a(this).next().attr("title")))}),r.find(".your-selections span.facet-topic-container a").unbind("click").click(function(b){var c=a(this).parent().attr("title"),d=r.find(".multiselect-to-checkboxes ul li label[title='"+c+"']").attr("for");r.find("#"+d).trigger("click")}),a("#local-resources-tabs").on("click","td.views-field-nothing a",function(b){Drupal.CTools.Modal.show("ee-ctools-popup-style"),a("#modal-title").html("Resource Info"),a("#modal-content").html(a(this).parent().text()).scrollTop(0),Drupal.attachBehaviors(),b.preventDefault()})}else b.html('<div class="no-topics">You have not selected any local government interests. <a href="javascript:void(0);" id="add-more-topics">Add some here.</a></div>');k.prop("disabled",!1),f=!0}})},this.showTable=function(){f||this.ajax_request(),b.show()},this.updateTopics=function(a,b){this.topics=a,b?this.ajax_request(b):this.ajax_request()},this.filterTopics=function(b){if(""!==g){var c=a("#"+g);c.DataTable().columns().search(b).draw()}}}}(jQuery);
//# sourceMappingURL=src/LocalResourcesTable.js.map