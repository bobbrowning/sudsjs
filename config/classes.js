"use strict";
/** **********************************************
 *
 *                    Classes
 *                    -------
 *
 * The software refers to classes in this file rather
 * than having them hard-coded in.  This should make it
 * easier to change the look of the screens.
 *
 *
 * ********************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    /*  New / Amend form */
    input: {
        group: 'form-group sudsFormGroup',
        // label and field in one row
        row: {
            group: 'row',
            label: 'col-sm-3',
            field: 'col-sm-9',
        },
        // Label in one row and field on the next
        col: {
            group: '',
            label: 'col-sm-3',
            field: 'col-sm-12',
        },
        groupLinks: {
            row: 'row sudsListRow',
            envelope: 'col-sm-12',
            spacing: 'sudsFormTab',
            link: 'sudsFormTabLink',
            selected: 'sudsFormTabSelected',
        },
        label: 'col-form-label',
        parentData: 'sudsParentData sudsFormGroup',
        groupTab: 'col-sm-2',
        errors: 'error',
        form: 'sudsForm',
        buttons: 'sudsbuttons',
        autocompleteContainer: 'autocomplete-container',
        autoRemove: 'autocomplete-remove',
        pretext: 'sudspretext',
        posttext: 'sudsposttext',
    },
    output: {
        search: {
            select: 'form-select form-select-sm sudsSearch',
            row: 'row mb-2',
            col: 'col-sm-2',
            button: {
                row: 'row mb-2',
                col: 'col-sm-2',
                button: 'btn btn-primary btn-sm',
            },
            andor: {
                row: 'row mb-3',
                col: 'col-sm-2',
            },
            condition: {
                row: 'row g-3',
                field: 'col-sm-2',
                comp: 'col-sm-2',
                value: 'col-sm-4',
                valueClass: 'form-control form-control-sm ',
            },
            message: {
                col: 'col-sm-2',
            }
        },
        table: {
            table: 'table table-striped table-sm',
            row: 'table table-bordered table-hover',
            envelope: 'col-sm-12',
            th: 'border-top-0 border-left-0 border-right-0',
            tr: 'd-flex',
        },
        links: {
            button: 'btn btn-primary',
            danger: 'btn btn-outline-danger',
        },
        info: 'bi bi-info-circle',
        listRow: {
            col1: 'col-3',
            col2: 'col-9',
            //     col3: 'col-2 text-center',
        },
        groupLinks: {
            row: 'row sudsListRow',
            envelope: 'col-sm-12',
            spacing: 'sudsFormTab',
        },
        buttons: 'sudsbuttons',
    },
    delete: {
        spacing: 'sudsListTableLinks',
        fade: 'modal fade',
        dialog: 'modal-dialog',
        content: 'modal-content',
        header: 'modal-header',
        body: 'modal-body',
        footer: 'modal-footer',
        button: 'btn btn-default btn-sm',
        delete: 'btn btn-danger btn-ok',
    },
    navbar: {
        top: 'menu',
        topitem: 'topitem',
        topitemdrop: 'topitem dropdown',
        link: '',
        droplink: 'dropbtn',
        sub: 'dropdown-content',
        subnavlink: '',
        subitem: '',
        subitemdrop: '',
        sublink: '',
        active: '', /* A tag for the current page */
    }
};
