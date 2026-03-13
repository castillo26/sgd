import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!parsedUser) {
      navigate("/");
      return;
    }

    setUser(parsedUser);

    // DOCUMENTOS DEL ÁREA
    fetch(`http://localhost/sgd-api/documentos_area.php?area=${parsedUser.area}`)
      .then(res => res.json())
      .then(data => setDocs(data))
      .catch(err => console.error(err));

  }, [navigate]);


  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return <h2 className="text-center mt-10 text-xl">Cargando...</h2>;
  }

  return (

    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold text-blue-600">
          SGD
        </h1>

        <div className="flex gap-6">

          <button
            className="text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => navigate("/documentos")}
          >
            Ver documentos
          </button>

          {(user.rol === "admin" || user.rol === "editor") && (
            <button
              className="text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => navigate("/subir")}
            >
              Subir documentos
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
          {user.correo}
        </p>


        {/* TARJETAS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          <div
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/documentos")}
          >
            <h3 className="text-lg font-semibold mb-2">
              Ver documentos
            </h3>
            <p className="text-gray-500 text-sm">
              Consulta los documentos de tu área.
            </p>
          </div>


          {(user.rol === "admin" || user.rol === "editor") && (
            <div
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate("/subir")}
            >
              <h3 className="text-lg font-semibold mb-2">
                Subir documentos
              </h3>
              <p className="text-gray-500 text-sm">
                Envía documentos a otras áreas.
              </p>
            </div>
          )}

        </div>


        {/* TABLA DE DOCUMENTOS */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h3 className="text-xl font-bold mb-6">
            Documentos recibidos
          </h3>

          <table className="w-full text-left">

            <thead>

              <tr className="border-b">

                <th className="py-2">Documento</th>
                <th className="py-2">Origen</th>
                <th className="py-2">Estado</th>
                <th className="py-2">PDF</th>

              </tr>

            </thead>

            <tbody>

              {docs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400">
                    No hay documentos para tu área
                  </td>
                </tr>
              ) : (
                docs.map(doc => (
                  <tr key={doc.id} className="border-b">

                    <td className="py-3">
                      {doc.nombre}
                    </td>

                    <td className="text-gray-600">
                      {doc.origen}
                    </td>

                    <td className="text-gray-600">
                      {doc.estado}
                    </td>

                    <td>

                      <a
                        href={`http://localhost/sgd-api/${doc.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver PDF
                      </a>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;