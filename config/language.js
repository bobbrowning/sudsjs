"use strict";
/**
 *     LANGUAGE
 *
 * This file contains fixed fragments of text that are output by the system.
 *
 * The text is all under 'EN' to allow for future enhancement for multi-lingual operation.
 * This is not coded now.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    EN: {
        activityLog: 'Activity Log',
        addCondition: 'Add condition',
        addIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>`,
        addRow: `New`,
        addRowTip: 'Click here to add a new record to ',
        and: 'And',
        alltrue: 'All true',
        apiCheck: '<div class="spinner-border text-success" role="status"><span class="sr-only"></span></div><span > Checking...</span>',
        apiWait: `<span  style="color: green"><small><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg> This will be checked when you click on another field</small></span>`,
        asc: 'ascending',
        arrowDown: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
  </svg>`,
        arrowUp: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
  </svg>`,
        back: 'Back',
        backToTables: ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/><path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/></svg> Admin home page`,
        backUp: 'delete last ',
        change: 'Change',
        changepd: 'Change password',
        childdata: 'Related data..',
        clear: 'Clear',
        contains: 'contains',
        createdAt: 'Created',
        date: 'Date',
        description: 'description',
        desc: 'descending',
        delete: 'Delete',
        deleteIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>`,
        deleteRow: 'Delete',
        deleteAYS: 'Are you sure you want to delete this item?',
        edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-checklist" viewBox="0 0 16 16">
    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
    <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
  </svg> Edit`,
        eq: 'equals',
        false: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
  <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
</svg>`,
        enterNumber: 'Please enter a *number*.',
        field: 'Field',
        filter: 'Filter',
        filterAgain: 'Another condition',
        filterList: 'Filter',
        filterButtonIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16">
    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z"/>
  </svg>`,
        filterBy: 'Filtered by ',
        filterSelect: 'Which field?',
        filterStart: 'Start search',
        footnoteText: 'SUDSjs version {{version}}',
        forgottenPassword: 'Forgotten password (disabled)',
        formGroup: 'Click for further data: ',
        forTable: 'for table',
        fullList: 'Full listing',
        ge: 'greater than or equals',
        gt: 'greater than',
        guest: 'Guest user',
        homeHeading: 'Database administration',
        le: 'less than or equals',
        limit: 'Limited to',
        linkTo: 'Up to',
        listTable: ``,
        listRow: 'List data',
        listRowChildLink: `
    <button type="button" class="btn btn-outline-primary btn-sm">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-down" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1h-2z"/>
    <path fill-rule="evenodd" d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z"/>
  </svg> List
  </button>`,
        listLink: ` <button type="button" class="btn btn-outline-primary btn-sm">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
</svg> Details
  </button>`,
        listParentLink: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1h-2z"/>
    <path fill-rule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 1.707V10.5a.5.5 0 0 1-1 0V1.707L5.354 3.854a.5.5 0 1 1-.708-.708l3-3z"/>
  </svg> Details ...`,
        listRowHelpView: 'Click here to  view this row',
        listRowHelpEdit: 'Click here to  edit this row',
        lt: 'less than',
        login: 'Log in',
        mandatory: 'Error: Required Field',
        max: 'Error: This must be less that ',
        maxLength: 'Error: The maximum number of characters allowed is ',
        min: 'Error: This must be greater that ',
        minLength: 'Error: The minimum number of characters allowed is ',
        more: 'more ...',
        moreThan: 'moreThan',
        nan: 'Error: this field must be a number',
        ne: 'not equal to',
        next: 'Next page >',
        new: 'New record',
        no: 'no',
        No: 'No',
        noChildren: '<i>No associated data</i>',
        notInt: 'Error: this field must be a whole number with no decimal point',
        notEmail: 'Error: This must be a valid email,address',
        notSpecified: '<i>Not specified</i>',
        or: 'Or',
        pleaseWait: 'Please wait',
        populate: 'Create update form',
        prev: '< Previous page',
        //  returnToParent: 'Return',  // not used any more                                          
        recordCount: 'Record count',
        reason: 'Reason',
        row: 'Record',
        rows: 'Records',
        rowAdded: 'Record added to table - No:',
        rowNumber: 'Record key',
        rowUpdated: 'Record updated in table ',
        select: 'Please select',
        sortedBy: 'Sorted by: ',
        spinner: '<div class="spinner-border spinner-border-sm text-secondary" role="status"><span class="sr-only">&nbsp</span></div>',
        startOver: 'Filter',
        startswith: 'saterts with',
        startTyping: 'or start typing ...',
        submit: 'Submit',
        table: 'Table',
        tableList: 'List table data',
        TableListRow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`,
        TableEditRow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`,
        thereIs: 'There is',
        thereAre: 'There are',
        true: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
    <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/>
  </svg>`,
        type: 'Start typing...',
        uploaded: 'Will replace file currently uploaded: ',
        update: 'Update record',
        updatedAt: 'Last updated',
        updatedBy: 'by',
        yes: 'Yes',
        value: 'Value',
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29uZmlnL2xhbmd1YWdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsRUFBRSxFQUFFO1FBQ0EsV0FBVyxFQUFFLGNBQWM7UUFDM0IsWUFBWSxFQUFFLGVBQWU7UUFDN0IsT0FBTyxFQUFFLDJVQUEyVTtRQUNwVixNQUFNLEVBQUUsS0FBSztRQUNiLFNBQVMsRUFBRSxvQ0FBb0M7UUFDL0MsR0FBRyxFQUFFLEtBQUs7UUFDVixPQUFPLEVBQUUsVUFBVTtRQUNuQixRQUFRLEVBQUUsc0hBQXNIO1FBQ2hJLE9BQU8sRUFBRSw0akJBQTRqQjtRQUNya0IsR0FBRyxFQUFFLFdBQVc7UUFDaEIsU0FBUyxFQUFFOztTQUVWO1FBQ0QsT0FBTyxFQUFFOztTQUVSO1FBQ0QsSUFBSSxFQUFFLE1BQU07UUFDWixZQUFZLEVBQUUsa2VBQWtlO1FBQ2hmLE1BQU0sRUFBRSxjQUFjO1FBQ3RCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsU0FBUyxFQUFFLGdCQUFnQjtRQUMzQixLQUFLLEVBQUUsT0FBTztRQUNkLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLElBQUksRUFBRSxNQUFNO1FBQ1osV0FBVyxFQUFFLGFBQWE7UUFDMUIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFOzs7U0FHWDtRQUNELFNBQVMsRUFBRSxRQUFRO1FBQ25CLFNBQVMsRUFBRSw0Q0FBNEM7UUFDdkQsSUFBSSxFQUFFOzs7Y0FHQTtRQUNOLEVBQUUsRUFBRSxRQUFRO1FBQ1osS0FBSyxFQUFFOztPQUVSO1FBQ0MsV0FBVyxFQUFFLDBCQUEwQjtRQUN2QyxLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSxRQUFR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