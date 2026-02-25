'use client';
import { useState, useRef, useEffect } from 'react';


// Bu bileşeni çağırdığın yerde (parent component) yakalanan resmi almak için:
interface CameraCaptureProps {
  onCapture?: (file: File | string) => void; 
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Kamerayı Başlat
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      
      setStream(mediaStream); // Sadece state'e atıp bırakıyoruz
      setError(null);
    } catch (err) {
      setError("Kameraya erişilemedi. İzinleri kontrol et.");
      console.error(err);
    }
  };
  // Kamerayı Durdur (Stream'i kapat)
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Fotoğrafı Çek
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Canvas boyutunu videoya eşitle
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Videodaki kareyi canvas'a çiz
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Base64 formatına çevir
        const dataUrl = canvas.toDataURL('image/png');
        setImage(dataUrl);
        
        // Üst bileşene (Parent) veriyi gönder
        if (onCapture) {
            onCapture(dataUrl);
        }

        stopCamera(); // Çektikten sonra kamerayı kapat
      }
    }
  };

  // Yeniden Çek (Reset)
  const retakePhoto = () => {
    setImage(null);
    startCamera(); // İstersen otomatik tekrar başlat
  };

  // Component kapanırken kamerayı temizle (Memory leak önleme)
  useEffect(() => {
  // Eğer stream varsa ve video etiketi ekrana geldiyse bağla!
  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;
  }
  }, [stream]); // stream her değiştiğinde bu kodu tetikle

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-white shadow-sm w-full">
      <h2 className="text-xl font-bold text-gray-800">Nöbet Kanıt Ekranı</h2>
      
      {/* Hata Mesajı */}
      {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

      {/* Görüntü Alanı */}
      <div className="aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
        {!image ? (
          /* Kamera Modu */
          !stream ? (
            /* Kamera Kapalıyken */
            <div className="flex flex-col items-center justify-center text-gray-400">
               <p className="mb-2">Kamera kapalı</p>
               <button 
                 onClick={startCamera}
                 className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
               >
                 Kamerayı Başlat
               </button>
            </div>
          ) : (
            /* Kamera Açıkken (Video) */
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              // w-full'un yanına şunları ekledik:
              className="w-full aspect-video object-cover rounded-md"
            />
          )
        ) : (
          /* Çekilen Fotoğraf Modu */
          <img src={image} alt="Kanıt" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Kontrol Butonları */}
      <div className="flex gap-3">
        {stream && !image && (
          <button
            onClick={capturePhoto}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Fotoğrafı Çek
          </button>
        )}
        
        {stream && !image && (
             <button
             onClick={stopCamera}
             className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
           >
             Vazgeç
           </button>
        )}

        {image && (
          <button
            onClick={retakePhoto}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
          >
            Yeniden Çek
          </button>
        )}
      </div>

      {/* Gizli Canvas (Görüntü işleme için gerekli) */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
