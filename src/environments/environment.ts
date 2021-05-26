// The file contents for the current environment will overwrite these during
// build. The build system defaults to the dev environment which uses
// `environment.ts`, but if you do `ng build --env=prod` then
// `environment.prod.ts` will be used instead. The list of which env maps to
// which file can be found in `.angular-cli.json`.

import { AuthConfig } from 'angular-oauth2-oidc';
export const i18nFiles = {
    LangBased: ['numbers.json', 'currencies.json', 'ca-gregorian.json', 'timeZoneNames.json'],
    common: ['weekData.json', 'numberingSystems.json', 'currencyData.json']
};

export const environment = {
    I18N_ROOT: 'cldr-data',
    production: false,
    AUTH_SERVER_HOST_AND_PORT: 'https://moveconnectb2ctest.b2clogin.com',
    OAUTH_DISCOVERY_ENDPOINT:
        'https://moveconnectb2ctest.b2clogin.com' +
        '/moveconnectb2ctest.onmicrosoft.com/B2C_1_MW10_moveware/v2.0/.well-known/openid-configuration',
    UI_ROOT: 'http://localhost:4200/Moveware',
    FRAMEWORK_COMMAND_ROOT: 'http://localhost:8098',
    FRAMEWORK_QUERY_ROOT: 'http://localhost:8099',
    FRAMEWORK_COMMAND_CONTEXT: '',
    FRAMEWORK_QUERY_CONTEXT: '',
    CRYPTO_SALT: 'Secret Passphrase',
    appInsights: {
        instrumentationKey: '',
        role: ''
    }
};

export const authConfig: AuthConfig = {
    issuer: environment.AUTH_SERVER_HOST_AND_PORT + '/03bab744-0146-434c-8725-e170682d5b65/v2.0/',
    redirectUri: 'http://localhost:4200', // environment.UI_ROOT,
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
    CONTEXT_ROOT_REQUIRED: false,
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
