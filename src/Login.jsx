import { useState } from "react";
import { Link } from "react-router-dom";

export function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      alert("Correo inválido");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch("http://localhost/sgd-api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password
        })
      });

      const data = await response.json();

      if (data.success) {

        localStorage.setItem("user", JSON.stringify(data.usuario));

        window.location.href = "/dashboard";

      } else {

        alert("Credenciales incorrectas");

      }

    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }

    setLoading(false);

  };

  return (
    <div className="min-h-screen flex">

      {/* LADO IZQUIERDO */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-col justify-center items-center p-10">

        <h1 className="text-4xl font-bold mb-6 text-center">
          Sistema de Gestión Documental
        </h1>

        <p className="text-lg text-center max-w-md opacity-90">
          Plataforma segura para administrar, almacenar y gestionar
          documentos de manera eficiente dentro de la organización.
        </p>

      </div>

      {/* LADO DERECHO */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-100">

        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Bienvenido
          </h2>

          <p className="text-gray-500 text-center mb-8">
            Inicia sesión para continuar
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contraseña
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            {/* BOTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Regístrate aquí
              </Link>
            </div>

          </form>

        </div>

      </div>

    </div>
  )
}