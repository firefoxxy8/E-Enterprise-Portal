(function($){$(".publish-service").change(function(){var action="unpublish";if($(this).prop("checked")){action="publish"}$.post("/esmt/"+action+"/"+$(this).data("rid"))})})(jQuery);
//# sourceMappingURL=src/esmt.js.map