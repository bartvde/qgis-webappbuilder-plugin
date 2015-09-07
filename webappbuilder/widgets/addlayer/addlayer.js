
var addLayerFromFile = function(){

    var readFeatures = function(text, filename){
        var formats = {"geojson": new ol.format.GeoJSON(), "kml":new ol.format.KML(), "gpx":new ol.format.GPX()};
        var ext = filename.split('.').pop().toLowerCase();
        var format = formats[ext];
        if (format){
            try {
                var crs = format.readProjection(text);
                var features = format.readFeatures(text,
                        {dataProjection: crs.getCode(),
                        featureProjection: map.getView().getProjection().getCode()});
                return features;
            } catch (e) {}
        }
        return null;
    }

    var _addLayerFromFile = function(f, color, fillColor){
        if (f) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                var features = readFeatures(contents, f.name);
                if (features){
                    var lyr = new ol.layer.Vector({
                        source:  new ol.source.Vector({
                                    features: features
                                }),
                        title: f.name,
                        isRemovable: true,
                        isSelectable: true
                    });
                    var style = function(feature, resolution) {
                        var selected = lyr.selectedFeatures;
                        if (selected && selected.indexOf(feature) != -1) {
                            return [new ol.style.Style({
                                        fill: new ol.style.Fill({
                                            color: "rgba(255, 204, 0, 1)",
                                        }),
                                        stroke: new ol.style.Stroke({
                                            color: "rgba(255, 204, 0, 1)",
                                            width: 2
                                        }),
                                        image: new ol.style.Circle({
                                            radius: 7,
                                            fill: new ol.style.Fill({
                                                color: "rgba(255, 204, 0, 1)",
                                            })
                                        })
                                    })];
                        }
                        else{
                            return [new ol.style.Style({
                                        fill: new ol.style.Fill({
                                            color: fillColor
                                        }),
                                        stroke: new ol.style.Stroke({
                                            color: color,
                                            width: 2
                                        }),
                                        image: new ol.style.Circle({
                                            radius: 7,
                                            fill: new ol.style.Fill({
                                                color: color
                                            })
                                        })
                                    })];
                        }
                    };
                    lyr.setStyle(style);
                    map.addLayer(lyr);
                }
                else{
                    $("html").css("cursor", "default");
                    alert("Failed to load file.");
                }
            }
            r.readAsText(f);
        } else {
            alert("Failed to load file");
        }
    };

    var html = '<div class="row">  ' +
            '<div class="col-md-12"> ' +
            '<form class="form-horizontal"> ' +
            '<div class="form-group"> ' +
            '<label class="col-md-4 control-label" for="new-layer-file-textbox"> File </label>'+
            '<div class="col-md-8">'  +
            '<div class="input-group">' +
            '<input id="new-layer-file-selector" type="file" accept=".geojson, .gpx, .kml" style="display:none">' +
            '<input id="new-layer-file-textbox" class="form-control" type="text">' +
            '<div class="input-group-addon">'+
            '<a href="#" onclick="$(\'input[id=new-layer-file-selector]\').click();">Browse</a>' +
            '</div></div>' +
            '</div></div>'+
            '<div class="form-group"> ' +
            '<label class="col-md-4 control-label" for="new-layer-color"> Color </label>'+
            '<div class="col-md-8"> <input value="#000000" id="new-layer-color" type="text" class="color-picker form-control">' +
            '</div></div>'+
            '<div class="form-group"> ' +
            '<label class="col-md-4 control-label" for="new-layer-fillcolor"> Fill color (polygons only) </label>'+
            '<div class="col-md-8"> <input value="#0000aa" id="new-layer-fillcolor" type="text" class="color-picker form-control">' +
            '</div></div>'+
            '</form></div></div>';

    var dialog = bootbox.dialog({
        title: "Create empty layer",
        message: html,
        buttons: {
            success: {
                label: "Ok",
                className: "btn-success",
                callback: function () {
                    var file = $("#new-layer-file-selector").prop("files")[0]
                    var color = $("#new-layer-color").val().toString();
                    var fillColor = $("#new-layer-fillcolor").val().toString();
                    busyProcess(function(){_addLayerFromFile(file, color, fillColor)}, 500);
                }
            }
        },
        show: false
    });

    dialog.on('show.bs.modal', function(){
        $(".color-picker").colorpicker();
        $('input[id=new-layer-file-selector]').change(function() {
            $('#new-layer-file-textbox').val($(this).prop("files")[0].name);
        });
    });

    dialog.modal("show");



    return false;

};
