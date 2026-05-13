import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DocumentosArchivados() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/");
      return;
    }

    fetch(`http://localhost:8080/sgd-api/documentos_archivados.php?area=${storedUser.area}`)
      .then(res => res.json())
      .then(data => {
        setDocs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 p-10">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Documentos Archivados
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          Volver
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">Documento</th>
              <th className="p-4">N°</th>
              <th className="p-4">Origen</th>
              <th className="p-4">Destino</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Archivo</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center">
                  Cargando...
                </td>
              </tr>
            ) : docs.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400">
                  No hay documentos archivados
                </td>
              </tr>
            ) : (
              docs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 border-t">
                  <td className="p-4">{doc.nombre}</td>
                  <td className="p-4 text-center">{doc.numero_informe}</td>
                  <td className="p-4 text-center">{doc.origen}</td>
                  <td className="p-4 text-center">{doc.destino}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Finalizado
                    </span>
                  </td>
                  <td className="p-4 text-center">{doc.fecha_subida}</td>
                  <td className="p-4 text-center">
                    <a
                      href={`http://localhost:8080/sgd-api/${doc.archivo}`}
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
  );
}

export default DocumentosArchivados;