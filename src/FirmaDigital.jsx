import { useState, useEffect, useRef } from "react";

function FirmaDigital({ documento, onFirmaExitosa, onCancelar }) {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const linkRef = useRef(null);

  useEffect(() => {
    window.signatureOk = (signedDocument) => {
      setCargando(false);
      setMensaje("Documento firmado exitosamente");
      setTimeout(() => {
        if (onFirmaExitosa) onFirmaExitosa(signedDocument);
      }, 1500);
    };

    window.signatureInit = () => {
      setMensaje("Procesando firma...");
    };

    return () => {
      delete window.signatureOk;
      delete window.signatureInit;
    };
  }, [onFirmaExitosa]);

  const handleFirmar = async () => {
    setCargando(true);
    setMensaje("Preparando firma digital...");

    try {
      const res = await fetch(
        `http://localhost:8080/sgd-api/parametros_firma.php?id=${documento.id}`
      );
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Error del servidor");

      const paramsBase64 = btoa(
        JSON.stringify({
          param_url: "http://localhost:8080/sgd-api/parametros_firma.php",
          param_token: data.params.token,
          document_extension: "pdf",
        })
      );

      setMensaje("Abriendo Firma Per\u00fa...");

      if (window.startSignature) {
        window.startSignature(48596, paramsBase64);

        if (linkRef.current) {
          linkRef.current.click();
        }
      } else {
        throw new Error("Firma Per\u00fa no disponible");
      }
    } catch (err) {
      setMensaje("Error: " + err.message);
      setCargando(false);
    }
  };

  const appUrl =
    "https://resources.firmaperu.gob.pe/app/clickonce/clienteweb/FirmaPeruWeb.application?port=48596";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Firma Digital</h2>
          <p className="text-blue-100 text-sm mt-1">
            Plataforma Nacional de Firma Digital - FIRMA PERÚ
          </p>
        </div>

        <div className="p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 space-y-3">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Documento
              </p>
              <p className="text-gray-800 font-medium">{documento.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                N° Informe
              </p>
              <p className="text-gray-700">{documento.numero_informe || "-"}</p>
            </div>
          </div>

          {mensaje && (
            <div
              className={`p-3 rounded-xl text-sm font-medium mb-6 whitespace-pre-line ${
                mensaje.includes("exitosamente")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : mensaje.includes("Error") || mensaje.includes("abri\u00f3")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {mensaje}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleFirmar}
              disabled={cargando}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition-all disabled:bg-gray-400"
            >
              {cargando ? "Firmando..." : "Firmar Documento"}
            </button>
            <button
              onClick={onCancelar}
              disabled={cargando}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
            <p className="font-semibold mb-1">¿No se abre la aplicación?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Prueba en <strong>Microsoft Edge</strong> (compatible nativo)
              </li>
              <li>
                O instala extensi&oacute;n recomendada para Chrome:{" "}
                <a
                  href="https://chrome.google.com/webstore/detail/clickonce-for-google-chro/kekahkplibinaibelipdcikofmedafmb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ClickOnce for Google Chrome
                </a>
              </li>
              <li>
                Tambi&eacute;n puedes descargar e instalar Firma Per&uacute; desde{" "}
                <a
                  href="https://apps.firmaperu.gob.pe/web/firmador.xhtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  aqu&iacute;
                </a>
              </li>
            </ol>
          </div>

          <a
            ref={linkRef}
            href={appUrl}
            className="hidden"
            id="firmaperu-link"
          >
            ClickOnce
          </a>
        </div>
      </div>
    </div>
  );
}

export default FirmaDigital;
