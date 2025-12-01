# Lista de Archivos para Migrar a Visual Studio Code

Esta es una guía de referencia para saber qué archivos y carpetas de este proyecto debes copiar a tu computadora local y cuáles debes ignorar.

---

### ✅ Archivos y Carpetas que SÍ debes copiar

Estos son los archivos que forman el código fuente y la configuración esencial de tu aplicación. Debes copiar **todos** los siguientes elementos a una nueva carpeta en tu computadora.

- **`src/`** (La carpeta más importante, contiene toda tu aplicación)
- **`public/`** (Contiene archivos estáticos como imágenes)
- **`docs/`** (Contiene la definición de tu backend y otros documentos)
- `.env`
- `.firebaserc`
- `.gitignore`
- `apphosting.yaml`
- `components.json`
- `firebase.json`
- `next-env.d.ts`
- `next.config.ts`
- `package.json` (Esencial para instalar las dependencias)
- `postcss.config.mjs` (Si existe)
- `README.md`
- `tailwind.config.ts`
- `tsconfig.json`

---

### ❌ Archivos y Carpetas que NO debes copiar

Estas carpetas y archivos son específicos de este entorno de desarrollo en la nube o se generan automáticamente. **NO los copies**, ya que no son necesarios y podrían causar problemas.

- **`node_modules/`** (Se regenera con el comando `npm install`)
- **`.next/`** (La genera Next.js al ejecutar la aplicación)
- **`.idx/`** (Configuración específica de este entorno)
- **`.firebase/`** (Caché de la CLI de Firebase)
- **`.modified`** (Archivo de seguimiento de cambios del entorno)
- **`package-lock.json`** (Se generará uno nuevo y optimizado para tu sistema al instalar)

---

### Siguientes Pasos en tu Computadora

1.  Abre la carpeta del proyecto en Visual Studio Code.
2.  Abre una nueva terminal.
3.  Ejecuta `npm install` para instalar todas las dependencias.
4.  Ejecuta `npm run dev` para iniciar el servidor de desarrollo.
