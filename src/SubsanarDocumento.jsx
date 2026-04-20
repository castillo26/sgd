import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SubsanarDocumento({ documento, onCancelar, onSubsanado }) {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubsanar = async (e) => {
    e.preventDefault();

    if (!archivo) {
      setMensaje("Debe seleccionar un archivo PDF");
      return;
    }

    if (archivo.type !== "application/pdf") {
      setMensaje("Solo se permiten archivos PDF");
      return;
    }

    setCargando(true);

    const formData = new FormData();
    formData.append("id", documento.id);
    formData.append("usuario_id", user.id);
    formData.append("archivo", archivo);

    try {
      const res = await fetch("http://localhost/sgd-api/subsanar_documento.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("Documento subsanado correctamente");
        setTimeout(() => {
          onSubsanado();
        }, 1000);
      } else {
        setMensaje(data.message || "Error al subsanar documento");
      }
    } catch (err) {
      setMensaje("Error del servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Subsanar Documento
        </h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Documento:</span> {documento.nombre}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">N° Informe:</span> {documento.numero_informe || '-'}
          </p>
          <p className="text-sm text-red-600 mb-4">
            <span className="font-medium">Observación:</span> {documento.comentario}
          </p>
        </div>

        <form onSubmit={handleSubsanar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subir documento corregido (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setArchivo(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {mensaje && (
            <p className={`text-sm ${mensaje.includes("correctamente") ? "text-green-600" : "text-red-600"}`}>
              {mensaje}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {cargando ? "Subsanando..." : "Subsanar"}
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubsanarDocumento;