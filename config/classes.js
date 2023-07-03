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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcvY2xhc3Nlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7Ozs7Ozs7b0RBVW9EOztBQUVwRCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsdUJBQXVCO0lBQ3ZCLEtBQUssRUFBRTtRQUNILEtBQUssRUFBRSwwQkFBMEI7UUFDakMsNkJBQTZCO1FBQzdCLEdBQUcsRUFBRTtZQUNELEtBQUssRUFBRSxLQUFLO1lBQ1osS0FBSyxFQUFFLFVBQVU7WUFDakIsS0FBSyxFQUFFLFVBQVU7U0FDcEI7UUFDRCx5Q0FBeUM7UUFDekMsR0FBRyxFQUFFO1lBQ0QsS0FBSyxFQUFFLEVBQUU7WUFDVCxLQUFLLEVBQUUsVUFBVTtZQUNqQixLQUFLLEVBQUUsV0FBVztTQUNyQjtRQUNELFVBQVUsRUFBRTtZQUNSLEdBQUcsRUFBRSxpQkFBaUI7WUFDdEIsUUFBUSxFQUFFLFdBQVc7WUFDckIsT0FBTyxFQUFFLGFBQWE7WUFDdEIsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixRQUFRLEVBQUUscUJBQXFCO1NBQ2xDO1FBQ0QsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixVQUFVLEVBQUUsOEJBQThCO1FBQzFDLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLE1BQU0sRUFBRSxPQUFPO1FBQ2YsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLGFBQWE7UUFDdEIscUJBQXFCLEVBQUUsd0JBQXdCO1FBQy9DLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsT0FBTyxFQUFFLGFBQWE7UUFDdEIsUUFBUSxFQUFFLGNBQWM7S0FDM0I7SUFDRCxNQUFNLEVBQUU7UUFDSixNQUFNLEVBQUU7WUFDSixNQUFNLEVBQUUsdUNBQXVDO1lBQy9DLEdBQUcsRUFBRSxVQUFVO1lBQ2YsR0FBRyxFQUFFLFVBQVU7WUFDZixNQUFNLEVBQUU7Z0JBQ0osR0FBRyxFQUFFLFVBQVU7Z0JBQ2YsR0FBRyxFQUFFLFVBQVU7Z0JBQ2YsTUFBTSxFQUFFLHdCQUF3QjthQUNuQztZQUNELEtBQUssRUFBRTtnQkFDSCxHQUFHLEVBQUUsVUFBVTtnQkFDZixHQUFHLEVBQUUsVUFBVTthQUNsQjtZQUNELFNBQVMsRUFBRTtnQkFDUCxHQUFHLEVBQUUsU0FBUztnQkFDZCxLQUFLLEVBQUUsVUFBVTtnQkFDakIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLEtBQUssRUFBRSxVQUFVO2dCQUNqQixVQUFVLEVBQUUsK0JBQStCO2FBQzlDO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLEdBQUcsRUFBRSxVQUFVO2FBQ2xCO1NBQ0o7UUFDRCxLQUFLLEVBQUU7WUFDSCxLQUFLLEVBQUUsOEJBQThCO1lBQ3JDLEdBQUcsRUFBRSxrQ0FBa0M7WUFDdkMsUUFBUSxFQUFFLFdBQVc7WUFDckIsRUFBRSxFQUFFLDJDQUEyQztZQUMvQyxFQUFFLEVBQUUsUUFBUTtTQUNmO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsTUFBTSxFQUFFLGlCQUFpQjtZQUN6QixNQUFNLEVBQUUsd0JBQXdCO1NBQ25DO1FBQ0QsSUFBSSxFQUFFLG1CQUFtQjtRQUN6QixPQUFPLEVBQUU7WUFDTCxJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxPQUFPO1lBQ2IsaUNBQWlDO1NBQ3BDO1FBQ0QsVUFBVSxFQUFFO1lBQ1IsR0FBRyxFQUFFLGlCQUFpQjtZQUN0QixRQUFRLEVBQUUsV0FBVztZQUNyQixPQUFPLEVBQUUsYUFBYTtTQUN6QjtRQUNELE9BQU8sRUFBRSxhQUFhO0tBQ3pCO0lBQ0QsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLG9CQUFvQjtRQUM3QixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsY0FBYztRQUN0QixPQUFPLEVBQUUsZUFBZTtRQUN4QixNQUFNLEVBQUUsY0FBYztRQUN0QixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsY0FBYztRQUN0QixNQUFNLEVBQUUsd0JBQXdCO1FBQ2hDLE1BQU0sRUFBRSx1QkFBdUI7S0FDbEM7SUFDRCxNQUFNLEVBQUU7UUFDSixHQUFHLEVBQUUsTUFBTTtRQUNYLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0IsSUFBSSxFQUFFLEVBQUU7UUFDUixRQUFRLEVBQUUsU0FBUztRQUNuQixHQUFHLEVBQUUsa0JBQWtCO1FBQ3ZCLFVBQVUsRUFBRSxFQUFFO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxXQUFXLEVBQUUsRUFBRTtRQUNmLE9BQU8sRUFBRSxFQUFFO1FBQ1gsTUFBTSxFQUFFLEVBQUUsRUFBRSxnQ0FBZ0M7S0FDL0M7Q0FDSixDQUFDIn0=