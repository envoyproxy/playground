
(function($) {
    $(document).ready(function() {
        $(".screenshot").click(function () {
            if (!$('#img01').length) {
                $(document.body).append(
                    '<div class="modal" id="playground-modal"><span class="close">&times;</span><img class="modal-content" id="img01"></div>');
            }
            $('#playground-modal').css('display', 'block');
            $('#img01').attr('src', this.src);
        });
    });
})(jQuery);
