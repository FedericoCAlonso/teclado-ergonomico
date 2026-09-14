# Evolución y Hoja de Ruta: Teclado Ergonómico Polar Monomanual

Este documento consolida las decisiones de diseño biomecánico, la arquitectura del sistema implementada en la versión web y las especificaciones para el futuro desarrollo del proyecto nativo para Android (**Input Method Editor - IME**).

---

## 1. Fundamentos y Arquitectura del Teclado Polar

### 1.1 Modelo Biomecánico del Pulgar
A diferencia de los teclados rectangulares tradicionales (QWERTY), este teclado modela el movimiento osteomuscular real del pulgar derecho/izquierdo anclado a la articulación carpometacarpiana (CMC):
- **Coordenadas Polares:** $(r, \theta)$ proyectadas cartesianamente desde el punto pivote anatómico calibrado:
  - **Pivote X:** `332 px`
  - **Pivote Y:** `325 px`
  - **Escala de Arcos:** `80%`
  - **Tamaño de Teclas:** `75%`
- **Ley de Densidad Creciente Concéntrica:** A menor radio de curvatura, menor número de teclas para evitar el apiñamiento y la hiper-flexión; a mayor radio, mayor número de teclas:
  $$\text{Controles (5 teclas)} < \text{Golden Arc (6 teclas)} < \text{Upper Arc (8 teclas)} < \text{Arco Exterior (10 teclas)}$$
  Total: **29 teclas circulares + 1 barra espaciadora en cinta = 30 teclas**.

### 1.2 Interacción "Opción C": Botones Dobles (Tap vs Flick)
- **100% Determinista (Sin Motores Predictivos):** Sin ambigüedad ni autocorrector invasivo.
- **Micro-Flick Threshold:** $\Delta \ge 11\text{ px}$.
  - **Tap (Toque simple):** Emite el carácter primario (frecuencia mayor, ~94% de pulsaciones).
  - **Flick (Micro-deslizamiento):** Emite el carácter secundario (~6% de pulsaciones).
- **Barra de Espacio en Cinta Curva:**
  - *Tap:* Inserta espacio.
  - *Arrastre horizontal continuo:* Mueve el cursor carácter a carácter con precisión milimétrica.
- **Tilde Dedicada (´ - Dead Key):** Pulsación de `´` seguida de vocal genera vocal con tilde directa (`á`, `é`, `í`, `ó`, `ú`).

---

## 2. Sistema de Capas y Funcionalidades Modernas

### 2.1 Capa Principal Alfabética (`ABC`)
- **Arco Exterior (10 teclas accesorias de productividad de PC):**
  - `123`: Acceso directo a la capa numérica. *(Flick en cada tecla emite los dígitos `1..0` directamente sin conmutar capa).*
  - `SYM`: Acceso directo a símbolos de programación y puntuación extendida.
  - `Ctrl` *(Sticky One-Shot)*: 1 toque se arma para la siguiente tecla (`Ctrl+C`, `Ctrl+V`, `Ctrl+Z`, `Ctrl+A`, `Ctrl+X`), 2 toques bloquea (`CTRL 🔒`).
  - `Alt` *(Sticky One-Shot)*: Modificador para atajos de sistema.
  - `Esc`: Cancela estados pendientes, tildes y modificadores armados.
  - `Tab`: Tabulación directa (`\t`).
  - `Supr`: Borrado hacia adelante (elimina el carácter a la derecha del cursor).
  - `↶` (Deshacer): Deshace la última acción con pila de historial.
  - `📋` (Pegar): Pega texto del portapapeles.
  - `📄` (Copiar): Copia el texto al portapapeles.
- **Arco Superior (8 botones dobles):** 16 letras del abecedario.
- **Arco Dorado (6 botones dobles):** 11 letras de alta frecuencia + signo/letra complementaria.
- **Arco de Controles (5 teclas):** `⇧` (Shift/Caps), `´` (Tilde), `,` (Coma / punto y coma), `⌫` (Backspace), `↵` (Enter).

