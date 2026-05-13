import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponderDocumento from "./ResponderDocumento";
import FirmaDigital from "./FirmaDigital";

function VerDocumentos() {
  const [areas, setAreas] = useState([]);
  const [nuevaArea, setNuevaArea] = useState("");
  const [docSeleccionado, setDocSeleccionado] = useState(null);
  const [documentoResponder, setDocumentoResponder] = useState(null);
  const [documentoFirmar, setDocumentoFirmar] = useState(null);
  const [docVisualizar, setDocVisualizar] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/sgd-api/areas.php")
      .then((res) => res.json())
      .then((data) => setAreas(data));
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/");
      return;
    }

    setUser(storedUser);

    let url = "";

    if (storedUser.rol === "admin") {
      url = `http://localhost:8080/sgd-api/documentos_area.php?area=${storedUser.area}&usuario_id=${storedUser.id}`;
    } else {
      url = `http://localhost:8080/sgd-api/mis_documentos.php?usuario_id=${storedUser.id}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDocs(data);
        setLoading(false);
      });
  }, [navigate]);

  const cargarDocumentos = () => {
    if (!user) return;

    let url = "";

    if (user.rol === "admin") {
      url = `http://localhost:8080/sgd-api/documentos_area.php?area=${user.area}&usuario_id=${user.id}`;
    } else {
      url = `http://localhost:8080/sgd-api/mis_documentos.php?usuario_id=${user.id}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setDocs(data));
  };

  const confirmarDerivacion = async () => {
    if (!nuevaArea) {
      alert("Seleccione un área");
      return;
    }

    const comentario = prompt("Ingrese comentario (opcional):") || "";

    const formData = new FormData();
    formData.append("id", docSeleccionado);
    formData.append("estado", "derivado");
    formData.append("comentario", comentario);
    formData.append("area_destino", nuevaArea);

    await fetch("http://localhost:8080/sgd-api/actualizar_estado.php", {
      method: "POST",
      body: formData,
    });

    cargarDocumentos();
    setDocSeleccionado(null);
    setNuevaArea("");
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    let comentario = "";

    if (nuevoEstado === "observado") {
      comentario = prompt("Ingrese observación (OBLIGATORIO):") || "";

      if (!comentario.trim()) {
        alert("Debe ingresar observación");
        return;
      }
    } else {
      comentario = prompt("Comentario opcional:") || "";
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("estado", nuevoEstado);
    formData.append("comentario", comentario);
    formData.append("area_destino", user.area);

    await fetch("http://localhost:8080/sgd-api/actualizar_estado.php", {
      method: "POST",
      body: formData,
    });

    cargarDocumentos();
  };

  const estadoClass = (estado) => {
    const styles = {
      enviado: "bg-yellow-100 text-yellow-700 border-yellow-300",
      recibido: "bg-blue-100 text-blue-700 border-blue-300",
      "en proceso": "bg-orange-100 text-orange-700 border-orange-300",
      derivado: "bg-purple-100 text-purple-700 border-purple-300",
      finalizado: "bg-green-100 text-green-700 border-green-300",
      observado: "bg-red-100 text-red-700 border-red-300",
    };

    return styles[estado] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white px-8 py-6 rounded-2xl shadow-lg">
          <p className="text-gray-600 font-medium">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  const docsFiltrados = docs.filter((doc) => {
  const coincideBusqueda =
    doc.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    doc.numero_informe?.toLowerCase().includes(busqueda.toLowerCase()) ||
    doc.origen?.toLowerCase().includes(busqueda.toLowerCase()) ||
    doc.comentario?.toLowerCase().includes(busqueda.toLowerCase());

  const coincideEstado =
    filtroEstado === "todos" || doc.estado === filtroEstado;

  return coincideBusqueda && coincideEstado;
});

  return (
    <div className="min-h-screen bg-slate-100">

      {/* NAVBAR */}
      <header className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">SGD</h1>
          <p className="text-sm text-gray-500">
            Sistema de Gestión Documental
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded-lg transition"
        >
          Dashboard
        </button>
      </header>

      {/* CONTENIDO */}
      <div className="p-8">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            {user.rol === "admin"
              ? "Documentos del Área"
              : "Mis Documentos"}
          </h2>
          <p className="text-gray-500 mt-2">
            Gestión y seguimiento documental
          </p>
        </div>

        {/* CARD RESUMEN */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total</h3>
            <p className="text-3xl font-bold text-slate-800">{docs.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Pendientes</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {docs.filter((d) => d.estado === "enviado").length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Finalizados</h3>
            <p className="text-3xl font-bold text-green-600">
              {docs.filter((d) => d.estado === "finalizado").length}
            </p>
          </div>
        </div>

                {/* FILTROS */}
<div className="bg-white rounded-2xl shadow p-6 mb-6">
  <div className="grid md:grid-cols-2 gap-4">

    {/* BUSCADOR */}
    <input
      type="text"
      placeholder="Buscar documento, informe, origen..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
    />

    {/* FILTRO ESTADO */}
    <select
      value={filtroEstado}
      onChange={(e) => setFiltroEstado(e.target.value)}
      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="todos">Todos los estados</option>
      <option value="enviado">Enviado</option>
      <option value="recibido">Recibido</option>
      <option value="en proceso">En Proceso</option>
      <option value="observado">Observado</option>
      <option value="derivado">Derivado</option>
      <option value="finalizado">Finalizado</option>
    </select>

  </div>
</div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-5 border-b bg-slate-50">
            <h3 className="font-semibold text-lg text-slate-700">
              Lista de documentos
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr className="text-sm text-slate-700">
                  <th className="p-4 text-left">Documento</th>
                  <th className="p-4">N° Informe</th>
                  <th className="p-4">Origen</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Observación</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Archivo</th>
                  {user.rol === "admin" && <th className="p-4">Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {docsFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-10 text-gray-400"
                    >
                      No hay documentos disponibles
                    </td>
                  </tr>
                ) : (
                  docsFiltrados.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={`border-b hover:bg-blue-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="p-4 font-medium">{doc.nombre}</td>

                      <td className="p-4 text-center">
                        {doc.numero_informe || "-"}
                      </td>

                      <td className="p-4 text-center">{doc.origen}</td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${estadoClass(
                            doc.estado
                          )}`}
                        >
                          {doc.estado}
                        </span>
                      </td>

                      <td className="p-4 text-center text-sm text-red-600">
                        {doc.comentario || "-"}
                      </td>

                      <td className="p-4 text-center text-sm">
                        {doc.fecha_actualizacion || "-"}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => setDocVisualizar(doc)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Ver PDF
                        </button>
                      </td>

                      {user.rol === "admin" && (
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2 justify-center">

                            {doc.estado === "enviado" && (
                              <>
                                <button
                                  onClick={() =>
                                    actualizarEstado(doc.id, "recibido")
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Aceptar
                                </button>

                                <button
                                  onClick={() =>
                                    actualizarEstado(doc.id, "observado")
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Observar
                                </button>
                              </>
                            )}

                            {(doc.estado === "recibido" ||
                              doc.estado === "en proceso") && (
                              <>
                                <button
                                  onClick={() =>
                                    setDocumentoResponder(doc)
                                  }
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Responder
                                </button>

                                <button
                                  onClick={() =>
                                    actualizarEstado(doc.id, "finalizado")
                                  }
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Finalizar
                                </button>

                                <button
                                  onClick={() =>
                                    setDocSeleccionado(doc.id)
                                  }
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Derivar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DERIVAR */}
        {user.rol === "admin" && docSeleccionado && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">
              Derivar documento
            </h3>

            <select
              onChange={(e) => setNuevaArea(e.target.value)}
              className="w-full border rounded-xl p-3 mb-4"
            >
              <option value="">Seleccione área destino</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre_area}
                </option>
              ))}
            </select>

            <button
              onClick={confirmarDerivacion}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
            >
              Confirmar derivación
            </button>
          </div>
        )}

        {/* MODAL VISUALIZAR PDF */}
        {docVisualizar && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="w-full max-w-[98vw] bg-white rounded-3xl shadow-2xl overflow-hidden h-[98vh] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{docVisualizar.nombre}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    N° Informe: {docVisualizar.numero_informe || "-"} | Origen: {docVisualizar.origen}
                  </p>
                </div>
                <button
                  onClick={() => setDocVisualizar(null)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
                >
                  ✕ Cerrar
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-slate-100">
                <iframe
                  src={`http://localhost:8080/sgd-api/${docVisualizar.archivo}`}
                  className="w-full h-full rounded-xl border-0"
                  title="PDF Viewer"
                />
              </div>
              {user.rol === "admin" && docVisualizar.estado === "enviado" && (
                <div className="px-8 py-6 bg-white border-t border-slate-200">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDocumentoFirmar(docVisualizar)}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition-all"
                    >
                      ✎ Firmar Digitalmente
                    </button>
                    <button
                      onClick={() => {
                        actualizarEstado(docVisualizar.id, "recibido");
                        setDocVisualizar(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                    >
                      ✓ Aceptar Documento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FIRMA DIGITAL */}
        {documentoFirmar && (
          <FirmaDigital
            documento={documentoFirmar}
            onCancelar={() => setDocumentoFirmar(null)}
            onFirmaExitosa={() => {
              setDocumentoFirmar(null);
              setDocVisualizar(null);
              cargarDocumentos();
            }}
          />
        )}

        {/* RESPONDER */}
        {documentoResponder && (
          <ResponderDocumento
            documento={documentoResponder}
            onCancelar={() => setDocumentoResponder(null)}
            onRespondido={() => {
              setDocumentoResponder(null);
              cargarDocumentos();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default VerDocumentos;