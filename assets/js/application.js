var IS3 = {
    init: function() {
        this.data.init();
        this.visualisations.init();

        // bind function to the click event
        $('#app-add-visualisation').click(this.visualisations.add);

        // init select picket
        $('.app-selectpicker').selectpicker();

        // sidebar toggle
        $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });
    }
};

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$(document).ready(function ($) {
    IS3.init();
});
