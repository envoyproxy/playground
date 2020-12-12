
(function($) {
    $(document).ready(function() {
        $(".screenshot").click(function () {
            if (!$('#img01').length) {
                $(document.body).append(
                    '<div class="modal" id="playground-modal"><span class="modal-close">&times;</span><img class="modal-content" id="img01"></div>');
                $('.modal-close').onclick = function() {
                    $('#playground-modal').css('display', 'none');
                };
            }
            $('#playground-modal').css('display', 'block');
            console.log($('img', this).attr('src'));
            $('#img01').attr('src', $('img', this).attr('src'));
        });
    });
})(jQuery);
