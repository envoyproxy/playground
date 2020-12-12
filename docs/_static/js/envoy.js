
(function($) {
    $(document).ready(function() {
        $(".screenshot").click(function () {
            if (!$('#img01').length) {
                $(document.body).append(
                    '<div class="modal" id="playground-modal"><span class="modal-close">&times;</span><img class="modal-content" id="img01"></div>');
                $('.modal-close').onclick = function() {
                    console.log('click closed...');
                    $('#playground-modal').hide();
                };
            }
            $('#playground-modal').show();
            $('#img01').attr('src', $('img', this).attr('src'));
        });
    });
})(jQuery);
