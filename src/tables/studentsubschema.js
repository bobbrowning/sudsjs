"use strict";
/**
 *
 * Student table - normalised moned
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
let db = require('../bin/suds/db');
let lookup = require('../bin/suds/lookup-value');
module.exports = {
    description: 'Student - normalised model',
    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo', 'trainer', 'demov'] },
    list: {
        columns: ['name', 'address', 'subjects'],
        subschemaName: 'exams',
    },
    standardHeader: true,
    subschema: {
        key: 'subjects',
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string'
        },
        address: {
            type: 'object',
            properties: {
                address1: {
                    type: 'string'
                },
                address2: {
                    type: 'string'
                },
                city: {
                    type: 'string'
                },
                zip: {
                    type: 'string'
                },
            },
        },
        subjects: {
            type: 'string',
            array: { type: 'single' },
            friendlyName: 'Subjects taken',
            description: 'Check those that apply',
            model: 'subschema',
            input: {
                type: 'checkboxes',
                search: {
                    searches: [
                        ['group', 'eq', 'exams'],
                    ]
                }
            },
            display: { type: 'list' },
        }
    }
};
