

/** **********************************************
 * 
 *           Content Management System
 *           -------------------------
 * 
 *   The CMS included here is a starter app so see how
 *   the software can be used.
 * 
 *********************************************** */


module.exports = {
    homePage: 'index',     /* slug of the home page */
    pageFile: {
        table: 'webpages',
        /* Columns in the page File */
        id: 'pageno',
        title: 'title',
        status: 'status',
        embargo: 'embargo',
        expires: 'expires',
        slug: 'slug',

    },
}
