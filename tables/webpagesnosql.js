"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicGFnZXNub3NxbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvd2VicGFnZXNub3NxbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7MERBSTBEOztBQUUxRCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsWUFBWSxFQUFFLFdBQVc7SUFDekIsV0FBVyxFQUFFOzs7OztpQ0FLZ0I7SUFDN0IsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUM3RDs7Ozs7U0FLSztJQUNMLGdCQUFnQixFQUFFLFVBQVU7SUFDNUI7c0RBQ2tEO0lBQ2xELElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDO0tBQ3ZFO0lBQ0Q7eUNBQ3FDO0lBQ3JDLGFBQWEsRUFBRSxJQUFJO0lBQ25CLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLDhFQUE4RTtJQUM5RSxNQUFNLEVBQUU7UUFDSixLQUFLLEVBQUU7WUFDSCxNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDO1NBQ3pDO1FBQ0QsUUFBUSxFQUFFO1lBQ04sWUFBWSxFQUFFLFVBQVU7WUFDeEIsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO1NBQ25GO1FBQ0QsUUFBUSxFQUFFO1lBQ04sWUFBWSxFQUFFLGdCQUFnQjtZQUM5QixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQztZQUM5QyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxvQkFB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