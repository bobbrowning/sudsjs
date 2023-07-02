
/** Schema Types
 * 
 * The Schema type is split into three parts
 * # TableData: Basic information about the file/table/collection. 
 *              Called tabledata because this all started with SQL.
 * 
 * # Properties: Information about each field in the file
 * 
 * # Children: Information about files that link to this file as children. 
 * 
 * For a sinple example of a schema using this see: 
 * https://github.com/bobbrowning/sudsjs/blob/main/tables/results.js
 * 
 * 
 */


export type Cache = { [key: string]: Properties };

export type Schema = TableData & {
  properties?: Properties;                              /* Fields in documents in this collection (columns in this table) */
  children?: Children;                                  /* Details of collections that link to this one */
  attributes?: Properties;                               /* attributes used internally instead of properties always use properties */
}
/** The only case that a value in this object this is a string is a $ special key.  $ref is used to insert a standard header 
 * from fragments.js. e.g.   $ref: "fragments.js#/{{dbDriver}}Header"  The dbDriver tag is a kludge to allow the same schema 
 * to be used for different databases and would unusual in production. */

export type TableData = {
  friendlyName?: string;                                /* Normal short name */
  description?: string;                                 /* Longer description which appears as a tool-tip on input forms */
  permission?: { [key: string]: string[]; };            /* Permission sets for different operations */
  addRow?: string;                                      /* Title that appears in the 'add document/record' */
  stringlify?: string | object;                         /* Fieldname or function that identifies document */
  recordTypeColumn?: string;                            /* If the document has different record types, the field that identifies */
  required?: string[];                                 /* List of required feilds for compatibility with JSON Schema, but can be in individual properties */
  open?: string;                                        /* When a single document is listed this child list is open */
  opengroup?: string;
  list?: {                                              /* Applies to a standard listing of the collection */
    view?: string;                                      /*    Couch only - view that is used for listing */
    columns?: string[];                                 /*    List of columns */
    subschemaName: string;                                /* create friendlyName for each top level item in the subschema */
  };
  /** The columns can be split into groups for editing and display purposes
   * Once the edit/view page is loaded then user can switch between groups with
   * a menu. Any columns not listed here are automatically included in a
   * group called 'other' */
  groups?: {
    [key: string]: {                                    /* Key value set where key is a code and value is an object for each: */
      friendlyName?: string;                            /*     Normal name */
      activityLog?: boolean;                            /*     This is the activity log group (only one) */
      limit?: number;                                   /*      Only applies to the actifity log group - number listed */
      open?: string;                                    /*      When a document is listed this group is open */
      activities?: string[];                            /*      List of child collections that are logged on the activity log */
      permission?: { [key: string]: string[] };                            /*      Permission sets for this group */
      recordTypes?: string[];
      columns?: string[];                               /*      Fields in this group */
    };
  };

}

export type SubSchema = {                                             /* Describes the items in an array or object */
  type?: string;                                      /* Type of item */
  properties?: Properties;                            /* Properties of item */
  required: string[];

}
export type Properties = { [key: string]: Property };

export type Property = {
  type?: "string" | "number" | "boolean" | "object" | "array" | "integer";   /* Not required if there is a model */
  friendlyName?: string;                               /* Normal name for the field */
  description?: string;                                /* Longer description used in the tooltip for this field in the update form */
  example?: string;                                    /* Exampe value */
  primaryKey?: boolean;                                 /* Yes if this is the primary key */
  canView?: boolean;                                    /* Set in merge-attributes for the permission set of the current user. */
  canEdit?: boolean;                                    /* as above */
  array?: { type: 'multiple' | 'single' };                /* Treated as a single field on input/display */
  extendedDescription?: string;                        /* Very long description */
  permission?: { [key: string]: string[]; };           /* Permission sets */
  noSchema?: boolean;                                   /* This field doesn't exist in the schema - would be in a view created by Couch */
  properties: Properties;                              /* If there is a sub-document */
  recordType: boolean;                               /* If there is a record type column - set the recordtypefix boolean for that element */                                  /* When a single document is listed, this group is open */
  helpText: string;
  items?: SubSchema;
  input?: {                                            /* How the field is presented and processed on input */
    type?: string;                                      /* Type for input tag, or name of helper fnction  */
    required?: boolean;                                /* Seems a better place than in an array in the top level, but accepts either */
    placeholder?: string;
    route?: string;                                    /* used if there is an api */
    recordTypeFix?: boolean;                            /* used in create-field.js */
    /* Any additional key value pairs are added to the input tag or used by the helper program */
    [key: string]: string | boolean | number | object;
  };
  process?: {                                           /* Special propcessing requirements */
    uploadFile?: boolean;                               /* Upload file */
    JSON?: boolean;                                     /* Stored as JSON - especially array type single allows storage of checboxes as single field in sql database */
    /* Internal use only */
    createdAt?: boolean;                                /* These fields are automatically generated by the system */
    updatedAt?: boolean;
    updatedBy?: boolean;
  };
  display?: {                                          /* Display specification for thsi field */
    type?: "date" | "html" | "color" | "datetime" | string;   /*  If not one of these, then will be the name of a helper function */
    width?: string;                                    /* width, for example '100px' */
    tableHeading?: string;                             /* The headng for this field when listed in a table */
    truncateForTableList?: number;                     /* Field will be trucated to this in tabular presentation **/
    maxWidth?: number;                                 /* Max width of table column */
    minWidth?: number;                                 /* Min width of table column */
  };
  /** Values for selects or checkboxes etc. Can be an array, key-value object, or function */
  values?: string | string[] | number[] | object;
  model?: string;                                      /* This is a link to another collection */
  database?: {                                         /* Database-specific for this field in the schema e.g. BIGINT */
    type?: string;
    length?: number;
  };
  /* Internal use only */
  enum?: string | string[] | number[] | object;
  object: Properties;                                  /* Copy of properties for legacy code */
  key: string;
  qualifiedName: string[];
  qualifiedFriendlyName: string[];
};

/** These are collections that link to documents in this collection 
 *  When this field is listed child documents are listed. This defines how these 
 *  documents are listed.
*/
export type Children = {
  description?: string;                                /* Description */
  collection: string;                                  /* Collection/ table  */
  via: string;                                         /* Foreign key in child */
  collectionList?: {                                   /* This defines this listing in the parent listing */
    limit?: number;                                    /* Max number */
    order?: string;                                    /* Order defaults to 'updatedAt' */
    direction: "DESC" | "ASC";                         /* Ascending.descending  defaults to DESC */
    heading: string;                                   /* Spoecial heading */
    columns: string[];                                 /* Fields listed defaults to all */
    addChildTip?: string;                              /* There will be a link to add a new child document - this tip can be added */
    derive: {                                          /* Some calculations can be shown on ths listing */
      [key: string]: any;
    }
  }
}

