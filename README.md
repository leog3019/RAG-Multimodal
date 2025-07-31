# Sistema de Recuperación Multimodal de Información con RAG


## 📌 Descripción


Este proyecto implementa un sistema de **Generación Aumentada por Recuperación (RAG)** capaz de realizar búsquedas multimodales (imagen ↔ texto). El objetivo es permitir consultas en dos direcciones:


1. **Imagen ➜ Descripciones + Respuesta generativa**  

2. **Texto ➜ Imágenes + Respuesta generativa**


Este sistema fue desarrollado como parte del proyecto académico de la asignatura *Recuperación de Información*, bajo la tutoría del Prof. Iván Carrera.


---


## 🚀 Funcionalidades


- Codificación de corpus imagen-texto con modelo **CLIP**.

- Indexación de embeddings en espacio vectorial común usando **FAISS**.

- Consulta por texto o imagen.

- Recuperación de resultados más relevantes (descripciones e imágenes).

- Generación de respuesta textual mediante modelo generativo (ej. OpenAI GPT).

- Interfaz web básica para subir imagen o ingresar texto y visualizar resultados.


---


## 🧠 Tecnologías Utilizadas

- Python 3.10+

- [CLIP (OpenAI)](https://github.com/openai/CLIP)

- FAISS (Facebook AI Similarity Search)

- Streamlit o Flask (para la interfaz web)

- Transformers (para integración con modelos generativos tipo GPT)

- Pandas, NumPy, PIL, Matplotlib

## Como ejecutar

---

## ✅ Cómo ejecutar

1. Clona este repositorio:
   ```bash
   git clone https://github.com/usuario/proy02-rag-multimodal.git
   cd proy02-rag-multimodal

2. crear el entorno virtual
python -m venv venv
source venv/bin/activate  # o .\venv\Scripts\activate en Windows

3. Instalar dependencias
pip install -r requirements.txt
