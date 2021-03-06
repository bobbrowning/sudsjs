

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
    headerTags: `
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-DPVYYSYJ9X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'G-DPVYYSYJ9X');
    </script>
    `,
}
