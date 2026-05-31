import { useEffect, useRef, useState } from "react";
import logoUam from "./assets/logo.png";

const values = [
  {
    title: "Inclusion",
    detail: "Todas las personas merecen ser escuchadas y comprendidas.",
  },
  {
    title: "Empatia",
    detail: "Entendemos emociones y necesidades del paciente.",
  },
  {
    title: "Innovacion",
    detail: "Tecnologia al servicio de la calidad de vida.",
  },
  {
    title: "Responsabilidad",
    detail: "Seguridad y bienestar en cada atencion.",
  },
  {
    title: "Respeto",
    detail: "Diversidad y equidad como base de la atencion.",
  },
  {
    title: "Compromiso social",
    detail: "Impacto positivo en la comunidad.",
  },
];

const team = [
  "Andrea Michelle Bastidas Canales",
  "Anaime Leticia Andino Gonzalez",
  "Angie Patricia Medrano",
  "Elias Miguel Alvarez Offer",
  "Jurgen Ulysses Blandon",
  "Ashley Naomi Ramirez Mairena",
  "Roberto Alexander Tapia Perez",
  "Genesis Abigail Navarrete Gomez",
];

const supportRoles = [
  "Ingenieria en sistemas / software (IA y vision artificial)",
  "Psicologia y especialistas (validacion de senas)",
  "Odontologia / medicina (entorno clinico)",
  "Diseno grafico (interfaz accesible)",
  "Administracion y negocios (gestion del emprendimiento)",
];

const swot = {
  Fortalezas: [
    "Innovacion tecnologica y enfoque inclusivo",
    "Mejora de seguridad del paciente",
    "Aplicable mas alla de odontologia",
  ],
  Oportunidades: [
    "Interes creciente en inclusion social",
    "Avances en inteligencia artificial",
    "Expansiones a hospitales y escuelas",
  ],
  Debilidades: [
    "Alto requerimiento tecnico",
    "Dependencia de tecnologia y validacion",
    "Inversion inicial significativa",
  ],
  Amenazas: [
    "Competencia tecnologica futura",
    "Resistencia al cambio institucional",
    "Riesgos por fallas tecnicas",
  ],
};

const marketStats = [
  { label: "Importancia de la comunicacion inclusiva", value: "94%" },
  { label: "Cree que la tecnologia mejora la atencion", value: "91%" },
  { label: "Utilidad de traduccion en tiempo real", value: "88%" },
  { label: "Implementaria la tecnologia", value: "90%" },
];

const businessModel = [
  "Aliados claves: programadores, especialistas en lenguaje de senas, proveedores de tecnologia.",
  "Actividades clave: desarrollo de software, entrenamiento del sistema.",
  "Recursos clave: universidades, camara o webcam, software (Python, MediaPipe).",
  "Propuesta de valor: comunicacion en tiempo real e inclusion clinica.",
  "Canales: redes sociales, congresos de salud, convenios con universidades.",
  "Segmento: clinicas odontologicas, hospitales, universidades.",
];

const objectives = [
  {
    horizon: "Corto plazo",
    detail:
      "Piloto en UAM y reconocimiento interno en el entorno universitario.",
  },
  {
    horizon: "Mediano plazo",
    detail: "Expansion a clinicas privadas y centros medicos de Managua.",
  },
  {
    horizon: "Largo plazo",
    detail: "Liderazgo nacional en tecnologia inclusiva aplicada a salud.",
  },
];

const flowSteps = [
  "Recepcion del paciente",
  "Registro de datos",
  "Verificacion de camara y software",
  "Configuracion IA",
  "Posicionamiento del paciente",
  "Activacion del monitoreo",
  "Captura de manos",
  "Procesamiento biometrico",
  "Almacenamiento y respaldo",
];

type Prediction = {
  label: string;
  score: number;
  top3: Array<{ label: string; score: number }>;
  latency_ms: number;
};

