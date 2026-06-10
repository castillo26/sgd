import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SubirDocumento() {
  const [nombre, setNombre] = useState("");
  const [numeroInforme, setNumeroInforme] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [areaDestino, setAreaDestino] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [areas, setAreas] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const cargarTipos = async () => {
      const res = await fetch("http://localhost/sgd-api/obtener_tipos.php");
      const data = await res.json();
      if (data.success) setTiposDocumento(data.data);
    };

    const cargarAreas = async () => {
      const res = await fetch("http://localhost/sgd-api/obtener_areas.php");
      const data = await res.json();
      if (data.success) setAreas(data.data);
    };

    cargarTipos();
    cargarAreas();
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));

  const subir = async (e) => {
    e.preventDefault();

    if (!archivo) {
      setMensaje("Debe seleccionar un archivo");
      return;
    }

    if (archivo.type !== "application/pdf") {
      setMensaje("Solo PDF");
      return;
    }

    const formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("numero_informe", numeroInforme);
    formData.append("archivo", archivo);
    formData.append("usuario_id", user.id);
    formData.append("area_origen", user.area);
    formData.append("area_destino", parseInt(areaDestino));

    try {
      const res = await fetch("http://localhost/sgd-api/subir_documento.php", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("Documento enviado correctamente");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch {
      setMensaje("Error del servidor");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-10">

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10">

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Subir Documento
        </h1>

        <p className="text-gray-500 mb-8">
          Envío institucional de documentos
        </p>

        <form onSubmit={subir} className="space-y-6">

          <div className="grid md:grid-cols-2 gap-4">

            <select
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="p-4 border rounded-xl"
              required
            >
              <option value="">Tipo documento</option>
              {tiposDocumento.map(tipo => (
                <option key={tipo.doc_codID} value={tipo.tipo}>
                  {tipo.tipo}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="N° Informe"
              value={numeroInforme}
              onChange={(e) => setNumeroInforme(e.target.value)}
              className="p-4 border rounded-xl"
              required
            />
          </div>

          <select
            value={areaDestino}
            onChange={(e) => setAreaDestino(e.target.value)}
            className="w-full p-4 border rounded-xl"
            required
          >
            <option value="">Área destino</option>

            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.nombre_area}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setArchivo(e.target.files[0])}
            className="w-full p-4 border rounded-xl"
          />

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold">
            Enviar Documento
          </button>

        </form>

        {mensaje && (
          <p className="mt-5 text-center text-sm text-gray-700">
            {mensaje}
          </p>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-6 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl"
        >
          Volver al Dashboard
        </button>

      </div>
    </div>
  );
}

export default SubirDocumento;