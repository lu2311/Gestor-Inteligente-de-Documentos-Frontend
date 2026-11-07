import { useState } from 'react';
import { SUNAT_AREAS, loginAccount, registerAccount } from '../services/auth';

export default function AccountModal({ onClose, onLogin }) {
  const [mode, setMode] = useState('login');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      let account;

      if (mode === 'register') {
        if (!nombre.trim() || !correo.trim() || !password || !area) {
          throw new Error('Completa todos los campos.');
        }

        account = await registerAccount({
          nombre,
          correo,
          password,
          area,
        });
      } else {
        if (!correo.trim() || !password) {
          throw new Error('Ingresa tu correo y contraseña.');
        }

        account = await loginAccount(correo, password);
      }

      onLogin(account);
      onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="account-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="account-modal card-plain p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1" id="account-title">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear una cuenta'}
            </h5>
            <p className="text-muted-soft small mb-0">Gestor Inteligente de Documentos</p>
          </div>

          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="mb-3">
                <label className="form-label">Nombre completo</label>
                <input
                  className="form-control"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Luis Flores"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Área de SUNAT</label>
                <select
                  className="form-select"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                >
                  <option value="">Selecciona tu área</option>
                  {SUNAT_AREAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-control"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarme'}
          </button>
        </form>

        <div className="text-center mt-3 small">
          {mode === 'login' ? (
            <>
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
