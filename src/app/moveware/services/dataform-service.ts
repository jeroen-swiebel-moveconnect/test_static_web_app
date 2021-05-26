import { Injectable } from '@angular/core';
import { Helpers } from '../utils/helpers';
import { Broadcaster } from './broadcaster';
import { CollectionsService } from './collections.service';
import { ContextService } from './context.service';
import { UIActionService } from './ui-action.service';

@Injectable({
    providedIn: 'root'
})
export class DataFormService {
    preventDefault: boolean = false;
    currentFocusedElement: any;

    constructor(
        private broadcaster: Broadcaster,
        private collectionService: CollectionsService,
        private contextService: ContextService,
        private actionService: UIActionService
    ) {}

    public setRuleValue(field, currentView, elem) {
        let args = {};
        if (field.isRuleValue) {
            args['value'] = field.CodeValue;
            args['sourceElement'] = elem;
            this.broadcaster.broadcast(currentView._id + 'ruleValue', args);
        }
    }
    public validateField(data, currentPage, currentView) {
        let requestObj = data;
        let currentContext = this.contextService.getContextRecord(
            currentPage.contextKey + this.contextService.getRootViewMap(currentPage.contextKey)
        );
        let req = {};
        if (currentContext) {
            if (currentContext['criteria']) {
                req = this.actionService.getUpdateNewReqObj(req, currentContext);
                requestObj = this.actionService.getUpdateNestedReq(
                    req,
                    currentContext,
                    requestObj,
                    { CodeDataObject: currentView.CodeDataObject, _id: currentView.id },
                    false
                );
            } else {
                requestObj = this.actionService.getUpdateReqObj(req, currentContext, requestObj, {
                    currentView: { _id: currentView._id }
                });
            }
        } else {
            requestObj = this.actionService.getUpdateReqObj(
                req,
                { dataObjectCodeCode: currentView.CodeDataObject },
                requestObj,
                { currentView: { _id: currentView._id } }
            );
        }

        this.collectionService.validate(requestObj).subscribe(
            () => {
                Helpers.removeErrors({ _id: currentView._id }, Object.keys(data));
            },
            (errorResponse) => {
                Helpers.addErrors(errorResponse, { _id: currentView._id });
            }
        );
    }
}
