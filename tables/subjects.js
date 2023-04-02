/**
 * Subjects collection
 */
module.exports = {
   permission: { all: ['admin', 'demo', 'trainer', 'demor'] },
   stringify: 'name',                 // Summarise record content (can be a function, but in this case is a field name)
   standardHeader: true,              // Standard record header included (see below) 
    list: {                           // How the data is to be listed.
      open: 'papers',                 // When the record detail is shown, the 'papers' child records are also listed 
      columns: ['name', 'notes'],     // In the tabular file listing only the name and notes are shown
   },
   /** 'attributes is a list of fields in each record/row/document.  
    * 
    * These are in addition to the (optional) standard header containing typically 
    * record key (id or _id); create date; last edit date; created by;  
    * In CouchDB  databases there is also a 'collection' field.
    * 
    */
   properties: {
      name: {                          // Subject name
         friendlyName: 'Subject name', // Appears where the field is listed
         type: 'string',
      },
      /* No friendlyName - so derived from the fieldname. In this case 'Notes'. */
      notes: {                        
         type: 'string',              
         description: 'Notes about the subject that may be useful', // Appears in the tooltip on the edit page
         input: { type: 'textarea' }
      },
 
      /** 'papers' is not a real field. It refers to child records that link back to this record */
      papers: {                       // Each subject has a number of papers (child records)
         collection: 'papers',        // stored in the 'papers' file
         via: 'subject',              // where the foreign key is 'subject'
         friendlyName: 'Exam papers',
         collectionList: {            // Where papers are listed for a subject these fields are included from the papers record.
            columns: ['name'],
         }
      },
   },
}