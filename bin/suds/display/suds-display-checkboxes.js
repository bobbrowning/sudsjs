module.exports = {


  friendlyName: 'Format checkboxes for report',


  description: '',


  inputs: {
    attributes: { type: 'ref' },
    fieldValue: { type: 'ref' },
  },



  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let trace = require('track-n-trace');
    const lang = sails.config.language.EN;
    trace.log(inputs);
 
    let results = '';
    let attributes = inputs.attributes;
    let fieldValue=inputs.fieldValue;
    linkedTable = attributes.input.model;
    if (attributes.input.linkedTable) linkedTable = attributes.input.linkedTable;

     let checked = [];
    let values = [];
    let labels = [];
    if (linkedTable) {
      linkData=sails.helpers.sudsTableData(linkedTable)
      let fieldValues = fieldValue.split(',');
      for (let i = 0; i < fieldValues.length; i++) {
        fieldValues[i] = Number(fieldValues[i])
      }
      trace.log(fieldValues);
      let rowTitle = function (record) { return (record.id) };
      if (linkData.rowTitle
      ) {
        rowTitle = linkData.rowTitle;
      }
      if (attributes.input.filter) {
        records = await attributes.input.filter()
      }
      else {
        records = await sails.models[linkedTable].find();
      }
      for (let i = 0; i < records.length; i++) {
        trace.log(records[i]);
        values[i] = records[i].id;
        labels[i] = rowTitle(records[i]);
        if (fieldValues.includes(values[i])) { checked[i] = true; }
      }
    }
    else {
      if (attributes.validations.isIn) {
        trace.log(attributes.isIn);
        for (let i = 0; i < attributes.validations.isIn.length; i++) {
          values[i] = labels[i] = attributes.validations.isIn[i];
          if (fieldValues.includes(values[i])) { checked[i] = true; }
        }
      }
      else {
        return exits.error('No source');
      }
    }
    trace.log({ values: values, labels: labels, checked: checked });
    for (let i = 0; i < values.length; i++) {
      selected = '';
      if (!checked[i]) {continue }
      results += `
      ${labels[i]}<br />`;
     }
    return exits.success(results);
  }
}




