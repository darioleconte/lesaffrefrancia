odoo.define('stock_3dview.3DViewController', function (require) {
    "use strict";
    const BaseThreeDController = require('3dview.3DViewController');
    const ajax = require('web.ajax');
    
    var ThreeDViewController = BaseThreeDController.extend({
        config: {
            calls: {
                settings: '/stock_3dview/get_settings'
            }
        },
    });
    
    return ThreeDViewController;
});
