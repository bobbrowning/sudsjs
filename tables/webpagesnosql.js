"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** *****************************************************
 *
 * Web Pages table schema
 *
 * **************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Web pages',
    description: `Web pages for the starter content management system. There is one row per page. 
    The primary identifier for each page is called a 'slug'. So accessing a page is /page/[slug].
    There is a page type field which can be 'H' for a normal HTML page and 'R' for a redirect page.
    When a new page is created the system first asks for the page type and then presents only 
    the appropriate fields for that type.  A redirect page simply results in the target page
    being presented to the user.`,
    permission: { view: ['admin', 'demo', 'web'], edit: ['web'] },
    /** One column can be assigned as the record  type.
     *  Different record types may be able to view different groups of columns.
     *  The two record types at present are
     *    H: Plain old HTML and
     *    R: Redirect/Alias
     * */
    recordTypeColumn: 'pagetype',
    /** 'normal' columns for a table listing.  The detailed listing of each row will have
     *   every column the user is permitted to see. */
    list: {
        columns: ['title', 'slug', 'pagetype', 'status', 'parent', 'onMenu'],
    },
    /** This determines how each row is to be described in things like links.
     *  In this case the title column. */
    stringifyView: true,
    stringify: 'title',
    /** The columns are split into groups for the row listing and the edit form */
    groups: {
        basic: {
            static: true,
            columns: ['title', 'pagetype', 'slug'],
        },
        settings: {
            friendlyName: 'Settings',
            columns: ['author', 'status', 'parent', 'onMenu', 'expires', 'embargo', 'view',],
        },
        redirect: {
            friendlyName: 'Redirect/alias',
            columns: ['targetPage', 'targetUrl', 'openIn'],
            recordTypes: ['R'], // Only for redirect
        },
        content: {
            friendlyName: 'Page Content',
            columns: ['headline', 'pageContent'],
            recordTypes: ['H'], //  Only for HTML 
        },
        files: {
            friendlyName: 'Images/Files',
            columns: ['image1', 'image2', 'image3', 'image4', 'image5'],
            recordTypes: ['H'],
        },
        subpages: {
            friendlyName: 'Sub pages',
            columns: ['subpages',],
            /** When the group is loaded, these child records will be visible */
            open: 'subpages',
        },
        technical: {
            friendlyName: 'Technical settings',
            columns: ['titleTag', 'metaDescription', 'headerTags',],
            recordTypes: ['H'], //  Only for HTML 
        },
    },
    /**
     *       PROPERTIES
     *
     * One entry per column in the table / field in the document.
     *   friendlyName is the name displayed for that column. If omitted the field name
     *     is 'humanised' (fooBar would become 'Foo Bar')
     *   description is used in the tooltip for that field in the update form as well as
     *     being documentation.  If omitted the friendlyName is used.
     */
    required: ['slug'],
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        title: {
            type: 'string',
            description: 'This is to identify the page. Note that this is used on the menu.',
        },
        pagetype: {
            friendlyName: 'Page type',
            description: 'Cannot be changed once set',
            type: 'string',
            input: {
                required: true,
                type: 'select',
                recordTypeFix: true, // Once selected can't be changed (except by the superuser)
            },
            values: {
                H: 'Plain old HTML',
                R: 'Redirect',
            },
        },
        /** Used to create the URL of the page. Must be unique  */
        slug: {
            type: 'string',
            input: {
                type: 'text',
                api: { route: '/unique', }
            },
        },
        /** Dates can be type number or string. If it is a number it is the mumber of milliseconds since 1/1/70
         * If it is string it is ISO format.      */
        embargo: {
            type: 'string',
            description: 'Embargo Date (ISO Format)',
            input: { type: 'date', width: '220px' },
            display: { type: 'date' },
        },
        expires: {
            type: 'string',
            description: 'Expiry Date (ISO Format)',
            input: { type: 'date', width: '220px' },
            display: { type: 'date' },
        },
        parent: {
            model: 'webpagesnosql',
            description: 'The page above this one in the hierarchy',
            friendlyName: 'Parent page',
            input: {
                type: 'autocomplete',
                search: 'title',
                placeholder: 'Start typing page title (case sensitive)',
                width: '80%', // To allow for the clear symbol 
            },
        },
        onMenu: {
            friendlyName: 'Menu order (omitted if off menu)',
            type: 'number',
            display: { tableHeading: 'Menu Order' },
        },
        status: {
            friendlyName: 'Page status',
            type: 'string',
            values: {
                'D': 'Draft',
                'P': 'Published',
                'H': 'On hold',
            },
            input: {
                required: true,
                type: 'radio',
            }
        },
        headline: {
            type: 'string',
        },
        author: {
            model: 'user',
            description: 'The Author or maintainer of this page.',
            friendlyName: 'Original author',
            input: {
                width: '80%',
                type: 'autocomplete',
                search: 'fullName',
                placeholder: 'Number or type name (case sensitive)',
                default: '#loggedInUser', // special code for the logged in user.
            },
        },
        /**   Redirect only  */
        targetPage: {
            type: 'number',
            friendlyName: 'Target page for redirect',
            model: 'webpagesnosql',
            input: {
                type: 'autocomplete',
                search: 'title',
                placeholder: 'Start typing page title (case sensitive)',
                width: '80%',
            },
        },
        targetUrl: {
            friendlyName: 'Target URL for redirect',
            type: 'string',
        },
        openIn: {
            friendlyName: 'Open target in',
            type: 'string',
            values: {
                T: 'This window',
                W: 'Another window',
            },
            input: { type: 'radio' }
        },
        /**   HTML page  only  */
        pageContent: {
            type: 'string',
            description: `This is the main content of the page. 
            If you want to include images, you can go to the images section 
            and upload an image. Then submit.  Go back to edit / images. 
            The image you upload will have a link. Click with the right 
            mouse button and copy the link. Then use the image function 
            on this page and paste the URL. `,
            input: {
                format: 'col',
                type: 'ckeditor4',
                height: 300,
                placeholder: 'Please enter page content',
            },
            display: { truncateForTableList: 50 },
        },
        view: {
            type: 'string',
            values: function () {
                return require('../config/suds').views; // The views are stored in the suds.js config file
            },
            input: {
                type: 'select',
            }
        },
        /** upload files. The uploaded files will be given a unique name unless keepFileName is true  */
        image1: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image2: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image3: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image4: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image5: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        titleTag: {
            type: 'string',
            friendlyName: 'title for the &lt;title&gt; tag',
        },
        metaDescription: {
            type: 'string',
            friendlyName: 'meta data - description tag',
            description: 'Description of this page fr search engines.',
            input: { type: 'textarea' },
        },
        headerTags: {
            type: 'string',
            friendlyName: 'Other header tags',
            description: 'Additional tags for the heading section of the page.',
            input: { type: 'textarea' },
            display: { type: 'html' },
        },
        /** This is not a real column in the database. But it defines how child rows are to be displayed.    */
        subpages: {
            description: `Pages below this page in the hierarchy of pages.`,
            collection: 'webpagesnosql',
            via: 'parent',
            collectionList: {
                heading: 'Sub pages',
                columns: ['_id', 'title', 'slug', 'pagetype', 'status', 'onMenu'],
                sort: ['onMenu', 'ASC'],
            },
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicGFnZXNub3NxbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvd2VicGFnZXNub3NxbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBQ2I7Ozs7MERBSTBEO0FBQzFELE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixZQUFZLEVBQUUsV0FBVztJQUN6QixXQUFXLEVBQUU7Ozs7O2lDQUtnQjtJQUM3QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQzdEOzs7OztTQUtLO0lBQ0wsZ0JBQWdCLEVBQUUsVUFBVTtJQUM1QjtzREFDa0Q7SUFDbEQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUM7S0FDdkU7SUFDRDt5Q0FDcUM7SUFDckMsYUFBYSxFQUFFLElBQUk7SUFDbkIsU0FBUyxFQUFFLE9BQU87SUFDbEIsOEVBQThFO0lBQzlFLE1BQU0sRUFBRTtRQUNKLEtBQUssRUFBRTtZQUNILE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUM7U0FDekM7UUFDRCxRQUFRLEVBQUU7WUFDTixZQUFZLEVBQUUsVUFBVTtZQUN4QixPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7U0FDbkY7UUFDRCxRQUFRLEVBQUU7WUFDTixZQUFZLEVBQUUsZ0JB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