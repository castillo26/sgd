import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Register() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  const navigate = useNavigate();

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
      alert("Ingresa una contraseña");
      return;
    }

    if (!area) {
      alert("Selecciona un área");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost/sgd-api/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario,
          contrasena: password,
          area: parseInt(area),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Cuenta creada exitosamente");
        navigate("/");
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
    <div className="min-h-screen flex bg-gray-50">

      {/* PANEL IZQUIERDO */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white relative overflow-hidden">

        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Sistema de Gestión Documental
            </h1>

            <p className="text-xl text-emerald-100 leading-relaxed mb-10">
              Registra tu cuenta institucional y comienza a gestionar trámites,
              expedientes y documentación de forma eficiente y segura.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span className="text-lg">Registro por área institucional</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span className="text-lg">Gestión centralizada</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span className="text-lg">Seguimiento en tiempo real</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="flex w-full lg:w-1/2 justify-center items-center px-6 py-10">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                Crear Cuenta
              </h2>

              <p className="text-gray-500">
                Regístrate para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">

              {/* USUARIO */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario
                </label>

                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  outline-none transition-all"
                  required
                />
              </div>

              {/* ÁREA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Área institucional
                </label>

                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  outline-none transition-all"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>

                <input
                  type="password"
                  placeholder="Crea una contraseña segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  outline-none transition-all"
                  required
                />
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700
                text-white font-semibold rounded-xl shadow-lg
                transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>

              {/* LOGIN */}
              <div className="text-center text-sm text-gray-500 pt-2">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Inicia sesión
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}