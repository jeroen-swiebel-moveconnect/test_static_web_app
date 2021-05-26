import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoggingService {
    appInsights: ApplicationInsights;
    constructor() {
        if (environment.appInsights.instrumentationKey) {
            this.appInsights = new ApplicationInsights({
                config: {
                    instrumentationKey: environment.appInsights.instrumentationKey,
                    enableAutoRouteTracking: true // option to log all route changes
                }
            });
            this.appInsights.loadAppInsights();
            var telemetryInitializer = (envelope) => {
                envelope.tags['ai.cloud.role'] = environment.appInsights.role;
                envelope.tags['ai.cloud.roleInstance'] = 'web client';
            };
            this.appInsights.addTelemetryInitializer(telemetryInitializer);
        }
    }

    logPageView(name?: string, url?: string) {
        // option to call manually
        this.appInsights.trackPageView({
            name: name,
            uri: url
        });
    }

    logEvent(name: string, properties?: { [key: string]: any }) {
        this.appInsights.trackEvent({ name: name }, properties);
    }

    logMetric(name: string, average: number, properties?: { [key: string]: any }) {
        this.appInsights.trackMetric({ name: name, average: average }, properties);
    }

    logException(exception: Error, severityLevel?: number) {
        this.appInsights.trackException({ exception: exception, severityLevel: severityLevel });
    }

    logTrace(message: string, properties?: { [key: string]: any }) {
        this.appInsights.trackTrace({ message: message }, properties);
    }
}
