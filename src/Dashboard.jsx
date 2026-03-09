import { useEffect, useState } from "react";

function Dashboard() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (!user) {
    return <h2 className="text-center mt-10 text-xl">No autorizado</h2>;
  }

  return (

    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold text-blue-600">
          SGD
        </h1>

        <div className="flex gap-4">

          <button className="text-gray-700 hover:text-blue-600 font-medium">
            Ver documentos
          </button>

          {(user.role === "admin" || user.role === "editor") && (
            <button className="text-gray-700 hover:text-blue-600 font-medium">
              Subir documentos
            </button>
          )}

          {user.role === "admin" && (
            <button className="text-gray-700 hover:text-blue-600 font-medium">
              Administrar usuarios
            </button>
          )}

          <button
            onClick={logout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Cerrar sesión
          </button>

        </div>

      </div>


      {/* CONTENIDO */}
      <div className="p-10">

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Bienvenido
        </h2>

        <p className="text-gray-500 mb-10">
          {user.email}
        </p>


        {/* TARJETAS */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">
              Ver documentos
            </h3>
            <p className="text-gray-500 text-sm">
              Consulta los documentos almacenados en el sistema.
            </p>
          </div>


          {(user.role === "admin" || user.role === "editor") && (
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">
                Subir documentos
              </h3>
              <p className="text-gray-500 text-sm">
                Agrega nuevos documentos al sistema.
              </p>
            </div>
          )}


          {user.role === "admin" && (
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">
                Administración
              </h3>
              <p className="text-gray-500 text-sm">
                Gestiona usuarios y permisos del sistema.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;