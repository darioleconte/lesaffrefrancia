odoo.define('stock_3dview.3DViewModel', function (require) {
    "use strict";
    const ajax = require('web.ajax');
    const BaseThreeDModel = require('3dview.Base3DViewModel');
    
    var ThreeDModel = BaseThreeDModel.extend({
        calls: {
            'allAreas': '/stock_3dview/get_warehouses',
            'allItems': '/stock_3dview/get_locations/all',
            'selectedItems': '/stock_3dview/get_locations/',
            'legend': '/stock_3dview/get_legend/',
        },
        fields: {
            'areaId': 'warehouse_id'
        }
    });
    return ThreeDModel;
});

