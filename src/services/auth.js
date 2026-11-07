const ACCOUNTS_KEY = 'sunat_demo_accounts';
const SESSION_KEY = 'sunat_demo_session';

export const SUNAT_AREAS = [
  'Tributaria',
  'Aduanera',
  'Fiscalización',
  'Recaudación',
  'Servicios al Contribuyente',
  'Administración',
];

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function registerAccount({ nombre, correo, password, area }) {
  const accounts = getAccounts();
  const normalizedEmail = correo.trim().toLowerCase();

  if (accounts.some((account) => account.correo === normalizedEmail)) {
    throw new Error('Ya existe una cuenta registrada con ese correo.');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const account = {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    correo: normalizedEmail,
    passwordHash: await hashPassword(password),
    area,
  };

  accounts.push(account);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

  return loginAccount(normalizedEmail, password);
}

export async function loginAccount(correo, password) {
  const normalizedEmail = correo.trim().toLowerCase();
  const accounts = getAccounts();
  const passwordHash = await hashPassword(password);

  const account = accounts.find(
    (item) => item.correo === normalizedEmail && item.passwordHash === passwordHash,
  );

  if (!account) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  const session = {
    id: account.id,
    nombre: account.nombre,
    correo: account.correo,
    area: account.area,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export function getCurrentAccount() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function logoutAccount() {
  localStorage.removeItem(SESSION_KEY);
}
