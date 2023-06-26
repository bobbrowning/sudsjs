"use strict";
/**
 * Subjects collection
  */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
let db = require('../bin/suds/db');
let lookup = require('../bin/suds/lookup-value');
module.exports = {
    permission: { all: ['admin', 'demo', 'trainer', 'demor', 'demod'] },
    friendlyName: 'Exam papers',
    stringify: 'name',
    list: {
        columns: ['name', 'notes'],
        stringify: 'name',
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string',
        },
        notes: {
            type: 'string',
            input: { type: 'textarea' }
        },
    },
};
