import { ErrorHandler, Injectable } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
    constructor(private loggingService: LoggingService) {}

    handleError(error: any) {
        console.error(error);
        this.loggingService.logException(error);
    }
}
