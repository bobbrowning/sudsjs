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
     *       ATTRIBUTES
     *
     * One entry per column in the table.
     *   friendlyName is the name displayed for that column. If onmitted the field name
     *     is 'humanised' (fooBar would become 'Foo Bar')
     *   description is used in the tooltip for that field in the update form as well as
     *     being documentation.  If omitted the friendlyName is used.
     */
    properties: {
        /* This table doesn't have a standard header. The primary key is noy id or _id */
        pageno: {
            friendlyName: 'Document ID',
            primaryKey: true,
            autoincrement: true,
            type: 'string',
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            database: { type: 'bigint' },
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'createdAt' },
            permission: { view: ['none'] },
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            database: { type: 'bigint' },
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'updatedAt' },
            permission: { view: ['none'] },
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',
            process: { type: 'updatedBy' },
            permission: { view: ['none'] },
        },
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
                required: true,
                type: 'text',
                validations: {
                    api: {
                        route: '/unique',
                    }
                }
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
            model: 'webpages',
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
            model: 'webpages',
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
            database: { type: 'text' },
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
            collection: 'webpages',
            via: 'parent',
            collectionList: {
                heading: 'Sub pages',
                columns: ['title', 'slug', 'pagetype', 'status', 'onMenu'],
                sort: ['onMenu', 'ASC'],
            },
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicGFnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3dlYnBhZ2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7OzswREFJMEQ7O0FBRTFELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixZQUFZLEVBQUUsV0FBVztJQUN6QixXQUFXLEVBQUU7Ozs7O2lDQUtnQjtJQUM3QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQzdEOzs7OztTQUtLO0lBQ0wsZ0JBQWdCLEVBQUUsVUFBVTtJQUM1QjtzREFDa0Q7SUFDbEQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUM7S0FDdkU7SUFDRDt5Q0FDcUM7SUFDckMsU0FBUyxFQUFFLE9BQU87SUFDbEIsOEVBQThFO0lBQzlFLE1BQU0sRUFBRTtRQUNKLEtBQUssRUFBRTtZQUNILE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUM7U0FDekM7UUFDRCxRQUFRLEVBQUU7WUFDTixZQUFZLEVBQUUsVUFBVTtZQUN4QixPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7U0FDbkY7UUFDRCxRQUFRLEVBQUU7WUFDTixZQUFZLEVBQUUsZ0JBQWdCO1lBQzlCLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDO1lBQzlDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLG9CQUFvQjtTQUMzQztRQUNELE9BQU8sRUFBRTtZQUNMLFlB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