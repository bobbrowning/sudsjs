"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Format textarea for report',
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
    fn: async function (inputs, exits) {
        const trace = require('track-n-trace');
        const lang = sails.config.language.EN;
        trace.log(inputs);
        let results = inputs.fieldValue;
        trace.log(results);
        results = results.replace(/(\n)+/g, '<br />');
        trace.log(results);
        return exits.success(results);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvZGlzcGxheS90ZXh0YXJlYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFFZixZQUFZLEVBQUUsNEJBQTRCO0lBRTFDLFdBQVcsRUFBRSxFQUFFO0lBRWYsTUFBTSxFQUFFO1FBQ04sVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtRQUMzQixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0tBQzVCO0lBRUQsS0FBSyxFQUFFO1FBRUwsT0FBTyxFQUFFO1lBQ1AsV0FBVyxFQUFFLFdBQVc7U0FDekI7S0FFRjtJQUVELEVBQUUsRUFBRSxLQUFLLFdBQVcsTUFBTSxFQUFFLEtBQUs7UUFDL0IsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBQ3RDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQTtRQUNyQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRWpCLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUE7UUFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNsQixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDN0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNsQixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDL0IsQ0FBQztDQUNGLENBQUEifQ==