### 2.2 Las 3 Distribuciones Alfabéticas Calibradas
1. **Original (Frecuencia Fonotáctica):** Letras reinas (`E, A, O, S, R, N`) en el arco dorado de descanso neutro. Máxima ergonomía física.
2. **QWERTY 1 (Pares Horizontales):** Agrupa pares contiguos de la fila QWERTY (`Q-W`, `E-R`, `T-Y`, `A-S`, `D-F`...). Búsqueda visual inmediata para usuarios migrando desde teclados estándar.
3. **QWERTY 2 (Columnas Verticales):** Agrupa cada letra principal con su vecina de columna (`A-Z`, `S-X`, `D-C`, `R-F`...).

### 2.3 Capa Numérica (`123` - *Polar Numpad Mix*)
Combina la memoria muscular de una calculadora / pad numérico 3x3 con el barrido concéntrico:
- Fila 3 (Exterior): `[ 7 ] [ 8 ] [ 9 ]` con operadores ` / `, ` * ` y tecla `⌫`.
- Fila 2 (Superior): `[ 4 ] [ 5 ] [ 6 ]` con operadores ` - `, ` + `, ` ^ `.
- Fila 1 (Dorado): `[ 1 ] [ 2 ] [ 3 ]` con operadores ` = `, `[ 0 ]`, ` . `.
- Controles inferiores: `[Ctrl]`, `[Alt]`, ` , `, `[Supr]`, `↵`.
- Botones de escape rápido: `[ABC]` y `[SYM]` en la esquina superior izquierda.

### 2.4 Capa de Símbolos (`SYM`)
- Llaves, corchetes y comparadores contiguos: `[ ]`, `{ }`, `( )`, `< >`.
- Operadores y comodines de programación: `@ # $ % & / \ | ~ ^ _`.
- Puntuación doble y comillas: `¿ ?`, `¡ !`, `" '`, `: ;`, ``` ` ```.

### 2.5 Distribución Bimanual Ergonómica QWERTY (Dos Pulgares)
- **Geometría Dividida y Corrección Central:**
  - Distribución alfabética estándar QWERTY dividida en dos alas perfectamente especulares (19 teclas por ala).
  - Corrección ergonómica en las columnas centrales (`T-G-B` en mano izquierda y `Y-H-N` en mano derecha): inclinación angular de confort y separación de 52 px para evitar la sobre-extensión o choque de los pulgares en el centro.
- **Clústeres Simétricos de Pulgares:**
  - Pulgar izquierdo: Cinta de espacio (`⟷`), `Shift` (`⇧`), `Tilde` (`´`), Capa `123`.
  - Pulgar derecho: Cinta de espacio (`⟷`), `Backspace` (`⌫`), `Enter` (`↵`), `Supr`.
  - Ambas barras de espacio admiten deslizamiento continuo para scrub milimétrico del cursor.

### 2.6 Mejoras de Legibilidad y Estado Dinámico de Letras
- **Letras en minúscula por defecto:** Reflejan fielmente el carácter que se insertará.
- **Conmutación reactiva con Shift:** Al activar Shift, tanto la letra primaria como la secundaria se transforman instantáneamente a mayúscula (`a·z` -> `A·Z`).
- **Barra de espacio minimalista:** Eliminación del texto "ESPACIO", reemplazado por el glifo de navegación `⟷`.
- **Alto contraste visual:** Teclas con fondo Slate-800 (`#1e293b`), bordes Slate-600 (`#475569`), letra primaria en blanco brillante (`#f8fafc`) y caracteres secundarios en ámbar de alta visibilidad (`#fbbf24`).
- **Simetría especular completa para zurdos:** En modo monomanual izquierdo, los pivotes, arcos, teclas y la ubicación relativa de las letras dentro de cada botón se reflejan de forma idéntica respecto al eje vertical.

---

## 3. Especificaciones para el Proyecto Android Nativo (IME)

Para convertir este diseño en un teclado universal que reemplace a Gboard o SwiftKey en Android:

### 3.1 Arquitectura del Sistema Android
```
           +---------------------------------------------------+
           |                 Android OS / App                  |
           |             (WhatsApp, Chrome, etc.)              |
           +-------------------------+-------------------------+
                                     ^
                         InputConnection (Texto, Cursor)
                                     v
           +-------------------------+-------------------------+
           |     PolarKeyboardIME : InputMethodService         |
           +-------------------------+-------------------------+
                                     |
               +---------------------+---------------------+
               |                     |                     |
               v                     v                     v
    +--------------------+  +------------------+  +------------------+
    | ErgonomicKeyboardView |  | GestureProcessor |  |  PolarEngine     |
    | (Canvas 2D nativo) |  | (Tap / Flick)    |  |  (Geometría y    |
    |                    |  | (Cursor Scrub)   |  |   Mapeos)        |
    +--------------------+  +------------------+  +------------------+
               |
               v
    +--------------------+
    |   HapticFeedback   |
    |  (Micro-vibración) |
    +--------------------+
```

