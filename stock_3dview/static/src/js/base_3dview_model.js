odoo.define('3dview.Base3DViewModel', function (require) {
    "use strict";
    const ajax = require('web.ajax');
    const AbstractModel = require('web.AbstractModel');

    /** This object stores the information needed by the renderer:
     * it will be updated when the user changes the selection of items to be displayed.
     */    
    var modelData = {};
    
    var ThreeDModel = AbstractModel.extend({
        
        // the calls need to be redifined in the extended class        
        calls: {
            'allAreas': '/3dview/get_areas',
            'allItems': '/3dview/get_items/all',
            'selectedItems': '/3dview/get_selected_items/',
            'legend': '/3dview/get_legend',
        },
        
        // the field names need to be redifined in the extended class 
        fields: {
            'areaId': 'area_id'
        },
                
        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        /**
         * This method returns the complete state necessary for the renderer
         * to display the currently viewed data. Since data are stored in the modelData
         * object, it returns an object with a reference to it.
         *
         * @override
         * @returns {*}
         */
        get: function () {
            return {
                data: modelData  // data are taken from the object modelData defined above
            };
        },

        /**
         * Initialize the object that stores the data
         *
         * @override
         */
        init: function (parent, context) {
            modelData.parent = parent;
            modelData.areas = {};
            modelData.allItems3d = [];
            modelData.selectedItems3d = [];
            modelData.legendItems = [];
            modelData.areasLoaded = false;
            modelData.selectedItems3dLoaded = false;
            modelData.allItems3dLoaded = false;
            modelData.legendLoaded = false;
            this._super.apply(this, arguments);
        },

        /**
         * Load the data from Odoo.
         * The load method is called once in a model, when we load the data for the
         * first time.  The method returns (a deferred that resolves to) some kind
         * of token/handle.  The handle can then be used with the get method to
         * access a representation of the data.
         *
         * @override
         * @param {Object} params
         * @param {string} params.modelName the name of the model
         * @returns {Deferred} The deferred resolves to some kind of handle
         */
        load: async function (params) {
        	this.domain = params.domain || this.domain || [];
            var self = this;
            
            modelData.customdata_request_type = sessionStorage.getItem('customdata_request_type');
            sessionStorage.removeItem('customdata_request_type');
            
            return $.when(
                this._loadAreas(params),
                this._loadAllItems3d(params),
                this._loadSelectedItems3d(params),
                this._loadLegend(params)
            ).then(function (areasLoaded, allItems3dLoaded, selectedItems3dLoaded, legendLoaded) {
                modelData.areasLoaded = areasLoaded;
                modelData.allItems3dLoaded = allItems3dLoaded;
                modelData.selectedItems3dLoaded = selectedItems3dLoaded;
                modelData.legendLoaded = legendLoaded;
            });
        },

        /**
         * Reload the selected items3d (e.g. locations and workcenters).
         * Information about the area and all the items3d are not fetched: we already have them
         * When something changes, the data may need to be refetched.  This is the
         * job for this method: reloading (only if necessary) all the data and
         * making sure that they are ready to be redisplayed.
         *
         * @override
         * @param id // this is not documented, but it is passed when called
         * @param {Object} params
         * @returns {Deferred}
         */
        reload: function (id, params) {
            console.log("reload()");
            modelData.selectedItems3dLoaded = false;
            return $.when(
                this._loadSelectedItems3d(params)
            ).then(function(selectedItems3dLoaded) {
                modelData.selectedItems3dLoaded = selectedItems3dLoaded;
            })
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * Load the information about the area (e.g. a warehouse or a factory).
         * We assume that an area stores a planimetry and has 3D sizes.
         * It is responsibility of the python controller to filter out areas that don't.
         * This function stores the information in the object modelData.areas, where the key is
         * the id of the area.
         *
         * @param {Object} params
         * @returns {Deferred}
         */
        _loadAreas: function (params) {
            return ajax.jsonRpc(this.calls.allAreas, 'call', { 'domain': [] }).then(function(data) {
                var items = JSON.parse(data);
                //console.log(items);
                items.forEach(function(wh) {
                    modelData.areas[wh.id] = wh;
                });
                return true;
            });
        },

        /**
         * Load the information about all the items3d (e.g. locations and workcenters).
         * All the items3d are needed by the renderer for the wireframes.
         * This function stores the information in the object modelData.allItems3d as an array.
         *
         * @param {Object} params
         * @returns {Deferred}
         */
        _loadAllItems3d: function (params) {
            return ajax.jsonRpc(this.calls.allItems, 'call', { 'domain': [[this.fields.areaId,'!=',false]] }).then(function(data) {
                modelData.allItems3d = JSON.parse(data);
                console.log("received:");
                console.log(modelData.allItems3d);
                return true;
            });
        },

        /**
         * Load the legend.
         *
         * @param {Object} params
         * @returns {Deferred}
         */
        _loadLegend: function (params) {
            let request_type = modelData.customdata_request_type || 'tagged';
            return ajax.jsonRpc(this.calls.legend + request_type, 'call', { 'domain': [] }).then(function(data) {
                modelData.legendItems = JSON.parse(data);
                return true;
            });
        },

        /**
         * Load the information about the selected items3d.
         * This function stores the information in the object modelData.selectedItems3d as an array.
         *
         * @param {Object} params
         * @returns {Deferred}
         */
        _loadSelectedItems3d: function (params) {
            let request_type = modelData.customdata_request_type || 'tagged';
            return ajax.jsonRpc(this.calls.selectedItems + request_type, 'call', { 'domain': params.domain  }).then(function(data) {
                modelData.selectedItems3d = JSON.parse(data);
                //console.log('selected items3d:');
                //console.log(modelData.selectedItems3d);
                return true;
            });
        },
        
    });
    return ThreeDModel;
});
