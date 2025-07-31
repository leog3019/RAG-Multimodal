import React, { useState } from "react";
import "./search_component.css";

const SearchComponent = () => {
  const [query, setQuery] = useState(""); // Para la consulta de texto
  const [selectedImage, setSelectedImage] = useState(null); // Para la imagen subida
  const [results, setResults] = useState([]); // Para los resultados
  const [ragResponse, setRagResponse] = useState(""); // Para la respuesta RAG
  const [loading, setLoading] = useState(false); // Para mostrar estado de carga
  const [searchType, setSearchType] = useState("text"); // "text" o "image"

  // Función para manejar la entrada de texto de la consulta
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  // Función para manejar la selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file: file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
      setSearchType("image");
    }
  };

  // Función para cambiar el tipo de búsqueda
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    if (type === "text") {
      setSelectedImage(null);
    } else {
      setQuery("");
    }
    setResults([]);
    setRagResponse("");
  };

  // Función para manejar la búsqueda por texto
  const handleTextSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8004/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResults(data.results || []);
        setRagResponse(data.rag_response || "");
      } else {
        console.error("Error en la búsqueda:", data.detail || "Error desconocido");
        setResults([]);
        setRagResponse("Error en la búsqueda por texto.");
      }
    } catch (error) {
      console.error("Error al obtener resultados:", error);
      setResults([]);
      setRagResponse("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la búsqueda por imagen
  const handleImageSearch = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage.file);

      const response = await fetch("http://localhost:8004/search-by-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResults(data.results || []);
        setRagResponse(data.rag_response || "");
      } else {
        console.error("Error en la búsqueda:", data.detail || "Error desconocido");
        setResults([]);
        setRagResponse("Error en la búsqueda por imagen.");
      }
    } catch (error) {
      console.error("Error al obtener resultados:", error);
      setResults([]);
      setRagResponse("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Función unificada para manejar la búsqueda
  const handleSearch = () => {
    if (searchType === "text") {
      handleTextSearch();
    } else {
      handleImageSearch();
    }
  };

  // Función para limpiar la imagen seleccionada
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setSearchType("text");
    setResults([]);
    setRagResponse("");
  };

  // Función para manejar la selección de imagen desde archivo
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file: file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para abrir el selector de archivos
  const openFileSelector = () => {
    document.getElementById('imageInput').click();
  };

  // Verificar compatibilidad del navegador
  const checkCameraSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Tu navegador no soporta acceso a cámara. Por favor, usa un navegador moderno como Chrome, Firefox o Safari.");
      return false;
    }
    return true;
  };

  // Función para obtener las cámaras disponibles
  const getAvailableCameras = async () => {
    try {
      // Primero solicitar permisos básicos de cámara
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Ahora enumerar dispositivos (después de obtener permisos)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      // Seleccionar la primera cámara por defecto si no hay ninguna seleccionada
      if (cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cameras[0].deviceId);
      }
      
      return cameras;
    } catch (error) {
      console.error("Error al obtener cámaras:", error);
      throw error; // Re-lanzar el error para manejarlo en startCamera
    }
  };

  // Función para iniciar la captura de cámara
  const startCamera = async () => {
    // Verificar compatibilidad del navegador primero
    if (!checkCameraSupport()) {
      return;
    }

    try {
      setIsCapturing(true);
      
      // Obtener cámaras disponibles primero (esto pedirá permisos)
      const cameras = await getAvailableCameras();
      
      if (cameras.length === 0) {
        alert("No se encontraron cámaras disponibles en tu dispositivo.");
        setIsCapturing(false);
        return;
      }

      // Usar la cámara seleccionada o la primera disponible
      const cameraId = selectedCameraId || cameras[0].deviceId;
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Si tenemos un ID específico de cámara, usarlo
      if (cameraId) {
        constraints.video.deviceId = { exact: cameraId };
      } else {
        // Fallback para móviles
        constraints.video.facingMode = 'environment';
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      // Mostrar el video en el elemento video
      const videoElement = document.getElementById('cameraVideo');
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setIsCapturing(false);
      
      // Mensajes de error más específicos
      if (error.name === 'NotAllowedError') {
        alert("Permisos de cámara denegados. Por favor, permite el acceso a la cámara en tu navegador y recarga la página.");
      } else if (error.name === 'NotFoundError') {
        alert("No se encontró ninguna cámara disponible en tu dispositivo.");
      } else if (error.name === 'NotReadableError') {
        alert("La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que puedan estar usando la cámara.");
      } else if (error.name === 'OverconstrainedError') {
        alert("No se pudo acceder a la cámara con la configuración solicitada.");
      } else {
        alert("Error al acceder a la cámara: " + error.message);
      }
    }
  };

  // Función para cambiar de cámara
  const switchCamera = async (cameraId) => {
    try {
      // Detener el stream actual
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      // Iniciar nuevo stream con la cámara seleccionada
      const constraints = {
        video: {
          deviceId: { exact: cameraId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setCameraStream(stream);
      setSelectedCameraId(cameraId);
      
      // Mostrar el video en el elemento video
      const videoElement = document.getElementById('cameraVideo');
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (error) {
      console.error("Error al cambiar cámara:", error);
      
      // Mensajes de error específicos
      if (error.name === 'NotReadableError') {
        alert("La cámara seleccionada está siendo usada por otra aplicación.");
      } else if (error.name === 'OverconstrainedError') {
        alert("La cámara seleccionada no soporta la configuración solicitada.");
      } else {
        alert("No se pudo cambiar a la cámara seleccionada: " + error.message);
      }
      
      // Intentar volver a la cámara anterior si hay alguna funcionando
      if (cameraStream && cameraStream.active) {
        // Si el stream anterior aún está activo, no hacer nada más
        return;
      }
      
      // Si no hay stream activo, intentar con la primera cámara disponible
      if (availableCameras.length > 0) {
        const firstCamera = availableCameras[0];
        if (firstCamera.deviceId !== cameraId) {
          switchCamera(firstCamera.deviceId);
        }
      }
    }
  };

  // Función para capturar imagen desde la cámara
  const captureImage = () => {
    const videoElement = document.getElementById('cameraVideo');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedImage({
        file: file,
        preview: canvas.toDataURL(),
        name: file.name
      });
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  // Función para detener la cámara
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCapturing(false);
  };

  // Función para eliminar imagen seleccionada
  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  // Función para buscar por imagen
  const handleImageSearch = async () => {
    if (!selectedImage) {
      alert("Por favor, selecciona o captura una imagen primero.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedImage.file);
      formData.append('model', model);

      const response = await fetch("http://localhost:8000/search-by-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
      } else {
        console.error("Error en la búsqueda por imagen:", data.error);
        setResults([]);
      }
    } catch (error) {
      console.error("Error al buscar por imagen:", error);
      setResults([]);
    }
  };

  return (
    <div className="search-page">
      {/* Contenedor principal de búsqueda */}
      <div className="search-main">
        {/* Barra de búsqueda principal */}
        <h1 className="search-title">Qué tienes en mente hoy?</h1>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            {/* Imagen previa integrada */}
            {selectedImage && (
              <div className="integrated-image-preview">
                <img 
                  src={selectedImage.preview} 
                  alt="Preview" 
                  className="integrated-preview-image"
                />
                <button className="edit-image-button" onClick={openFileSelector}>✏️</button>
                <button className="close-integrated-image" onClick={removeSelectedImage}>✕</button>
              </div>
            )}
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Buscar en la base de conocimientos..."
              className="search-input"
            />
            <button onClick={selectedImage ? handleImageSearch : handleSearch} className="search-button">
              {selectedImage ? "Buscar por imagen" : "Buscar"}
            </button>
          </div>
        </div>

        {/* Menú desplegable para seleccionar el modelo (oculto pero funcional) */}
        <div className="model-selector-hidden">
          <select value={model} onChange={handleModelChange}>
            <option value="tfidf">TF-IDF</option>
            <option value="bm25">BM25</option>
          </select>
        </div>

        {/* Botones de funcionalidades adicionales */}
        <div className="additional-features">
          <button className="feature-button" onClick={startCamera}>
            <span className="camera-icon">📷</span> Capturar Imagen
          </button>
          <button className="feature-button" onClick={openFileSelector}>
            <span className="image-search-icon">🖼</span> Búsqueda por imagen
          </button>
        </div>

        {/* Input oculto para seleccionar archivos */}
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        {/* Modal de cámara */}
        {isCapturing && (
          <div className="camera-modal">
            <div className="camera-container">
              <div className="camera-header">
                <h3>Capturar Imagen</h3>
                <button className="close-camera" onClick={stopCamera}>✕</button>
              </div>
              
              {/* Selector de cámara */}
              {availableCameras.length > 1 && (
                <div className="camera-selector">
                  <label htmlFor="cameraSelect">Seleccionar cámara:</label>
                  <select 
                    id="cameraSelect"
                    value={selectedCameraId || ''}
                    onChange={(e) => switchCamera(e.target.value)}
                    className="camera-select"
                  >
                    {availableCameras.map((camera, index) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Cámara ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <video
                id="cameraVideo"
                autoPlay
                playsInline
                className="camera-video"
              ></video>
              <div className="camera-controls">
                <button className="capture-button" onClick={captureImage}>
                  📸 Capturar
                </button>
                <button className="cancel-button" onClick={stopCamera}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mostrar los resultados */}
      {results.length > 0 && (
        <div className="results">
          <h2>Resultados de búsqueda</h2>
          
          {/* Respuesta RAG */}
          {results.find(result => result.type === 'rag_text') && (
            <div className="rag-response">
              <h3>🤖 Respuesta del sistema:</h3>
              <p>{results.find(result => result.type === 'rag_text').text}</p>
            </div>
          )}
          
          {/* Lista de imágenes similares */}
          <div className="image-results">
            <h3>Imágenes similares encontradas:</h3>
            <div className="image-grid">
              {results.filter(result => result.type === 'image').map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-image-container">
                    <img 
                      src={result.image_url || `http://localhost:8000/images/${result.image_path.split('/').pop()}`}
                      alt={result.text}
                      className="result-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                      }}
                    />
                    {result.score && (
                      <div className="similarity-score">
                        {result.score}% similar
                      </div>
                    )}
                  </div>
                  <div className="result-info">
                    <p className="result-text">{result.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
