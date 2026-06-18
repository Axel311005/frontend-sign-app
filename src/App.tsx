import { useEffect, useRef, useState } from "react";
import logoUam from "./assets/logo.png";
import { AnimatedCard } from "./components/AnimatedCard";

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
  "Milena Urbina"
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

type Prediction = {
  label: string;
  score: number;
  top3: Array<{ label: string; score: number }>;
  latency_ms: number;
};

const PAIN_ALERT_LETTERS = new Set(["N", "S", "D"]);

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCvv(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

function formatCardName(value: string): string {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "").slice(0, 40);
}

function cardPreviewNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "•••• •••• •••• ••••";
  const padded = `${digits}${"•".repeat(16 - digits.length)}`.slice(0, 16);
  return padded.match(/.{1,4}/g)?.join(" ") ?? "•••• •••• •••• ••••";
}

function playAlertSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playNote(880, now, 0.25);
    playNote(1109.73, now + 0.1, 0.35);
  } catch (err) {
    console.error("No se pudo reproducir el sonido de alerta:", err);
  }
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sendLock = useRef(false);
  const loopRef = useRef<number | null>(null);
  const prevLabelRef = useRef<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<"letters" | "numbers">("letters");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const openPaymentModal = () => setShowPaymentModal(true);
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setCardName("");
  };

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

        const newLabel = payload?.label?.toUpperCase() ?? "";
        if (mode === "letters" && PAIN_ALERT_LETTERS.has(newLabel)) {
          if (newLabel !== prevLabelRef.current && !isMutedRef.current) {
            playAlertSound();
          }
        }
        prevLabelRef.current = newLabel;

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
            alt="Logo Señas y Sonrisas"
            className="h-16 w-auto object-contain sm:h-[4.5rem]"
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
              <button
                type="button"
                onClick={openPaymentModal}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400"
              >
                Ver planes
              </button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Modo actual", value: "Letras y numeros" },
                { label: "Entorno objetivo", value: "Odontologia" },
                { label: "Piloto", value: "UAM" },
              ].map((item, index) => (
                <AnimatedCard
                  key={item.label}
                  delay={index * 90}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {item.value}
                  </p>
                </AnimatedCard>
              ))}
            </div>
          </div>

          <AnimatedCard
            delay={150}
            className="rounded-[28px] border border-slate-200 bg-white/80 p-6"
          >
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
                    label: "Seña detectada",
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
                ].map((item, index) => (
                  <AnimatedCard
                    key={item.label}
                    delay={250 + index * 70}
                    className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2"
                  >
                    <p className="text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </AnimatedCard>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Alertas clinicas
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsMuted((prev) => {
                      const next = !prev;
                      isMutedRef.current = next;
                      return next;
                    });
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isMuted
                      ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                      : "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
                  }`}
                  aria-label={isMuted ? "Activar sonido" : "Silenciar sonido"}
                >
                  {isMuted ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                      </svg>
                      Silenciado
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3.5 w-3.5 animate-pulse"
                      >
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.57 17.47a.75.75 0 11-1.06-1.06 5.222 5.222 0 000-7.38.75.75 0 011.06-1.06 6.722 6.722 0 010 9.5z" />
                        <path d="M21.35 20.25a.75.75 0 01-1.06 0 9.215 9.215 0 000-13.03.75.75 0 111.06-1.06 10.715 10.715 0 010 15.15.75.75 0 010 1.06z" />
                      </svg>
                      Sonido Activo
                    </>
                  )}
                </button>
              </div>
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
          </AnimatedCard>
        </section>

        <section id="solucion" className="mt-20 grid gap-6 lg:grid-cols-3">
          {[
            {
              tag: "Justificacion",
              title: "Reducir barreras de comunicacion en consulta.",
              body: "La falta de comunicacion efectiva en tratamientos genera ansiedad y riesgos clinicos. El sistema interpreta senas en tiempo real y alerta al odontologo.",
            },
            {
              tag: "Giro",
              title: "Tecnologia + salud",
              body: "Emprendimiento inclusivo que conecta profesionales y pacientes con IA y vision artificial. Comienza en UAM y se proyecta a clinicas privadas.",
            },
            {
              tag: "Propuesta",
              title: "Inclusion, seguridad y humanidad.",
              body: "Comunicacion en tiempo real, capacitacion clinica y soporte continuo con actualizaciones premium.",
            },
          ].map((card, index) => (
            <AnimatedCard
              key={card.tag}
              delay={index * 100}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {card.tag}
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-4 text-sm text-slate-600">{card.body}</p>
            </AnimatedCard>
          ))}
        </section>

        <section
          id="impacto"
          className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <AnimatedCard
            className="rounded-3xl border border-slate-200 bg-white/80 p-6"
          >
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
          </AnimatedCard>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((value, index) => (
              <AnimatedCard
                key={value.title}
                delay={index * 80}
                shine
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-5"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {value.title}
                </p>
                <p className="mt-2 text-xs text-slate-600">{value.detail}</p>
              </AnimatedCard>
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
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <AnimatedCard
                key={member}
                delay={index * 60}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900"
              >
                {member}
              </AnimatedCard>
            ))}
          </div>
          <AnimatedCard
            delay={120}
            className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6"
          >
            <p className="text-sm font-semibold text-slate-900">
              Apoyo de otras carreras
            </p>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {supportRoles.map((role) => (
                <div
                  key={role}
                  className="card-inner-hover rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  {role}
                </div>
              ))}
            </div>
          </AnimatedCard>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-2">
          {Object.entries(swot).map(([title, items], index) => (
            <AnimatedCard
              key={title}
              delay={index * 100}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {title}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {items.map((item) => (
                  <li
                    key={item}
                    className="card-inner-hover rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedCard>
          ))}
        </section>

        <section
          id="mercado"
          className="mt-20 grid gap-8 lg:grid-cols-[1fr_0.8fr]"
        >
          <AnimatedCard className="rounded-3xl border border-slate-200 bg-white/80 p-6">
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
              {marketStats.map((stat, index) => (
                <AnimatedCard
                  key={stat.label}
                  delay={index * 80}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-teal-700">
                    {stat.value}
                  </p>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedCard>
          <AnimatedCard
            delay={120}
            className="rounded-3xl border border-slate-200 bg-white/80 p-6"
          >
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
                  className="card-inner-hover rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedCard>
        </section>

        <section className="mt-20">
          <AnimatedCard className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Objetivos
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              Ruta de impacto
            </h2>
            <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
              {objectives.map((objective, index) => (
                <AnimatedCard
                  key={objective.horizon}
                  delay={index * 90}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700">
                    {objective.horizon}
                  </p>
                  <p className="mt-2 text-slate-900">{objective.detail}</p>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedCard>
        </section>

        <AnimatedCard
          shine
          className="mt-20 rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-100 via-white to-amber-100 p-8"
        >
          <section id="suscripcion">
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
              <button
                type="button"
                className="rounded-full border border-teal-300 px-6 py-3 text-sm font-semibold text-teal-700"
              >
                Agendar visita
              </button>
              <button
                type="button"
                onClick={openPaymentModal}
                className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Suscribirse con tarjeta
              </button>
            </div>
            </div>
          </section>
        </AnimatedCard>
      </main>

      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex animate-overlay-in items-center justify-center bg-slate-900/50 p-4"
          onClick={closePaymentModal}
        >
          <div
            className="w-full max-w-md animate-modal-in rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Pago con tarjeta
              </h3>
              <button
                type="button"
                onClick={closePaymentModal}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 p-5 text-white shadow-md">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 right-8 h-32 w-32 rounded-full bg-white/5" />
              <p className="text-xs uppercase tracking-[0.25em] text-teal-100">
                Señas y Sonrisas
              </p>
              <p className="mt-6 font-mono text-lg tracking-[0.15em]">
                {cardPreviewNumber(cardNumber)}
              </p>
              <div className="mt-6 flex items-end justify-between text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-teal-200">
                    Titular
                  </p>
                  <p className="font-medium uppercase">
                    {cardName.trim() || "NOMBRE APELLIDO"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-teal-200">
                    Vence
                  </p>
                  <p className="font-medium">{expiry.trim() || "MM/AA"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Numero de tarjeta
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(event) =>
                    setCardNumber(formatCardNumber(event.target.value))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Vencimiento
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={expiry}
                    onChange={(event) =>
                      setExpiry(formatExpiry(event.target.value))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    CVV
                  </span>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="000"
                    maxLength={4}
                    value={cvv}
                    onChange={(event) =>
                      setCvv(formatCvv(event.target.value))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Nombre en la tarjeta
                </span>
                <input
                  type="text"
                  autoComplete="cc-name"
                  placeholder="Como aparece en la tarjeta"
                  maxLength={40}
                  value={cardName}
                  onChange={(event) =>
                    setCardName(formatCardName(event.target.value))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm uppercase text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              Confirmar pago
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              Vista previa — pago no procesado
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
