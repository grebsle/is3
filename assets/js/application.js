var IS3 = {
    init: function() {
        this.data.init();
        this.visualisations.init();
        this.windows.init();

        // bind function to the click event
        $('#app-add-visualisation').click(this.windows.create);

        // init select picket
        $('.app-selectpicker').selectpicker();

        // sidebar toggle
        $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });
    }
};

$(document).ready(function ($) {
    IS3.init();
});
