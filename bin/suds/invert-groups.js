module.exports = function (tableData, attributes) {

  // merge extra attributes with attributes 
  trace = require('track-n-trace');
  trace.log({ inputs: arguments, level: `verbose` });
  let fieldList = Object.keys(attributes);
  let assigned = {};
  let groupLookup = {};
  if (!tableData.groups) {
    tableData.groups = { other: { columns: fieldList } };
  }
  if (!tableData.groups.other) {
    tableData.groups.other = { columns: [] };
  }
  if (!tableData.groups.other.columns) { tableData.groups.other.columns = [] }
  trace.log(tableData.groups, {level: 'verbose'});
  for (group of Object.keys(tableData.groups)) {
    trace.log(group, {level: 'verbose'});
    if (tableData.groups[group].columns)
      for (key of tableData.groups[group].columns) {
        groupLookup[key] = group;
        assigned[key] = true;
      }
  }
  for (key of fieldList) {
    if (!assigned[key]) {
      tableData.groups.other.columns.push(key);
      groupLookup[key] = 'other';
    }
  }
  trace.log(groupLookup, {level: 'verbose'});
  return (groupLookup);
}




