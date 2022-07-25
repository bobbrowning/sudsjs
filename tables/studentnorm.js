/**
 * 
 * Student table - normalised moned
 * 
 */
module.exports = {
    description: 'Student - normalised model',

    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo','trainer'] },
    list: {
    columns: ['name','address1','address2','city','zip','results'],
    },
    standardHeader: true,
     attributes: {
           name: {
            type: 'string'
        },
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
        exams: {
            collection: 'examstaken',
            via: 'studentId',
            friendlyName: 'Exams taken',          //Heading to the listing 
            collectionList: {                                            // Contact notes are listed below the person's record
              limit: 999,                           // number of child records listed in the detail page
              order: '_id',                 // The order in which the are listed 
              direction: 'DESC',                  // ASC or DESC
              addRow: 'Add a new result',
              columns: ['student','subject',],
      
            },
             
        },

        results: {
            collection: 'results',
            via: 'studentId',
            friendlyName: 'Results',          //Heading to the listing 
            addRow: false,
            collectionList: {                                            // Contact notes are listed below the person's record
              limit: 999,                           // number of child records listed in the detail page
              order: '_id',                 // The order in which the are listed 
              direction: 'DESC',                  // ASC or DESC
              addRow: 'Add a new result',
              columns: ['subject','paper','score'],
           
            },
             
        },

    }
}