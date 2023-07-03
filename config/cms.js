"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    homePage: 'index',
    pageFile: {
        table: 'webpagesnosql;',
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy9jbXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7Ozs7bURBUW1EO0FBQ25ELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixRQUFRLEVBQUUsT0FBTztJQUNqQixRQUFRLEVBQUU7UUFDTixLQUFLLEVBQUUsZ0JBQWdCO1FBQ3ZCLDhCQUE4QjtRQUM5QixFQUFFLEVBQUUsUUFBUTtRQUNaLEtBQUssRUFBRSxPQUFPO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsSUFBSSxFQUFFLE1BQU07S0FDZjtJQUNELFVBQVUsRUFBRTs7Ozs7Ozs7OztLQVVYO0NBQ0osQ0FBQyJ9