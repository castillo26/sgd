
import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Formato de correo inválido';
    } else if (!email.endsWith('.gob.pe')) {
      newErrors.email = 'Debe usar un correo institucional (.gob.pe)';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    // Simular API call
    setTimeout(() => {
      console.log("Iniciando sesión con:", { email, password, rememberMe });
      // Simular éxito o error
      if (email === 'test@gob.pe' && password === '123456') {
        alert('¡Inicio de sesión exitoso!');
      } else {
        setErrors({ general: 'Credenciales incorrectas' });
      }
      setIsLoading(false);
    }, 2000);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      alert('Ingresa tu correo');
      return;
    }
    alert(`Se envió un enlace de recuperación a ${forgotEmail}`);
    setShowForgotModal(false);
    setForgotEmail('');
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row w-full max-w-2xl">
        
        {/* Panel Izquierdo: Informativo (Oculto en móviles) */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 text-white flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Sistema de Trámite Documentario</h2>
            <p className="text-blue-100 leading-relaxed">
              Gestiona, consulta y haz seguimiento a tus expedientes de forma rápida y segura.
            </p>
          </div>
          <div className="text-sm text-blue-200">
            © 2026 Plataforma Digital de Gestión
          </div>
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido!</h2>
          <p className="text-gray-500 mb-8">Ingresa tus credenciales para acceder al sistema.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Institucional</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:border-transparent outline-none transition-all`}
                placeholder="usuario@institucion.gob.pe"
                required
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:border-transparent outline-none transition-all`}
                placeholder="••••••••"
                required
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando Sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Problemas para acceder? <a href="#" className="text-blue-600 font-semibold">Contactar a Soporte IT</a>
            </p>
          </div>
        </div>
      </div>

      {/* Modal Olvidar Contraseña */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recuperar Contraseña</h3>
            <p className="text-gray-600 mb-4">Ingresa tu correo institucional para recibir un enlace de recuperación.</p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
                placeholder="usuario@institucion.gob.pe"
                required
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
    