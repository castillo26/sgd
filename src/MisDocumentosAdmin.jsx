import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MisDocumentosAdmin() {
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

    // Cargar documentos enviados por el administrador
    fetch(`http://localhost/sgd-api/documentos_admin.php?usuario_id=${parsedUser.id}`)
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
        <h1 className="text-xl font-bold text-blue-600">SGD</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Volver al Dashboard
          </button>
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
          Mis Documentos Enviados
        </h2>
        <p className="text-gray-500 mb-10">
          Seguimiento de los documentos que has enviado - {user.usuario}
        </p>

        {/* TABLA DE DOCUMENTOS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-6">
            Seguimiento de mis trámites
          </h3>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="py-3 px-4 font-semibold text-gray-700">Documento</th>
                <th className="py-3 px-4 font-semibold text-gray-700">N° Informe</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Origen</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Destino</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Observación</th>
                <th className="py-3 px-4 font-semibold text-gray-700">PDF</th>
              </tr>
            </thead>

            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    No has enviado documentos aún
                  </td>
                </tr>
              ) : (
                docs.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {doc.nombre}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {doc.numero_informe || '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {doc.origen}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {doc.destino}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        doc.estado === "enviado" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" :
                        doc.estado === "recibido" ? "bg-blue-100 text-blue-700 border border-blue-300" :
                        doc.estado === "en proceso" ? "bg-orange-100 text-orange-700 border border-orange-300" :
                        doc.estado === "derivado" ? "bg-purple-100 text-purple-700 border border-purple-300" :
                        doc.estado === "finalizado" ? "bg-green-100 text-green-700 border border-green-300" :
                        doc.estado === "observado" ? "bg-red-100 text-red-700 border border-red-300" :
                        "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}>
                        {doc.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {doc.comentario ? (
                        <span className="text-red-600 text-xs" title={doc.comentario}>
                          {doc.comentario.length > 30 ? doc.comentario.substring(0, 30) + "..." : doc.comentario}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={`http://localhost/sgd-api/${doc.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
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

export default MisDocumentosAdmin;