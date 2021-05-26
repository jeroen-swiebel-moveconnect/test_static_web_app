import { Injectable } from '@angular/core';
import { StandardCodes } from '../constants/StandardCodes';
import Utils from './utils';
import { UserService } from './user-service';
import { StandardCodesIds } from '../constants/StandardCodesIds';

@Injectable({
    providedIn: 'root'
})
export class DesignerService {
    constructor(private userService: UserService) {}

    public getIndexByComponent(parentComponent, components) {
        if (parentComponent && parentComponent.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
            if (!Utils.isArrayEmpty(parentComponent.Children)) {
                return parentComponent.Children.length;
            }
        } else if (
            parentComponent &&
            parentComponent.CodeType === StandardCodes.CODE_TYPE_TASK_BAR
        ) {
            if (!Utils.isArrayEmpty(parentComponent.CodeDesigner)) {
                return parentComponent.CodeDesigner.length;
            }
        } else {
            return components.length;
        }
    }

    public getUpdateNewReqObj(reqObj, context) {
        reqObj = {
            type: context.dataObjectCodeCode,
            _id: context.id
        };
        return reqObj;
    }

    public getUpdateNestedReq(reqObj, context, requestPayload, currentView) {
        if (context['criteria']) {
            let relationship = {};
            relationship['type'] = context['criteria'].dataObjectCodeCode;
            relationship['_id'] = context['criteria'].id;
            let obj = this.getUpdateNestedReq(
                relationship,
                context['criteria'],
                requestPayload,
                currentView
            );
            let relationships = [];
            relationships.push(obj);
            reqObj['relationships'] = relationships;
        } else {
            let recordId = requestPayload._id;
            delete requestPayload._id;
            reqObj = {
                type: currentView.CodeDataObject,
                _id: recordId,
                meta: {
                    viewId: StandardCodesIds.DESIGNER_DETAILS_FIELD_ID,
                    userId: this.userService.getUserId()
                },
                payload: requestPayload
            };
        }
        return reqObj;
    }

    public getRequestObjForLayoutUpdate(reqOBJ, element, userId, currentRecord) {
        reqOBJ.push({
            type: 'Codes',
            _id: currentRecord._id,
            relationships: [
                {
                    type: 'CodeDesigner',
                    _id: element._id,
                    meta: {
                        viewId: StandardCodesIds.DESIGNER_DETAILS_FIELD_ID,
                        userId: userId
                    },
                    payload: {
                        CodeColumns: element.cols,
                        CodeRows: element.rows,
                        CodeColumn: element.x,
                        CodeRow: element.y
                    }
                }
            ],
            userId: userId
        });
        return reqOBJ;
    }

    public getRequestObj(requestPayload, currentContext, currentPage) {
        if (!currentContext) {
            return this.createNewReq(requestPayload, null, currentPage);
        } else {
            let reqObj = this.createNewReq(null, currentContext, currentPage);
            let nestedReqObject = this.getNestedReqObj(
                reqObj,
                currentContext,
                requestPayload,
                currentPage
            );
            return nestedReqObject;
        }
    }

    public createNewReq(requestPayload, currentContext, currentPage) {
        if (requestPayload) {
            return {
                type: 'Codes',
                meta: {
                    viewId: currentPage.CodeElement
                },
                payload: requestPayload
            };
        } else {
            return {
                _id: currentContext.id,
                type: currentContext.dataObjectCodeCode,
                meta: {}
            };
        }
    }

    public getNestedReqObj(reqObj, context, requestPayload, currentPage) {
        if (context['criteria'] && context['criteria']['id']) {
            let relationship = {};
            relationship['type'] = context['criteria'].dataObjectCodeCode;
            relationship['_id'] = context['criteria'].id;
            let obj = this.getNestedReqObj(
                relationship,
                context['criteria'],
                requestPayload,
                currentPage
            );
            let relationships = [];
            relationships.push(obj);
            reqObj['relationships'] = relationships;
        } else {
            let relationships = [];
            relationships.push({
                type: 'CodeDesigner',
                meta: {
                    viewId: currentPage.CodeElement,
                    userId: this.userService.getUserId()
                },
                payload: requestPayload
            });
            reqObj['relationships'] = relationships;
        }
        return reqObj;
    }
}
