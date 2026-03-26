import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DocumentosArchivados() {

  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const navigate = useNavigate();

  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"))

    if (!storedUser) {
      navigate("/")
      return
    }

    setUser(storedUser)

    // 🔥 CARGAR SOLO ARCHIVADOS
    fetch(`http://localhost/sgd-api/documentos_archivados.php?area=${storedUser.area}`)
      .then(res => res.json())
      .then(data => {
        setDocs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })

  }, [navigate])


  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-2xl font-bold mb-6">
        Documentos Archivados
      </h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700"
      >
        Volver al Dashboard
      </button>

      <div className="bg-white shadow rounded-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Documento</th>
              <th className="p-3 text-center">N° Informe</th>
              <th className="p-3 text-center">Origen</th>
              <th className="p-3 text-center">Destino</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Fecha</th>
              <th className="p-3 text-center">Archivo</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center">
                  Cargando documentos...
                </td>
              </tr>

            ) : docs.length === 0 ? (

              <tr>
                <td colSpan="7" className="p-6 text-center">
                  No hay documentos archivados
                </td>
              </tr>

            ) : (

              docs.map(doc => (

                <tr key={doc.id} className="border-t hover:bg-gray-50">

                  <td className="p-3">
                    {doc.nombre}
                  </td>

                  <td className="p-3 text-center">
                    {doc.numero_informe}
                  </td>

                  <td className="p-3 text-center">
                    {doc.origen}
                  </td>

                  <td className="p-3 text-center">
                    {doc.destino}
                  </td>

                  <td className="p-3 text-center">

                    <span className="px-3 py-1 rounded-full text-xs bg-green-200 text-green-800">
                      finalizado
                    </span>

                  </td>

                  <td className="p-3 text-center">
                    {doc.fecha_subida}
                  </td>

                  <td className="p-3 text-center">
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

  )
}

export default DocumentosArchivados