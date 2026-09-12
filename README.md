# ⌨️ Teclado Ergonómico Polar (Spanish Mobile Keyboard Research)

> **Plataforma experimental para el diseño, optimización matemática y validación biomecánica de sistemas de entrada táctil para teléfonos móviles orientados al idioma español.**

🌐 **Demo en vivo (GitHub Pages):** [https://FedericoCAlonso.github.io/teclado-ergonomico/](https://FedericoCAlonso.github.io/teclado-ergonomico/)

---

## 🎯 Premisa Fundamental

> **«No adaptar QWERTY al teléfono. Diseñar el teclado desde cero a partir de la biomecánica del pulgar y de las características fonotácticas del lenguaje español.»**

### Principios No Negociables
1. **Layout Fijo e Inmutable**: Las coordenadas visuales y espaciales de las teclas no cambian jamás según la predicción. La memoria muscular exige constancia espacial absoluta.
2. **Reconocimiento Probabilístico / Bayesiano**: La inteligencia adaptativa modifica la tolerancia de frontera (Voronoi estocástico ponderado por contexto lingüístico), pero no mueve las teclas.
3. **Optimización Multidimensional**:
   $$\text{Costo} = w_1 \cdot \text{Movimiento} + w_2 \cdot \text{Transición/Inercia} + w_3 \cdot \text{Error} + w_4 \cdot \text{Oclusión} + w_5 \cdot \text{Alcance}$$
4. **Tratamiento Nativo del Español**: Letra `Ñ` fija en primer orden, micro-gestos y desambiguación para tildes (`á, é, í, ó, ú`), puntuación cardinal y pares `¿ ?`, `¡ !`.

---

## 🔬 Arquitectura Modular del Sistema

```
src/
├── biomechanics/    # Cinemática polar CMC, mapas de alcance y modelo de oclusión del pulgar
├── linguistics/     # Frecuencias del español, matrices de transición n-gram y prior de Markov
├── optimizer/       # Función de costo multiobjetivo y evaluador de layouts
├── decoder/         # Motor bayesiano de interpretación táctil (Dynamic Voronoi)
├── layouts/         # Definición de layouts fijos: Radial (1P), Bimanual (2P), Híbrido
├── metrics/         # Medición de WPM, KSPC, tasa de error, distancia y mapas de calor
└── components/      # UI del teclado, canvas de debug, visualizador de tolerancias y oclusión
```

---

## 🚀 Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/FedericoCAlonso/teclado-ergonomico.git
cd teclado-ergonomico

# 2. Instalar dependencias
npm install

# 3. Iniciar entorno de desarrollo
npm run dev

# 4. Correr suite de pruebas unitarias y validaciones matemáticas
npm test

# 5. Compilar para producción
npm run build
```
