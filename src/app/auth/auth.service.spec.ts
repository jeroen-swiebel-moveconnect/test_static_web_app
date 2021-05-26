// import { inject, TestBed } from '@angular/core/testing';
// import { AuthService } from './auth.service';
// import { AuthConfig, OAuthLogger, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
// import { CollectionsService } from '../moveware/services';
// import { CacheService } from '../services/cache.service';
// import { authConfig } from '../../environments/environment';
// import { HttpClient, HttpHandler } from '@angular/common/http';
// import { WebBaseProvider } from '../providers';
// import { Observable } from 'rxjs';

// describe('AuthService', () => {
//     const sampleAccessToken =
//         'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.' +
//         'eyJpc3MiOiJodHRwczovL21vdmVjb25uZWN0YjJjdGVzdC5iMmNsb2dpbi5jb20vMDNiYWI3NDQtMDE0Ni00MzRjLTg3MjUtZTE3MDY4MmQ1YjY' +
//         '1L3YyLjAvIiwiZXhwIjoxNjEzNjIyMzk0LCJuYmYiOjE2MTM2MTg3OTQsImF1ZCI6ImFiZDY2YTI5LTQyNTktNGIwMy05Mjg3LTVkOTFhNWQyZD' +
//         'UzNiIsImlkcF9hY2Nlc3NfdG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKdWIyNWpaU0k2SW1kU2QySllaSFJpV1c1VmFFSm1NalpCYVZKSWVEb' +
//         'FZRbk5STkVWbU1ISnNNVVJJVG05NVIzTmlSVUVpTENKaGJHY2lPaUpTVXpJMU5pSXNJbmcxZENJNkltNVBiek5hUkhKUFJGaEZTekZxUzFkb1dI' +
//         'TnNTRkpmUzFoRlp5SXNJbXRwWkNJNkltNVBiek5hUkhKUFJGaEZTekZxUzFkb1dITnNTRkpmUzFoRlp5SjkuZXlKaGRXUWlPaUl3TURBd01EQXd' +
//         'NeTB3TURBd0xUQXdNREF0WXpBd01DMHdNREF3TURBd01EQXdNREFpTENKcGMzTWlPaUpvZEhSd2N6b3ZMM04wY3k1M2FXNWtiM2R6TG01bGRDOW' +
//         '1Namc0TWpKa1pTMWlaamc0TFRSa1pqUXRPVGcxTlMwM09HTTJNMkV5TjJJeU9HRXZJaXdpYVdGMElqb3hOakV6TmpFNE5EZzJMQ0p1WW1ZaU9qR' +
//         'TJNVE0yTVRnME9EWXNJbVY0Y0NJNk1UWXhNell5TWpNNE5pd2lZV05qZENJNk1Dd2lZV055SWpvaU1TSXNJbUZqY25NaU9sc2lkWEp1T25WelpY' +
//         'STZjbVZuYVhOMFpYSnpaV04xY21sMGVXbHVabThpTENKMWNtNDZiV2xqY205emIyWjBPbkpsY1RFaUxDSjFjbTQ2YldsamNtOXpiMlowT25KbGN' +
//         'USWlMQ0oxY200NmJXbGpjbTl6YjJaME9uSmxjVE1pTENKak1TSXNJbU15SWl3aVl6TWlMQ0pqTkNJc0ltTTFJaXdpWXpZaUxDSmpOeUlzSW1NNE' +
//         'lpd2lZemtpTENKak1UQWlMQ0pqTVRFaUxDSmpNVElpTENKak1UTWlMQ0pqTVRRaUxDSmpNVFVpTENKak1UWWlMQ0pqTVRjaUxDSmpNVGdpTENKa' +
//         'k1Ua2lMQ0pqTWpBaUxDSmpNakVpTENKak1qSWlMQ0pqTWpNaUxDSmpNalFpTENKak1qVWlYU3dpWVdsdklqb2lRVlZSUVhVdk9GUkJRVUZCVkVs' +
//         'Q2VTOUxNbEJpYjI1M1JIZHNhMWRDVjJSMVRtUkRSRTloZGtSc1kyNUJWVUZSWVVSNVJGaEtiUzlrU2xsQ2JXOXJhamR5UlNzeVluazBOMk5uTUZ' +
//         'kcVVGQnNWa3RWU0VaWmFGQmhSMFZ5VEhWRFNuYzlQU0lzSW1GdGNpSTZXeUp3ZDJRaVhTd2lZWEJ3WDJScGMzQnNZWGx1WVcxbElqb2liVzkyWl' +
//         'ZOMWNIQnZjblJFWlhZaUxDSmhjSEJwWkNJNklqWmxaamhpWlRJNUxXTmhaV010TkdWbU9TMWhNR0ppTFdVeFlqVXhZekF4WkRJNU15SXNJbUZ3Y' +
//         '0dsa1lXTnlJam9pTVNJc0ltWmhiV2xzZVY5dVlXMWxJam9pU0c5emMyRnBiaUlzSW1kcGRtVnVYMjVoYldVaU9pSlVZVzUyYVhJaUxDSnBaSFI1' +
//         'Y0NJNkluVnpaWElpTENKcGNHRmtaSElpT2lJeE5DNHlNREF1T1RJdU1UQTFJaXdpYm1GdFpTSTZJbFJoYm5acGNpQkliM056WVdsdUlpd2liMmx' +
//         'rSWpvaVpqSXhOVEE1TlRjdFlqYzBPUzAwTjJReExXSTFOamd0TmpaaFl6WmtNVE0zT1RobUlpd2ljR3hoZEdZaU9pSXpJaXdpY0hWcFpDSTZJak' +
//         'V3TURNeU1EQXdSakEyTURjNU5EZ2lMQ0p5YUNJNklqQXVRVmRqUVROcFMwazRiMmxmT1VVeVdWWllha2RQYVdWNWFXbHRMUzFITjNONWRteFBiM' +
//         'HgyYUhSU2QwSXdjRTV1UVVWckxpSXNJbk5qY0NJNkltOXdaVzVwWkNCd2NtOW1hV3hsSUdWdFlXbHNJaXdpYzJsbmJtbHVYM04wWVhSbElqcGJJ' +
//         'bXR0YzJraVhTd2ljM1ZpSWpvaWJIRm1SamhZU1dwYVJETXdTVjlWT1daWVRXWmtOM296TFVGTmVXaFRlbFJYY0ZKbVdtWkNaMnBFV1NJc0luUmx' +
//         'ibUZ1ZEY5eVpXZHBiMjVmYzJOdmNHVWlPaUpQUXlJc0luUnBaQ0k2SW1ZeU9EZ3lNbVJsTFdKbU9EZ3ROR1JtTkMwNU9EVTFMVGM0WXpZellUST' +
//         'NZakk0WVNJc0luVnVhWEYxWlY5dVlXMWxJam9pZEdGdWRtbHlMbWh2YzNOaGFXNUFiVzkyWldOdmJtNWxZM1F1WTI5dElpd2lkWEJ1SWpvaWRHR' +
//         'nVkbWx5TG1odmMzTmhhVzVBYlc5MlpXTnZibTVsWTNRdVkyOXRJaXdpZFhScElqb2lOMHh6WkY5UmIzUTRSVXQyYVRSTWNHSTBVVFJCVVNJc0lu' +
//         'WmxjaUk2SWpFdU1DSXNJbmRwWkhNaU9sc2lZamM1Wm1KbU5HUXRNMlZtT1MwME5qZzVMVGd4TkRNdE56WmlNVGswWlRnMU5UQTVJbDBzSW5odGM' +
//         'xOXpkQ0k2ZXlKemRXSWlPaUpzVG13MmIyWkNUalEwTlVkeGRFSlZZbDlHZW1GaFNVMVRkV3BUV2pVNU9YVmFkVXd5YlRsRWFuSTBJbjBzSW5odG' +
//         'MxOTBZMlIwSWpveE16a3pPVEkxTURrNWZRLmpuT1lHOVpSeDNsTXNSX3d2YVA0cWg5YU1tNENzU3poSmxtT3Npb1lJcFZySkllQ0xaeDhoWXZMa' +
//         'mpMbXJlSHJhNEp1alpjc2tidHRqaVNIRk4tWDM0RmZnTFFmWTdycWdMSWlCT3JTRldhWkJBeDNHNG5IMzMwTHF1US1ralpKV0oxNGtjbW5MbkFB' +
//         'TWtoZmFlZGJhckZObU1wSERJX194eEZZV0FWZnNTYnl1aUhPdHhOVEowQXRnaDloVW96NktkLVYwWnNqcGNJLUxCeXl3STdiVV9XT2FRc0FTLU4' +
//         '5RTdVeGdpb1hJNGl6QmJjX0pSeEphTGxVbW91eTJmOF9INFNrNVVZeHRKQ2pKRFRJYjF3YUVkOGxzX3FjMWlXeVpjaDFMbm9FVGpwem5FUEJmOH' +
//         'FrTlpRbFYtbDVKeXExMHFEUEhVeFliaWc0YjZPZHdLa2I2USIsImlkcCI6Imh0dHBzOi8vbG9naW4ubWljcm9zb2Z0b25saW5lLmNvbS9mMjg4M' +
//         'jJkZS1iZjg4LTRkZjQtOTg1NS03OGM2M2EyN2IyOGEvdjIuMCIsIm5hbWUiOiJUYW52aXIgSG9zc2FpbiIsIm9pZCI6ImZlNDlmMzBhLTdlMDAt' +
//         'NDY2YS04NDQyLTgxZmRhNTM0YjIyYSIsInN1YiI6ImZlNDlmMzBhLTdlMDAtNDY2YS04NDQyLTgxZmRhNTM0YjIyYSIsImdpdmVuX25hbWUiOiJ' +
//         'UYW52aXIiLCJlbWFpbHMiOlsidGFudmlyLmhvc3NhaW5AbW92ZWNvbm5lY3QuY29tIl0sInRmcCI6IkIyQ18xX01XMTBfbW92ZXdhcmUiLCJub2' +
//         '5jZSI6IlJ6TlliRUZ5Zmk1UExraERkbXg1YURWLWVXaElhMFYwT1d0aU5EWktSVEphYlZWaVJVNUxaR28xVVRGSSIsInNjcCI6IndyaXRlIHJlY' +
//         'WQiLCJhenAiOiJhYmQ2NmEyOS00MjU5LTRiMDMtOTI4Ny01ZDkxYTVkMmQ1MzYiLCJ2ZXIiOiIxLjAiLCJpYXQiOjE2MTM2MTg3OTR9.QAE0YGH' +
//         'ultNXE8pBQB7IfbVuqrY71NwWivqCo551ZoHMgC4B8TazEbQ5SHw8pVTdmA4tHSrbksqPYyTM8Q3TepfZB10_GdyjHzuVdEOQMvCxCW_zKF9FME' +
//         'KCln9tYG-DsX0jMT0B8Npsoekh01hdkjhDuHSoGnkfGgl49cQjH-yKgrddsPEizJ02S5D3dmvoezce4OKRLxA_l-9Jlm3pDNJmREy64pNA3MIHA' +
//         'VWrvUvrhEgC8q7D7xF-c807Lk-TxzS8jYMWN6mYAg7j3JyixxultL6c-1wGJKSmi0szwSYUFbHYvYSx0PGYnDyVcVx-XMsbtjvyUsoENUlWPVkPMQ';
//     const sampleIdtoken =
//         'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.' +
//         'eyJleHAiOjE2MTM2MjIzOTQsIm5iZiI6MTYxMzYxODc5NCwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9tb3ZlY29ubmVjdGIyY3Rlc3QuYjJ' +
//         'jbG9naW4uY29tLzAzYmFiNzQ0LTAxNDYtNDM0Yy04NzI1LWUxNzA2ODJkNWI2NS92Mi4wLyIsInN1YiI6ImZlNDlmMzBhLTdlMDAtNDY2YS04ND' +
//         'QyLTgxZmRhNTM0YjIyYSIsImF1ZCI6ImFiZDY2YTI5LTQyNTktNGIwMy05Mjg3LTVkOTFhNWQyZDUzNiIsIm5vbmNlIjoiUnpOWWJFRnlmaTVQT' +
//         'GtoRGRteDVhRFYtZVdoSWEwVjBPV3RpTkRaS1JUSmFiVlZpUlU1TFpHbzFVVEZJIiwiaWF0IjoxNjEzNjE4Nzk0LCJhdXRoX3RpbWUiOjE2MTM2' +
//         'MTg3ODgsImlkcF9hY2Nlc3NfdG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKdWIyNWpaU0k2SW1kU2QySllaSFJpV1c1VmFFSm1NalpCYVZKSWV' +
//         'EbFZRbk5STkVWbU1ISnNNVVJJVG05NVIzTmlSVUVpTENKaGJHY2lPaUpTVXpJMU5pSXNJbmcxZENJNkltNVBiek5hUkhKUFJGaEZTekZxUzFkb1' +
//         'dITnNTRkpmUzFoRlp5SXNJbXRwWkNJNkltNVBiek5hUkhKUFJGaEZTekZxUzFkb1dITnNTRkpmUzFoRlp5SjkuZXlKaGRXUWlPaUl3TURBd01EQ' +
//         'XdNeTB3TURBd0xUQXdNREF0WXpBd01DMHdNREF3TURBd01EQXdNREFpTENKcGMzTWlPaUpvZEhSd2N6b3ZMM04wY3k1M2FXNWtiM2R6TG01bGRD' +
//         'OW1Namc0TWpKa1pTMWlaamc0TFRSa1pqUXRPVGcxTlMwM09HTTJNMkV5TjJJeU9HRXZJaXdpYVdGMElqb3hOakV6TmpFNE5EZzJMQ0p1WW1ZaU9' +
//         'qRTJNVE0yTVRnME9EWXNJbVY0Y0NJNk1UWXhNell5TWpNNE5pd2lZV05qZENJNk1Dd2lZV055SWpvaU1TSXNJbUZqY25NaU9sc2lkWEp1T25Wel' +
//         'pYSTZjbVZuYVhOMFpYSnpaV04xY21sMGVXbHVabThpTENKMWNtNDZiV2xqY205emIyWjBPbkpsY1RFaUxDSjFjbTQ2YldsamNtOXpiMlowT25Kb' +
//         'GNUSWlMQ0oxY200NmJXbGpjbTl6YjJaME9uSmxjVE1pTENKak1TSXNJbU15SWl3aVl6TWlMQ0pqTkNJc0ltTTFJaXdpWXpZaUxDSmpOeUlzSW1N' +
//         'NElpd2lZemtpTENKak1UQWlMQ0pqTVRFaUxDSmpNVElpTENKak1UTWlMQ0pqTVRRaUxDSmpNVFVpTENKak1UWWlMQ0pqTVRjaUxDSmpNVGdpTEN' +
//         'Kak1Ua2lMQ0pqTWpBaUxDSmpNakVpTENKak1qSWlMQ0pqTWpNaUxDSmpNalFpTENKak1qVWlYU3dpWVdsdklqb2lRVlZSUVhVdk9GUkJRVUZCVk' +
//         'VsQ2VTOUxNbEJpYjI1M1JIZHNhMWRDVjJSMVRtUkRSRTloZGtSc1kyNUJWVUZSWVVSNVJGaEtiUzlrU2xsQ2JXOXJhamR5UlNzeVluazBOMk5uT' +
//         'UZkcVVGQnNWa3RWU0VaWmFGQmhSMFZ5VEhWRFNuYzlQU0lzSW1GdGNpSTZXeUp3ZDJRaVhTd2lZWEJ3WDJScGMzQnNZWGx1WVcxbElqb2liVzky' +
//         'WlZOMWNIQnZjblJFWlhZaUxDSmhjSEJwWkNJNklqWmxaamhpWlRJNUxXTmhaV010TkdWbU9TMWhNR0ppTFdVeFlqVXhZekF4WkRJNU15SXNJbUZ' +
//         '3Y0dsa1lXTnlJam9pTVNJc0ltWmhiV2xzZVY5dVlXMWxJam9pU0c5emMyRnBiaUlzSW1kcGRtVnVYMjVoYldVaU9pSlVZVzUyYVhJaUxDSnBaSF' +
//         'I1Y0NJNkluVnpaWElpTENKcGNHRmtaSElpT2lJeE5DNHlNREF1T1RJdU1UQTFJaXdpYm1GdFpTSTZJbFJoYm5acGNpQkliM056WVdsdUlpd2liM' +
//         'mxrSWpvaVpqSXhOVEE1TlRjdFlqYzBPUzAwTjJReExXSTFOamd0TmpaaFl6WmtNVE0zT1RobUlpd2ljR3hoZEdZaU9pSXpJaXdpY0hWcFpDSTZJ' +
//         'akV3TURNeU1EQXdSakEyTURjNU5EZ2lMQ0p5YUNJNklqQXVRVmRqUVROcFMwazRiMmxmT1VVeVdWWllha2RQYVdWNWFXbHRMUzFITjNONWRteFB' +
//         'iMHgyYUhSU2QwSXdjRTV1UVVWckxpSXNJbk5qY0NJNkltOXdaVzVwWkNCd2NtOW1hV3hsSUdWdFlXbHNJaXdpYzJsbmJtbHVYM04wWVhSbElqcG' +
//         'JJbXR0YzJraVhTd2ljM1ZpSWpvaWJIRm1SamhZU1dwYVJETXdTVjlWT1daWVRXWmtOM296TFVGTmVXaFRlbFJYY0ZKbVdtWkNaMnBFV1NJc0luU' +
//         'mxibUZ1ZEY5eVpXZHBiMjVmYzJOdmNHVWlPaUpQUXlJc0luUnBaQ0k2SW1ZeU9EZ3lNbVJsTFdKbU9EZ3ROR1JtTkMwNU9EVTFMVGM0WXpZellU' +
//         'STNZakk0WVNJc0luVnVhWEYxWlY5dVlXMWxJam9pZEdGdWRtbHlMbWh2YzNOaGFXNUFiVzkyWldOdmJtNWxZM1F1WTI5dElpd2lkWEJ1SWpvaWR' +
//         'HRnVkbWx5TG1odmMzTmhhVzVBYlc5MlpXTnZibTVsWTNRdVkyOXRJaXdpZFhScElqb2lOMHh6WkY5UmIzUTRSVXQyYVRSTWNHSTBVVFJCVVNJc0' +
//         'luWmxjaUk2SWpFdU1DSXNJbmRwWkhNaU9sc2lZamM1Wm1KbU5HUXRNMlZtT1MwME5qZzVMVGd4TkRNdE56WmlNVGswWlRnMU5UQTVJbDBzSW5od' +
//         'GMxOXpkQ0k2ZXlKemRXSWlPaUpzVG13MmIyWkNUalEwTlVkeGRFSlZZbDlHZW1GaFNVMVRkV3BUV2pVNU9YVmFkVXd5YlRsRWFuSTBJbjBzSW5o' +
//         'dGMxOTBZMlIwSWpveE16a3pPVEkxTURrNWZRLmpuT1lHOVpSeDNsTXNSX3d2YVA0cWg5YU1tNENzU3poSmxtT3Npb1lJcFZySkllQ0xaeDhoWXZ' +
//         'MampMbXJlSHJhNEp1alpjc2tidHRqaVNIRk4tWDM0RmZnTFFmWTdycWdMSWlCT3JTRldhWkJBeDNHNG5IMzMwTHF1US1ralpKV0oxNGtjbW5Mbk' +
//         'FBTWtoZmFlZGJhckZObU1wSERJX194eEZZV0FWZnNTYnl1aUhPdHhOVEowQXRnaDloVW96NktkLVYwWnNqcGNJLUxCeXl3STdiVV9XT2FRc0FTL' +
//         'U45RTdVeGdpb1hJNGl6QmJjX0pSeEphTGxVbW91eTJmOF9INFNrNVVZeHRKQ2pKRFRJYjF3YUVkOGxzX3FjMWlXeVpjaDFMbm9FVGpwem5FUEJm' +
//         'OHFrTlpRbFYtbDVKeXExMHFEUEhVeFliaWc0YjZPZHdLa2I2USIsImlkcCI6Imh0dHBzOi8vbG9naW4ubWljcm9zb2Z0b25saW5lLmNvbS9mMjg' +
//         '4MjJkZS1iZjg4LTRkZjQtOTg1NS03OGM2M2EyN2IyOGEvdjIuMCIsIm5hbWUiOiJUYW52aXIgSG9zc2FpbiIsIm9pZCI6ImZlNDlmMzBhLTdlMD' +
//         'AtNDY2YS04NDQyLTgxZmRhNTM0YjIyYSIsImdpdmVuX25hbWUiOiJUYW52aXIiLCJlbWFpbHMiOlsidGFudmlyLmhvc3NhaW5AbW92ZWNvbm5lY' +
//         '3QuY29tIl0sInRmcCI6IkIyQ18xX01XMTBfbW92ZXdhcmUiLCJhdF9oYXNoIjoiOTI4aV81enI5dmkyZTl2Z2FINFJKdyJ9.dx8mPwrnmtyQfg8' +
//         'U49xyF5NXTU1kyKaTGc2pQe-8ZXCXlPSxCA61ja5ckLF5PWOXaoXH65X5Zdl6oDudkbskNIG4KCDpCtrjwJsYKBdtoK3F-vcF6lSUGyXGjLGarr' +
//         'YsLmkM48NFI9XkG_oxUhOGafkF8HAy7MRzGDXNI78aQKgQWuD0XDhzLy2AKmsOyESc7XFdiCRGSGwTm5QemmV6l6U6cpmIg74JugDOCI4k_3q-j' +
//         'livu4Muxa7lWuuEF6dz6WgU_mynKZ0GttEeZ6skG2YCdt2WtYYDI3W8VjeIx0kT3zQvx3zteXpzKSzt9j8HpiB6GGxRDuPCCV2HZLJ6uw';
//     let authService: AuthService;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             providers: [
//                 OAuthService,
//                 CollectionsService,
//                 CacheService,
//                 UrlHelperService,
//                 HttpClient,
//                 OAuthLogger,
//                 WebBaseProvider,
//                 HttpHandler,
//                 { provide: AuthConfig, useValue: authConfig }
//             ]
//         });

