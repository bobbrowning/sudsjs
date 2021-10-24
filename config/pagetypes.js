module.exports= {
    html: {
        friendlyName:'plain old HTML',
    },
    household: {
      table: 'products',
       friendlyName: 'Household product list',
       sort: ['fullName', 'ASC'],                           
         search: {
         andor: 'and',
         searches: [
           ['class', 'eq', 'H'],
         ]                                          
       },
       columns: ['id', 'name', 'salesprice', 'description'],        
       itemClass: 'productListItem',
       view: 'pages',
    }
}