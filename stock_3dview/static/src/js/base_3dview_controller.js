odoo.define('3dview.3DViewController', function (require) {
    "use strict";

    var ajax = require('web.ajax');
    var core = require('web.core');
    const AbstractController = require('web.AbstractController');

    const ThreeDViewController = AbstractController.extend({

        config: {
            calls: {
                settings: ''
            }
        },

        init: function (parent, context) {
            const scope = this;
            this.context = context;
            
            const domain = scope.context.domain.length > 0 ? scope.context.domain[0] : null;
            console.log("domain: ");
            console.log(domain);
            
            this._super.apply(this, arguments);            
            
            if (scope.config.calls.settings !='') {
                
                ajax.jsonRpc(scope.config.calls.settings, 'call', { 'domain': [] }).then(function(data) {
                    
                    let settings = JSON.parse(data);
                    let refreshPeriod = parseInt(settings['refresh_period'], 10);
                    
                    if (refreshPeriod > 0) {
                        let secondsToWait = refreshPeriod;
                        let countdownInterval = setInterval(function() {
                            $('#refresh_countdown').text(--secondsToWait);
                            if (secondsToWait==0) {
                                console.log("**** reloading ****");
                                console.log(domain);
                                scope.reload();
                                secondsToWait = refreshPeriod;
                            }
                        }, 1000);
                    }
                    
                });
                
            }
        },

    });

    return ThreeDViewController;
});