//         authService = TestBed.inject(AuthService);
//     });

//     it('can init service', () => {
//         expect(authService).toBeDefined();
//     });

//     it('initAuth should work as expected', inject(
//         [OAuthService, CollectionsService],
//         (oauthService, collectionsService) => {
//             // Set up spies
//             spyOn(oauthService, 'loadDiscoveryDocument').and.returnValue(
//                 new Promise((resolve, _) => {
//                     resolve();
//                 })
//             );
//             spyOn(oauthService, 'tryLogin').and.returnValue(
//                 new Promise((resolve, _) => {
//                     resolve();
//                 })
//             );
//             spyOn(oauthService, 'hasValidIdToken').and.returnValue(true);
//             spyOn(oauthService, 'hasValidAccessToken').and.returnValue(true);
//             spyOn(oauthService, 'getAccessToken').and.returnValue(sampleAccessToken);
//             spyOn(oauthService, 'getIdToken').and.returnValue(sampleIdtoken);
//             spyOn(collectionsService, 'getUser').and.returnValue(
//                 new Observable((subscriber) => {
//                     subscriber.next(
//                         JSON.parse(
//                             '{"_id":"9999","EntityTitle":{"_id":"5555","CodeCode":"Mr","CodeDescription":' +
//                                 '{"en":"Mr","de":"Mr","es":"Mr.","th":"ดร","fr":"Mr","ar":"دكتور","nl":"Mr","en_AU":"Mr"}},' +
//                                 '"EntityFirstName":"Tanvir","EntityNumber":"EN-000349","EntityUserId":"tanvir.hossain@moveconnect.com",' +
//                                 '"EntityStatus":{"_id":"7777","CodeCode":"Active","CodeDescription":{"en":"Active"}},' +
//                                 '"EntityLastName":"Hossain"}'
//                         )
//                     );
//                 })
//             );

//             authService.initAuth().then(() => {
//                 // Verify user and CurrentUser are set in local storage
//                 expect(localStorage.getItem('user')).toBeDefined();
//                 const theUser = JSON.parse(localStorage.getItem('user'));
//                 expect(theUser.email).toEqual('tanvir.hossain@moveconnect.com');
//                 expect(theUser.preferred_username).toEqual('tanvir.hossain@moveconnect.com');

//                 expect(localStorage.getItem('CurrentUser')).toBeDefined();
//                 const currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
//                 expect(currentUser.EntityNumber).toEqual('EN-000349');
//                 expect(currentUser.EntityUserId).toEqual('tanvir.hossain@moveconnect.com');
//             });
//         }
//     ));
// });
