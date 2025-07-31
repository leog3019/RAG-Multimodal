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
    setResults([]);
    setRagResponse("");
    
    try {
      console.log("Enviando búsqueda de texto:", query.trim());
      
      const response = await fetch("http://localhost:8004/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      console.log("Respuesta del servidor:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);
      
      if (data.success) {
        setResults(data.results || []);
        setRagResponse(data.rag_response || "");
      } else {
        console.error("Error en la búsqueda:", data.detail || "Error desconocido");
        setResults([]);
        setRagResponse("Error en la búsqueda por texto.");
      }
    } catch (error) {
      console.error("Error completo al obtener resultados:", error);
      setResults([]);
      setRagResponse(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la búsqueda por imagen
  const handleImageSearch = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setResults([]);
    setRagResponse("");
    
    try {
      console.log("Enviando búsqueda de imagen:", selectedImage.name);
      
      const formData = new FormData();
      formData.append("image", selectedImage.file);

      const response = await fetch("http://localhost:8004/search-by-image", {
        method: "POST",
        body: formData,
      });

      console.log("Respuesta del servidor:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);
      
      if (data.success) {
        setResults(data.results || []);
        setRagResponse(data.rag_response || "");
      } else {
        console.error("Error en la búsqueda:", data.detail || "Error desconocido");
        setResults([]);
        setRagResponse("Error en la búsqueda por imagen.");
      }
    } catch (error) {
      console.error("Error completo al obtener resultados:", error);
      setResults([]);
      setRagResponse(`Error de conexión: ${error.message}`);
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

  return (
    <div className="search-page">
      <div className="search-main">
        <h1 className="search-title">Qué tienes en mente hoy?</h1>
        
        {/* Selector de tipo de búsqueda */}
        <div className="search-type-selector">
          <button 
            className={`type-button ${searchType === "text" ? "active" : ""}`}
            onClick={() => handleSearchTypeChange("text")}
          >
            🔍 Buscar por Texto
          </button>
          <button 
            className={`type-button ${searchType === "image" ? "active" : ""}`}
            onClick={() => handleSearchTypeChange("image")}
          >
             Buscar por Imagen
          </button>
        </div>

        <div className="search-bar-container">
          {searchType === "text" ? (
            // Búsqueda por texto
            <div className="search-input-wrapper">
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Escribe lo que quieres buscar..."
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch} 
                className="search-button"
                disabled={loading || !query.trim()}
              >
                {loading ? "🔄" : "🔍"}
              </button>
            </div>
          ) : (
            // Búsqueda por imagen
            <div className="image-search-container">
              {!selectedImage ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" className="image-upload-label">
                    <div className="upload-content">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">Selecciona una imagen</span>
                      <span className="upload-subtext">JPG, PNG, GIF hasta 10MB</span>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="selected-image-container">
                  <div className="selected-image-preview">
                    <img 
                      src={selectedImage.preview} 
                      alt="Imagen seleccionada" 
                      className="preview-image"
                    />
                    <button 
                      onClick={clearSelectedImage}
                      className="clear-image-button"
                      title="Cambiar imagen"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="image-actions">
                    <span className="image-name">{selectedImage.name}</span>
                    <button 
                      onClick={handleSearch} 
                      className="search-button"
                      disabled={loading}
                    >
                      {loading ? "🔄 Buscando..." : "🔍 Buscar Similares"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Indicador de carga */}
        {loading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Buscando...</span>
          </div>
        )}

        {/* Respuesta RAG */}
        {ragResponse && !loading && (
          <div className="rag-response">
            <h3>🤖 Respuesta del Sistema:</h3>
            <p>{ragResponse}</p>
          </div>
        )}

        {/* Mostrar los resultados */}
        {results.length > 0 && !loading && (
          <div className="results-container">
            <h2>Resultados de búsqueda ({results.length})</h2>
            <div className="results-grid">
              {results.map((result, index) => (
                <div key={result.id || index} className="result-item">
                  <div className="result-image-container">
                    <img 
                      src={result.image_url} 
                      alt={result.caption || result.text}
                      className="result-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="image-error" style={{display: 'none'}}>
                      🖼️ Error cargando imagen
                    </div>
                  </div>
                  <div className="result-info">
                    <div className="result-score">
                      Similitud: {result.score}%
                    </div>
                    <div className="result-caption">
                      {result.caption || result.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {results.length === 0 && !loading && (ragResponse || query || selectedImage) && (
          <div className="no-results">
            <p>No se encontraron resultados.</p>
            <p>Intenta con otros términos de búsqueda o una imagen diferente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
