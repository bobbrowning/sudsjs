var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
module.exports = {
    friendlyName: 'Format checkboxes for report',
    description: '',
    inputs: {
        attributes: { type: 'ref' },
        fieldValue: { type: 'ref' }
    },
    exits: {
        success: {
            description: 'All done.'
        }
    },
    fn: function (inputs, exits) {
        return __awaiter(this, void 0, void 0, function () {
            var trace, lang, results, attributes, fieldValue, checked, values, labels, fieldValues, i, rowTitle, i, i, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trace = require('track-n-trace');
                        lang = sails.config.language.EN;
                        trace.log(inputs);
                        results = '';
                        attributes = inputs.attributes;
                        fieldValue = inputs.fieldValue;
                        linkedTable = attributes.input.model;
                        if (attributes.input.linkedTable)
                            linkedTable = attributes.input.linkedTable;
                        checked = [];
                        values = [];
                        labels = [];
                        if (!linkedTable) return [3 /*break*/, 5];
                        linkData = sails.helpers.sudsTableData(linkedTable);
                        fieldValues = fieldValue.split(',');
                        for (i = 0; i < fieldValues.length; i++) {
                            fieldValues[i] = Number(fieldValues[i]);
                        }
                        trace.log(fieldValues);
                        rowTitle = function (record) { return (record.id); };
                        if (linkData.rowTitle) {
                            rowTitle = linkData.rowTitle;
                        }
                        if (!attributes.input.filter) return [3 /*break*/, 2];
                        return [4 /*yield*/, attributes.input.filter()];
                    case 1:
                        records = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, sails.models[linkedTable].find()];
                    case 3:
                        records = _a.sent();
                        _a.label = 4;
                    case 4:
                        for (i = 0; i < records.length; i++) {
                            trace.log(records[i]);
                            values[i] = records[i].id;
                            labels[i] = rowTitle(records[i]);
                            if (fieldValues.includes(values[i])) {
                                checked[i] = true;
                            }
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        if (attributes.validations.isIn) {
                            trace.log(attributes.isIn);
                            for (i = 0; i < attributes.validations.isIn.length; i++) {
                                values[i] = labels[i] = attributes.validations.isIn[i];
                                if (fieldValues.includes(values[i])) {
                                    checked[i] = true;
                                }
                            }
                        }
                        else {
                            return [2 /*return*/, exits.error('No source')];
                        }
                        _a.label = 6;
                    case 6:
                        trace.log({ values: values, labels: labels, checked: checked });
                        for (i = 0; i < values.length; i++) {
                            selected = '';
                            if (!checked[i]) {
                                continue;
                            }
                            results += "\n      " + labels[i] + "<br />";
                        }
                        return [2 /*return*/, exits.success(results)];
                }
            });
        });
    }
};
