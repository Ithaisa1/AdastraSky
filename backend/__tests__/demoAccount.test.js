import { isDemoAccount, DEMO_EMAIL, DEMO_LOCKED_RESPONSE } from '../src/utils/demoAccount.js';

describe('Cuenta de demostración', () => {
  it('reconoce el email de la demo, sin importar mayúsculas ni espacios', () => {
    expect(isDemoAccount(DEMO_EMAIL)).toBe(true);
    expect(isDemoAccount('  Invitada@AdAstra.sky ')).toBe(true);
  });

  it('no confunde otras cuentas con la demo', () => {
    expect(isDemoAccount('demo@adastra.sky')).toBe(false);
    expect(isDemoAccount('')).toBe(false);
    expect(isDemoAccount(undefined)).toBe(false);
  });

  it('devuelve un error claro cuando se intenta modificar', () => {
    expect(DEMO_LOCKED_RESPONSE.code).toBe('DEMO_ACCOUNT_LOCKED');
  });
});
