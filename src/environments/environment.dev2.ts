import { AuthConfig } from 'angular-oauth2-oidc';
export const i18nFiles = {
    LangBased: ['numbers.json', 'currencies.json', 'ca-gregorian.json', 'timeZoneNames.json'],
    common: ['weekData.json', 'numberingSystems.json', 'currencyData.json']
};

export const environment = {
    I18N_ROOT: 'assets/i18n',
    production: true,
    AUTH_SERVER_HOST_AND_PORT: 'https://moveconnectb2ctest.b2clogin.com',
    OAUTH_DISCOVERY_ENDPOINT:
        'https://moveconnectb2ctest.b2clogin.com' +
        '/moveconnectb2ctest.onmicrosoft.com/B2C_1_MW10_moveware/v2.0/.well-known/openid-configuration',
    UI_ROOT: 'https://mw10-dev2.moveconnect.com',
    FRAMEWORK_COMMAND_ROOT: 'https://mw10.moveconnect.com/api/dev',
    FRAMEWORK_QUERY_ROOT: 'https://mw10.moveconnect.com/api/dev',
    FRAMEWORK_COMMAND_CONTEXT: '',
    FRAMEWORK_QUERY_CONTEXT: '',
    CRYPTO_SALT: 'Secret Passphrase',
    appInsights: {
        instrumentationKey: 'f5800534-4d87-4478-a93f-301877725e90',
        role: 'Front-end DEV2'
    }
};

export const authConfig: AuthConfig = {
    issuer: environment.AUTH_SERVER_HOST_AND_PORT + '/03bab744-0146-434c-8725-e170682d5b65/v2.0/',
    redirectUri: environment.UI_ROOT,
    clientId: 'abd66a29-4259-4b03-9287-5d91a5d2d536',
    scope:
        'openid profile email offline_access' +
        ' https://moveconnectb2ctest.onmicrosoft.com/movewarerest/read' +
        ' https://moveconnectb2ctest.onmicrosoft.com/movewarerest/write',
    responseType: 'code',
    disableAtHashCheck: true,
    showDebugInformation: true,
    strictDiscoveryDocumentValidation: false,
    requireHttps: false
};

export const apiContext = {
    CONTEXT_ROOT_REQUIRED: true,
    FRAMEWORK_COMMAND: 'framework-command',
    FRAMEWORK_QUERY: 'framework-query'
};

if (apiContext.CONTEXT_ROOT_REQUIRED) {
    environment.FRAMEWORK_COMMAND_CONTEXT =
        environment.FRAMEWORK_COMMAND_ROOT + '/' + apiContext.FRAMEWORK_COMMAND + '/';
    environment.FRAMEWORK_QUERY_CONTEXT =
        environment.FRAMEWORK_QUERY_ROOT + '/' + apiContext.FRAMEWORK_QUERY + '/';
} else {
    environment.FRAMEWORK_COMMAND_CONTEXT = environment.FRAMEWORK_COMMAND_ROOT + '/';
    environment.FRAMEWORK_QUERY_CONTEXT = environment.FRAMEWORK_QUERY_ROOT + '/';
}
