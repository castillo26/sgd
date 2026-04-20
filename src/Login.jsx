import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Login() {

  const [area, setArea] = useState("");
  const [password, setPassword] = useState("");
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Cargar áreas desde backend
  useEffect(() => {
    fetch("http://localhost/sgd-api/areas.php")
      .then(res => res.json())
      .then(data => setAreas(data))
      .catch(err => {
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
    <div className="min-h-screen flex">

      {/* IZQUIERDA */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Sistema de Gestión Documental
        </h1>
        <p className="text-lg text-center opacity-90">
          Acceso por área institucional
        </p>
      </div>

      {/* DERECHA */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-100">

        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">

          <h2 className="text-3xl font-bold text-center mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* AREA DINÁMICA */}
            <div>
              <label className="block mb-1 font-medium">Área</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-3 border rounded"
              >
                <option value="">Seleccione área</option>

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
              <label className="block mb-1 font-medium">Contraseña</label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded"
              />
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            {/* LINK OPCIONAL */}
            <div className="text-center text-sm text-gray-500 mt-3">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Regístrate aquí
              </Link>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}