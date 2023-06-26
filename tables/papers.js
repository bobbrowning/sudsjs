"use strict";
/**
 * Papers collection
  */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
module.exports = {
    permission: { all: ['admin', 'demo', 'trainer', 'demor', 'demod'] },
    friendlyName: 'Exam papers',
    stringify: async function (data) {
        return (data.name);
    },
    list: {
        columns: ['subject', 'name', 'notes'],
        stringify: 'name',
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        subject: {
            model: 'subjects',
            input: { type: 'select' },
        },
        name: {
            type: 'string',
        },
        notes: {
            type: 'string',
            input: { type: 'textarea' }
        },
    },
    children: {
        results: {
            collection: 'results',
            via: 'paper',
            friendlyName: 'Exam results',
            collectionList: {
                columns: ['studentId', 'subject', 'score']
            }
        }
    }
};
