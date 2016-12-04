/*
   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
'use strict';

var React = require('react');
var ColumnProperties = require('./columnProperties.js');
var deep = require('./deep.js');
var isFunction = require('lodash/isFunction');
var zipObject = require('lodash/zipObject');
var assign = require('lodash/assign');
var defaults = require('lodash/defaults');
var toPairs = require('lodash/toPairs');
var without = require('lodash/without');

var GridRow = React.createClass({
    displayName: 'GridRow',

    getDefaultProps: function getDefaultProps() {
        return {
            "isChildRow": false,
            "showChildren": true,
            "data": {},
            "columnSettings": null,
            "rowSettings": null,
            "hasChildren": false,
            "useGriddleStyles": true,
            "useGriddleIcons": true,
            "isSubGriddle": false,
            "paddingHeight": null,
            "rowHeight": null,
            "parentRowCollapsedClassName": "parent-row",
            "parentRowExpandedClassName": "parent-row expanded",
            "parentRowCollapsedComponent": "▶",
            "parentRowExpandedComponent": "▼",
            "onRowClick": null,
            "multipleSelectionSettings": null
        };
    },
    //"handleModalAction": null
    handleClick: function handleClick(e) {
        if (this.props.onRowClick !== null && isFunction(this.props.onRowClick)) {
            this.props.onRowClick(this, e);
        } else if (this.props.hasChildren) {
            this.props.toggleChildren();
        }
    },
    handleSelectionChange: function handleSelectionChange(e) {
        //hack to get around warning that's not super useful in this case
        return;
    },
    handleSelectClick: function handleSelectClick(e) {
        if (this.props.multipleSelectionSettings.isMultipleSelection) {
            if (e.target.type === "checkbox") {
                this.props.multipleSelectionSettings.toggleSelectRow(this.props.data, this.refs.selected.checked);
            } else {
                this.props.multipleSelectionSettings.toggleSelectRow(this.props.data, !this.refs.selected.checked);
            }
        }
    },
    handleLandClick: function handleLandClick(landId, e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.handleModalAction) {
            this.props.handleModalAction("landPreview", landId);
        }
        return false;
    },
    handleOfferClick: function handleOfferClick(offerId, e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.handleModalAction) {
            this.props.handleModalAction("offerEdit", offerId);
        }
        return false;
    },
    verifyProps: function verifyProps() {
        if (this.props.columnSettings === null) {
            console.error("gridRow: The columnSettings prop is null and it shouldn't be");
        }
    },
    formatData: function formatData(data) {
        if (typeof data === 'boolean') {
            return String(data);
        }
        return data;
    },
    render: function render() {
        var _this = this;

        this.verifyProps();
        var that = this;

        var columns = this.props.columnSettings.getColumns();

        // make sure that all the columns we need have default empty values
        // otherwise they will get clipped
        var defaultValues = zipObject(columns, []);

        // creates a 'view' on top the data so we will not alter the original data but will allow us to add default values to missing columns
        var dataView = assign({}, this.props.data);

        defaults(dataView, defaultValues);
        var data = toPairs(deep.pick(dataView, without(columns, 'children')));
        var nodes = data.map(function (col, index) {
            var returnValue = null;
            var meta = _this.props.columnSettings.getColumnMetadataByName(col[0]);

            //todo: Make this not as ridiculous looking
            var firstColAppend = index === 0 && _this.props.hasChildren && _this.props.showChildren === false && _this.props.useGriddleIcons ? React.createElement('span', { style: _this.props.useGriddleStyles ? { fontSize: "10px", marginRight: "5px" } : null }, _this.props.parentRowCollapsedComponent) : index === 0 && _this.props.hasChildren && _this.props.showChildren && _this.props.useGriddleIcons ? React.createElement('span', { style: _this.props.useGriddleStyles ? { fontSize: "10px" } : null }, _this.props.parentRowExpandedComponent) : "";

            if (_this.props.columnSettings.hasColumnMetadata() && typeof meta !== 'undefined' && meta !== null) {
                if (typeof meta.customComponent !== 'undefined' && meta.customComponent !== null) {
                    //var customComponent = <meta.customComponent data={col[1]} rowData={dataView} metadata={meta} />;
                    //returnValue = <td onClick={this.handleClick} className={meta.cssClassName} key={index}>{customComponent}</td>;
                    // Отрисовываем сразу здесь все изменения
                    if (meta.customComponent == 'link') {
                        if (col[0] == "content_id" || dataView.GroupType == "content_id") {
                            // ленд
                            returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index }, React.createElement('a', { href: '#', onClick: _this.handleLandClick.bind(_this, col[1]) }, col[1]));
                        } else if (col[0] == "offer_id" || dataView.GroupType == "offer_id") {
                            // оффер
                            returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index }, React.createElement('a', { href: '#', onClick: _this.handleOfferClick.bind(_this, col[1]) }, col[1]));
                        } else {
                            // в других случаях
                            returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index }, col[1]);
                        }
                    } else if (meta.customComponent == 'color') {
                        var clName = "";
                        var curValue = parseFloat(col[1]);
                        if (curValue > 0) {
                            clName = "light_green";
                            if (curValue >= 30) {
                                clName = "green";
                            } else if (curValue >= 100) {
                                clName = "dark_green";
                            }
                        } else if (curValue < 0) {
                            clName = "pink";
                            if (curValue <= -30) {
                                clName = "red";
                            } else if (curValue <= -100) {
                                clName = "dark_red";
                            }
                        }
                        returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index }, React.createElement('span', { className: clName }, col[1]));
                    } else {
                        var customComponent = React.createElement(meta.customComponent, { data: col[1], rowData: dataView, metadata: meta });
                        returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index }, customComponent);
                    }
                } else {
                    returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index }, firstColAppend, _this.formatData(col[1]));
                }
            }

            return returnValue || React.createElement('td', { onClick: _this.handleClick, key: index }, firstColAppend, col[1]);
        });

        if (nodes && this.props.multipleSelectionSettings && this.props.multipleSelectionSettings.isMultipleSelection) {
            var selectedRowIds = this.props.multipleSelectionSettings.getSelectedRowIds();

            nodes.unshift(React.createElement('td', { key: 'selection' }, React.createElement('input', {
                type: 'checkbox',
                checked: this.props.multipleSelectionSettings.getIsRowChecked(dataView),
                onChange: this.handleSelectionChange,
                ref: 'selected' })));
        }

        //Get the row from the row settings.
        var className = that.props.rowSettings && that.props.rowSettings.getBodyRowMetadataClass(that.props.data) || "standard-row";

        if (that.props.isChildRow) {
            className = "child-row";
        } else if (that.props.hasChildren) {
            className = that.props.showChildren ? this.props.parentRowExpandedClassName : this.props.parentRowCollapsedClassName;
        }
        return React.createElement('tr', { onClick: this.props.multipleSelectionSettings && this.props.multipleSelectionSettings.isMultipleSelection ? this.handleSelectClick : null, className: className }, nodes);
    }
});

module.exports = GridRow;
