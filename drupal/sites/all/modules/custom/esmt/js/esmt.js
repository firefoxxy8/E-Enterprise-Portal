(function($){$(".publish-service").change(function(){var action="unpublish";if($(this).prop("checked")){action="publish"}$.post("/esmt/service_actions/"+action+"/"+$(this).data("rid"))})})(jQuery);
//# sourceMappingURL=src/esmt.js.map