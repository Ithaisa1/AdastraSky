import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async (mode) => {
    stopCamera();
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Actívalo en la configuración del navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('No se detectó ninguna cámara en este dispositivo.');
      } else {
        setError('Error al abrir la cámara: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCaptured(URL.createObjectURL(blob));
      onCapture(file);
    }, 'image/jpeg', 0.92);
    stopCamera();
  };

  const retake = () => {
    setCaptured(null);
    startCamera(facingMode);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button onClick={() => { stopCamera(); onClose(); }}
          className=" p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <button onClick={capturePhoto} className="text-white text-sm font-medium">Tomar foto</button>
        <button onClick={switchCamera}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center">
        {error ? (
          <div className="text-center p-8 max-w-sm">
            <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-white text-sm mb-4">{error}</p>
            <button onClick={() => startCamera(facingMode)}
              className="px-4 py-2 bg-astroAccent text-white rounded-lg text-sm">Reintentar</button>
          </div>
        ) : captured ? (
          <>
            <img src={captured} alt="Captura" className="max-h-full max-w-full object-contain" />
            <div className="absolute bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2">
              <button onClick={retake}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
                <RefreshCw className="w-5 h-5" />
                Repetir
              </button>
            </div>
          </>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted
              className="max-h-full max-w-full object-contain"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
            <div className="absolute bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2">
              <button onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center shadow-lg shadow-black/50">
                <div className="w-12 h-12 rounded-full bg-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
