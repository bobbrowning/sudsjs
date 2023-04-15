/**
 * Subjects collection
 * 
 * A schema could be a JSON Schema which has been copied into this Javascript file 
 * and modified. This would be a good approach if you have an existing file with data in JSON format.
 * You can create a schema from sample data using a tool such as 
 *   https://extendsclass.com/json-schema-validator.html
 * 
 * The $id and $schema lines would be been removed, althiough they would be ignored if included. 
 * The following are added:
 * * permission - who is allowed to view or update the file
 * * stringify - this provides a field or a function which creates a string that identifies the record.
 * * list identifies the fields to be included in a standard list of the file
 * * "$ref": "{{dbDriver}}Header", has been added. This is replaced by standard header fields like _id, _rev etc
 *    $ref: 'xxx'  looks for an object called xxx in a standard file called fragments.js in the tables directory.
 *    in this case the {{dbDriver}} string is replaced by the database driver name which allows me to use
 *    the same schema for different databases which have different requirements. The couchDB header is 'couchHeader'
 * * The papers section would be added also, as it does not refer to a real field, but indicates that 
 *   the papers records are child records and the foreign key in the papers records is called 'subject'.`
 * 
 *  Note that additions do not have to be strict JSON formar.
 * 
 */
module.exports = {
   description: 'This file includes records for each subject. This is the normalized version in which results are in a separate file.',
   friendlyName: 'Subjects (normalised version)',
   "permission": { "all": ["admin", "demo", "trainer", "demor"] },
   "stringify": "name",
   "list": {
      "open": "papers",
      "columns": ["name", "notes"]
   },
   "properties": {
      "$ref": "{{dbDriver}}Header",
      "name": {
         "friendlyName": "Subject name",
         "type": "string"
      },
      "notes": {
         "type": "string",
         "description": "Notes about the subject that may be useful",
         "input": { "type": "textarea" }
      },
      "papers": {
         "collection": "papers",
         "via": "subject",
         "friendlyName": "Exam papers",
         "collectionList": {
            "columns": ["name"]
         }
      }
   }
}