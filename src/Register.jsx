import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Register() {

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const res = await fetch("http://localhost/sgd-api/obtener_areas.php");
        const data = await res.json();
        if (data.success) {
          setAreas(data.data);
        }
      } catch (err) {
        console.error("Error al cargar áreas:", err);
      }
    };
    cargarAreas();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (usuario.trim().length < 3) {
      alert("El usuario debe tener al menos 3 caracteres");
      return;
    }

    if (!password.trim()) {
      alert("Ingresa tu contraseña");
      return;
    }

    if (!area) {
      alert("Por favor selecciona un área");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch("http://localhost/sgd-api/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario: usuario,
          contrasena: password,
          area: parseInt(area)
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("Cuenta creada exitosamente. Por favor inicia sesión.");
        window.location.href = "/";
      } else {
        alert(data.message || "Error al crear la cuenta");
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
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-600 to-teal-700 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Sistema de Gestión Documental
        </h1>
        <p className="text-lg text-center max-w-md opacity-90">
          Crea tu cuenta para acceder a la plataforma y gestionar documentos de manera segura.
        </p>
      </div>

      {/* LADO DERECHO */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-100">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Crear Cuenta
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Regístrate para comenzar
          </p>

          <form className="space-y-5" onSubmit={handleRegister}>

            {/* USUARIO */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                required
              />
            </div>

            {/* AREA */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Área
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                required
              >
                <option value="">Selecciona un área</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre_area}
                  </option>
                ))}
              </select>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Contraseña asignada"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                required
              />
            </div>

            {/* BOTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 shadow-md disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              ¿Ya tienes cuenta?{" "}
              <Link to="/" className="text-green-600 hover:underline font-medium">
                Inicia sesión
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}