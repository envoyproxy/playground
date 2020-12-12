
(function($) {
    $(document).ready(function() {
        $(".screenshot").click(function () {
            console.log('OPENING MODAL');
            $("BOOM").appendTo('body').modal();
        });
    });
})(jQuery);
