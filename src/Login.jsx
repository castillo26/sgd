import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Login() {
  const [area, setArea] = useState("");
  const [password, setPassword] = useState("");
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost/sgd-api/areas.php")
      .then((res) => res.json())
      .then((data) => setAreas(data))
      .catch((err) => {
        console.error("Error cargando áreas:", err);
        alert("Error cargando áreas");
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!area) {
      alert("Selecciona un área");
      return;
    }

    if (!password.trim()) {
      alert("Ingresa tu contraseña");
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
          area: area,
          contrasena: password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.usuario));
        window.location.href = "/dashboard";
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error conectando con el servidor");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* PANEL IZQUIERDO */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white overflow-hidden">

        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-10 flex flex-col justify-center px-20">

          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
              SGD
            </div>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Sistema de Gestión Documental
          </h1>

          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Plataforma institucional para la administración, seguimiento y control
            eficiente del flujo documental entre áreas.
          </p>

          <div className="space-y-4 text-blue-100">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Gestión centralizada
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Seguimiento en tiempo real
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Seguridad documental
            </div>
          </div>

        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">

        <div className="w-full max-w-md">

          {/* HEADER MOBILE */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700">
              SGD
            </h1>
            <p className="text-gray-500 mt-2">
              Sistema de Gestión Documental
            </p>
          </div>

          {/* CARD LOGIN */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Bienvenido
              </h2>
              <p className="text-gray-500 mt-2">
                Inicia sesión con tu área institucional
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">

              {/* ÁREA */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Área institucional
                </label>

                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Seleccione su área</option>

                  {areas.length > 0 ? (
                    areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre_area}
                      </option>
                    ))
                  ) : (
                    <option disabled>Cargando áreas...</option>
                  )}
                </select>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Contraseña
                </label>

                <input
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Ingresando..." : "Ingresar al sistema"}
              </button>

              {/* LINK */}
              <div className="text-center text-sm text-gray-500 pt-3">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Regístrate aquí
                </Link>
              </div>

            </form>
          </div>

          {/* FOOTER */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Sistema institucional de gestión documental
          </p>

        </div>
      </div>
    </div>
  );
}