const PAIN_ALERT_LETTERS = new Set(["N", "S", "D"]);

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sendLock = useRef(false);
  const loopRef = useRef<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<"letters" | "numbers">("letters");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl =
    (import.meta.env.VITE_API_URL as string | undefined) ||
    "http://localhost:5000";

  const detectedLabel = prediction?.label?.toUpperCase() ?? "";
  const showPainAlert =
    mode === "letters" && PAIN_ALERT_LETTERS.has(detectedLabel);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      setError("No se pudo acceder a la camara. Revisa permisos.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      if (loopRef.current) {
        window.clearInterval(loopRef.current);
      }
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isStreaming) {
      if (loopRef.current) {
        window.clearInterval(loopRef.current);
        loopRef.current = null;
      }
      return;
    }

    const captureAndSend = async () => {
      if (sendLock.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0) {
        return;
      }

      const size = Math.floor(
        Math.min(video.videoWidth, video.videoHeight) * 0.55,
      );
      const sx = Math.floor((video.videoWidth - size) / 2);
      const sy = Math.floor((video.videoHeight - size) / 2);

      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.save();
      context.translate(size, 0);
      context.scale(-1, 1);
      context.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      context.restore();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      sendLock.current = true;
      try {
        const response = await fetch(`${apiBaseUrl}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, image: dataUrl }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Error en el backend");
        }
        setPrediction(payload as Prediction);
        setError(null);
      } catch (err) {
        setError("No se pudo obtener prediccion.");
      } finally {
        sendLock.current = false;
      }
    };

    loopRef.current = window.setInterval(captureAndSend, 180);

    return () => {
      if (loopRef.current) {
        window.clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [apiBaseUrl, isStreaming, mode]);

  return (
    <div className="text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <img
            src={logoUam}
            alt="Logo UAM"
            className="h-11 w-11 rounded-2xl object-cover"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-700">
              Señas y Sonrisas
            </p>
            <p className="text-sm text-slate-600">
              Donde las señas se convierten en voz
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a className="transition hover:text-teal-700" href="#solucion">
            Solucion
          </a>
          <a className="transition hover:text-teal-700" href="#impacto">
            Impacto
          </a>
          <a className="transition hover:text-teal-700" href="#equipo">
            Equipo
          </a>
          <a className="transition hover:text-teal-700" href="#mercado">
            Mercado
          </a>
        </nav>
        <button className="rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-700 transition hover:border-teal-400">
          Solicitar demo
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-4 py-2 text-xs text-teal-700">
              IA + vision artificial en tiempo real
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Comunicacion clinica inclusiva para una atencion odontologica mas
              segura.
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Señas y Sonrisas reduce la ansiedad del paciente y permite alertas
              inmediatas al personal medico cuando hay dolor o necesidad, usando
              reconocimiento de señas en vivo.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500">
                Iniciar demostracion
              </button>
              <button className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400">
                Ver flujo clinico
              </button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Modo actual", value: "Letras y numeros" },
                { label: "Entorno objetivo", value: "Odontologia" },
                { label: "Piloto", value: "UAM" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Vista de camara
                </p>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                  {isStreaming ? "En vivo" : "Detenida"}
                </span>
              </div>
              <div className="relative mt-4 overflow-hidden rounded-xl border border-dashed border-teal-200/70">
                <video
                  ref={videoRef}
                  className="aspect-video w-full rounded-xl object-cover transform -scale-x-100"
                  muted
                  playsInline
                />
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="h-32 w-32 rounded-2xl border-2 border-teal-500/60"></div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={startCamera}
                  className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-500"
                >
                  Iniciar camara
                </button>
                <button
                  onClick={stopCamera}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-400"
                >
                  Detener
                </button>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="text-slate-500">Modo</span>
                  <button
                    onClick={() => setMode("letters")}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      mode === "letters"
                        ? "bg-teal-600 text-white"
                        : "border border-slate-300 text-slate-700 hover:border-teal-400"
                    }`}
                  >
                    Letras
                  </button>
                  <button
                    onClick={() => setMode("numbers")}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      mode === "numbers"
                        ? "bg-teal-600 text-white"
                        : "border border-slate-300 text-slate-700 hover:border-teal-400"
                    }`}
                  >
                    Numeros
                  </button>
                </div>
              </div>
              {error ? (
                <p className="mt-3 text-xs text-rose-700">{error}</p>
              ) : null}
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                {[
                  {
                    label: "Sena detectada",
                    value: prediction?.label || "-",
                  },
                  {
                    label: "Confianza",
                    value: prediction
                      ? `${Math.round(prediction.score * 100)}%`
                      : "-",
                  },
                  {
                    label: "Latencia",
                    value: prediction ? `${prediction.latency_ms} ms` : "-",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2"
                  >
                    <p className="text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Alertas clinicas
              </p>
              {showPainAlert ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-rose-100 px-3 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
                      Dolor
                    </p>
                    <p className="text-sm text-slate-900">
                      Pausa inmediata sugerida
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-200 px-3 py-1 text-xs text-rose-800">
                    Critico
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-teal-50 px-3 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-teal-700">
                      Todo bien
                    </p>
                    <p className="text-sm text-slate-900">
                      Sin alertas activas en este momento
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs text-teal-800">
                    Normal
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="solucion" className="mt-20 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Justificacion
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              Reducir barreras de comunicacion en consulta.
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              La falta de comunicacion efectiva en tratamientos genera ansiedad
              y riesgos clinicos. El sistema interpreta senas en tiempo real y
              alerta al odontologo.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Giro
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              Tecnologia + salud
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              Emprendimiento inclusivo que conecta profesionales y pacientes con
              IA y vision artificial. Comienza en UAM y se proyecta a clinicas
              privadas.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Propuesta
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              Inclusion, seguridad y humanidad.
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              Comunicacion en tiempo real, capacitacion clinica y soporte
              continuo con actualizaciones premium.
            </p>
          </div>
        </section>

        <section
          id="impacto"
          className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <h2 className="text-2xl font-semibold text-slate-900">Mision</h2>
            <p className="mt-4 text-sm text-slate-600">
              Mejorar la comunicacion entre personas con discapacidad auditiva y
              profesionales de salud mediante tecnologia innovadora, brindando
              atencion segura, inclusiva y humana.
            </p>
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">
              Vision
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              Ser referentes en soluciones tecnologicas inclusivas a nivel
              nacional e internacional, transformando la comunicacion en
              distintos sectores.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-5"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {value.title}
                </p>
                <p className="mt-2 text-xs text-slate-600">{value.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="equipo" className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Equipo
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Talento interdisciplinario
              </h2>
            </div>
            <p className="max-w-xl text-sm text-slate-600">
              Conformado por estudiantes de odontologia, especialistas en
              tecnologia y apoyo de profesionales en psicologia, diseno y
              administracion.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900"
              >
                {member}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-sm font-semibold text-slate-900">
              Apoyo de otras carreras
            </p>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {supportRoles.map((role) => (
                <div
                  key={role}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  {role}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-2">
          {Object.entries(swot).map(([title, items]) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {title}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {items.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section
          id="mercado"
          className="mt-20 grid gap-8 lg:grid-cols-[1fr_0.8fr]"
        >
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Estudio
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">
              Mercado y demanda
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              Encuesta con nivel de confianza del 95% y margen de error del 10%.
              Resultado: 34 encuestados. Alta aceptacion de tecnologia inclusiva
              en salud.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {marketStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-teal-700">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Modelo
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              Business canvas
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {businessModel.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Objetivos
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              Ruta de impacto
            </h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {objectives.map((objective) => (
                <div
                  key={objective.horizon}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700">
                    {objective.horizon}
                  </p>
                  <p className="mt-2 text-slate-900">{objective.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Proceso
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              Flujo clinico operativo
            </h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {flowSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  <span className="font-mono text-xs text-teal-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1 text-slate-900">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-100 via-white to-amber-100 p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Crecimiento
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Suscripcion mensual + soporte premium
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Planes flexibles para clinicas, hospitales y universidades con
                capacitacion y actualizaciones continuas.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white">
                Agendar visita
              </button>
              <button className="rounded-full border border-teal-300 px-6 py-3 text-sm font-semibold text-teal-700">
                Descargar brochure
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
