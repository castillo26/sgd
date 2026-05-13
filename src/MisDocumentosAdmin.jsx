import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubsanarDocumento from "./SubsanarDocumento";

function MisDocumentosAdmin() {
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [documentoSubsanar, setDocumentoSubsanar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!parsedUser) {
      navigate("/");
      return;
    }

    setUser(parsedUser);

    fetch(`http://localhost:8080/sgd-api/documentos_admin.php?usuario_id=${parsedUser.id}`)
      .then(res => res.json())
      .then(data => setDocs(data))
      .catch(err => console.error(err));
  }, [navigate]);

  const cargarDocumentos = () => {
    if (user) {
      fetch(`http://localhost:8080/sgd-api/documentos_admin.php?usuario_id=${user.id}`)
        .then(res => res.json())
        .then(data => setDocs(data))
        .catch(err => console.error(err));
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return <h2 className="text-center mt-20 text-xl">Cargando...</h2>;
  }

  const estadoColor = (estado) => {
    const colores = {
      enviado: "bg-yellow-100 text-yellow-700",
      recibido: "bg-blue-100 text-blue-700",
      "en proceso": "bg-orange-100 text-orange-700",
      derivado: "bg-purple-100 text-purple-700",
      finalizado: "bg-green-100 text-green-700",
      observado: "bg-red-100 text-red-700"
    };
    return colores[estado] || "bg-gray-100 text-gray-700";
  };

  const docsFiltrados = docs.filter((doc) => {
  const textoBusqueda = busqueda.toLowerCase();

  const coincideBusqueda =
    doc.nombre?.toLowerCase().includes(textoBusqueda) ||
    doc.numero_informe?.toLowerCase().includes(textoBusqueda) ||
    doc.destino?.toLowerCase().includes(textoBusqueda) ||
    doc.comentario?.toLowerCase().includes(textoBusqueda);

  const coincideEstado =
    filtroEstado === "todos" || doc.estado === filtroEstado;

  return coincideBusqueda && coincideEstado;
});

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="bg-white border-b shadow-sm px-8 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SGD</h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Dashboard
          </button>

          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="p-10">

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800">
            Mis Documentos
          </h2>
          <p className="text-gray-500 mt-2">
            Seguimiento de trámites enviados por {user.usuario}
          </p>

            <div className="grid md:grid-cols-4 gap-5 mt-8">
  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-sm text-gray-500">Total</p>
    <h3 className="text-3xl font-bold">{docs.length}</h3>
  </div>

  <div className="bg-yellow-50 p-5 rounded-2xl shadow">
    <p className="text-sm text-yellow-700">Pendientes</p>
    <h3 className="text-3xl font-bold text-yellow-600">
      {docs.filter(d => d.estado === "enviado").length}
    </h3>
  </div>

  <div className="bg-red-50 p-5 rounded-2xl shadow">
    <p className="text-sm text-red-700">Observados</p>
    <h3 className="text-3xl font-bold text-red-600">
      {docs.filter(d => d.estado === "observado").length}
    </h3>
  </div>

  <div className="bg-green-50 p-5 rounded-2xl shadow">
    <p className="text-sm text-green-700">Finalizados</p>
    <h3 className="text-3xl font-bold text-green-600">
      {docs.filter(d => d.estado === "finalizado").length}
    </h3>
  </div>
</div>

        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
  <div className="grid md:grid-cols-2 gap-4">

    <input
      type="text"
      placeholder="Buscar documento, número, destino..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <select
      value={filtroEstado}
      onChange={(e) => setFiltroEstado(e.target.value)}
      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="todos">Todos los estados</option>
      <option value="enviado">Enviado</option>
      <option value="recibido">Recibido</option>
      <option value="en proceso">En proceso</option>
      <option value="observado">Observado</option>
      <option value="derivado">Derivado</option>
      <option value="finalizado">Finalizado</option>
    </select>

  </div>
</div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          <div className="px-8 py-6 border-b bg-slate-50">
            <h3 className="text-xl font-semibold text-gray-800">
              Historial documental
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="bg-slate-100 text-gray-700">
                <tr>
                  <th className="p-4 text-left">Documento</th>
                  <th className="p-4">N°</th>
                  <th className="p-4">Destino</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Observación</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">PDF</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>

              <tbody>
                {docsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-gray-400">
                      No has enviado documentos aún
                    </td>
                  </tr>
                ) : (
                  docsFiltrados.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition`}
                    >
                      <td className="p-4 font-medium">{doc.nombre}</td>
                      <td className="p-4 text-center">{doc.numero_informe || "-"}</td>
                      <td className="p-4 text-center">{doc.destino}</td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColor(doc.estado)}`}>
                          {doc.estado}
                        </span>
                      </td>

                      <td className="p-4 text-center text-sm text-red-600">
                        {doc.comentario || "-"}
                      </td>

                      <td className="p-4 text-center text-sm text-gray-600">
                        {doc.fecha_aceptacion || "-"}
                      </td>

                      <td className="p-4 text-center">
                        <a
                          href={`http://localhost:8080/sgd-api/${doc.archivo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Ver PDF
                        </a>
                      </td>

                      <td className="p-4 text-center">
                        {doc.estado === "observado" && (
                          <button
                            onClick={() => setDocumentoSubsanar(doc)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition"
                          >
                            Subsanar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {documentoSubsanar && (
        <SubsanarDocumento
          documento={documentoSubsanar}
          onCancelar={() => setDocumentoSubsanar(null)}
          onSubsanado={() => {
            setDocumentoSubsanar(null);
            cargarDocumentos();
          }}
        />
      )}
    </div>
  );
}

export default MisDocumentosAdmin;