### 3.2 Componentes Esenciales de Android

1. **`AndroidManifest.xml`:**
   ```xml
   <service
       android:name=".PolarKeyboardService"
       android:label="@string/keyboard_name"
       android:permission="android.permission.BIND_INPUT_METHOD">
       <intent-filter>
           <action android:name="android.view.InputMethod" />
       </intent-filter>
       <meta-data
           android:name="android.view.im"
           android:resource="@xml/method" />
   </service>
   ```

2. **`PolarKeyboardService.kt` (Hereda de `InputMethodService`):**
   - `onCreateInputView()`: Infla la vista personalizada del teclado.
   - `onStartInputView(info: EditorInfo, restarting: Boolean)`: Detecta el tipo de campo (`TYPE_CLASS_NUMBER`, `TYPE_TEXT_VARIATION_EMAIL_ADDRESS`, etc.) para abrir la capa adecuada por defecto.
   - Enlace con `InputConnection`:
     - `currentInputConnection.commitText(char, 1)`
     - `currentInputConnection.deleteSurroundingText(1, 0)` (Backspace)
     - `currentInputConnection.deleteSurroundingText(0, 1)` (Supr / Delete adelante)
     - `currentInputConnection.sendKeyEvent(KeyEvent(ACTION_DOWN, KEYCODE_ENTER))`
     - `currentInputConnection.setSelection(newPos, newPos)` (desplazamiento gestual del cursor).

3. **`ErgonomicKeyboardView.kt` (Vista Táctil Personalizada):**
   - Extiende `android.view.View`.
   - `onDraw(canvas: Canvas)`: Renderizado con `Paint` anti-alias por aceleración de hardware (60/120 FPS fijos). Dibuja los arcos guía, las teclas circulares con doble etiqueta y el `Path` curvo de la barra espaciadora.
   - `onTouchEvent(event: MotionEvent)`:
     - `ACTION_DOWN`: Captura de coordenada inicial `(startX, startY)` y tecla objetivo.
     - `ACTION_MOVE`: Cálculo de desplazamiento euclidiano. Si está en la barra espaciadora, activa el modo *cursor scrub* enviando eventos de movimiento de cursor según el $\Delta X$. Si supera $11\text{ px}$ en una tecla normal, activa visualmente el modo *Flick*.
     - `ACTION_UP`: Si $\text{distancia} \ge 11\text{ px} \to \text{Flick}$, si no $\to \text{Tap}$. Dispara el pulso háptico correspondiente y emite el carácter.

4. **Motor Háptico (`Vibrator` / `VibrationEffect`):**
   - **Tap Háptico:** `VibrationEffect.createPredefined(EFFECT_CLICK)` (micro-impulso de ~8 ms).
   - **Flick Háptico:** `VibrationEffect.createPredefined(EFFECT_HEAVY_CLICK)` o doble pulso suave para confirmar la selección del carácter secundario.

5. **`SettingsActivity.kt` & Preferencias (`DataStore`):**
   - Toggle: Mano derecha / Mano izquierda (invierte automáticamente el pivote $X = \text{Ancho} - X$).
   - Selector de distribución: Fonotáctica Original vs QWERTY 1 vs QWERTY 2.
   - Calibrador visual de pivote y radios para adaptarse al tamaño de mano y pantalla de cada usuario.
   - Ajuste de intensidad háptica.

6. **Privacidad Absoluta:**
   - Cero permisos de red (`android.permission.INTERNET` no se declara).
   - 100% de la lógica reside localmente en el dispositivo.

---

## 4. Estado del Repositorio Web
- **Branch:** `main` (sincronizada en commit `9160875`).
- **Tests Unitarios:** 44 tests pasando en Vitest (100% cobertura de motores ergonómicos y capas).
- **Despliegue Activo en GitHub Pages:** [https://federicocalonso.github.io/teclado-ergonomico/](https://federicocalonso.github.io/teclado-ergonomico/)
