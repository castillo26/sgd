import { useState } from "react";

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Subsanar Documento</h2>
          <p className="text-orange-100 text-sm mt-1">
            Corrige y vuelve a enviar el documento observado
          </p>
        </div>

        <div className="p-8">

          {/* INFO */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 space-y-3">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                Documento
              </p>
              <p className="text-gray-800 font-medium">{documento.nombre}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                N° Informe
              </p>
              <p className="text-gray-700">
                {documento.numero_informe || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                Observación
              </p>
              <p className="text-red-600 text-sm font-medium">
                {documento.comentario}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubsanar} className="space-y-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Documento corregido (PDF)
              </label>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setArchivo(e.target.files[0])}
                className="block w-full text-sm border border-gray-200 rounded-xl p-3
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-medium file:bg-orange-100 file:text-orange-700
                hover:file:bg-orange-200 cursor-pointer"
              />
            </div>

            {mensaje && (
              <div
                className={`p-3 rounded-xl text-sm font-medium ${
                  mensaje.includes("correctamente")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {mensaje}
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all disabled:bg-gray-400"
              >
                {cargando ? "Subsanando..." : "Subsanar Documento"}
              </button>

              <button
                type="button"
                onClick={onCancelar}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default SubsanarDocumento;