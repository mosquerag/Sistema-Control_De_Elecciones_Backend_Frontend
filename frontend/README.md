# 🔄 GUÍA DE ACTUALIZACIÓN DE IMPORTS

Después de aplicar todos los cambios, actualiza estos imports en tu proyecto.

---

## 1. ThemeContext — nueva ubicación

**Buscar y reemplazar en todo el proyecto:**

```
// ANTES (incorrecto — apuntaba a components/)
import { useTheme } from './ThemeContext';
import { useTheme } from '../ThemeContext';
import { useTheme } from '@/components/ThemeContext';
import { ThemeProvider } from '@/components/ThemeContext';

// DESPUÉS (correcto)
import { useTheme }      from '@/context/ThemeContext';
import { ThemeProvider } from '@/context/ThemeContext';
```

**Archivos que necesitan el cambio:**

- `src/main.jsx` ✅ (ya actualizado)
- `src/components/common/ThemeToggle.jsx` ✅ (ya actualizado)
- `src/components/ThemeToggle.jsx` → actualizar (o eliminar este archivo)
- Cualquier otro componente que use `useTheme`

---

## 2. ProtectedRoute / PublicRoute — nueva ubicación

```
// ANTES
import ProtectedRoute from '@/utils/ProtectedRoute';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import PublicRoute    from '@/components/PublicRoute';

// DESPUÉS
import ProtectedRoute from '@/router/ProtectedRoute';
import PublicRoute    from '@/router/PublicRoute';
```

**Archivos que necesitan el cambio:**

- `src/router/AppRouter.jsx` → verificar imports

---

## 3. Servicios duplicados — unificar en api/

```
// ANTES (services/ — eliminar estos)
import { loginAdmin }  from '@/services/authService';
import { obtenerPerfil } from '@/services/profileService';

// DESPUÉS (api/ — usar estos)
import { loginAdmin }  from '@/api/auth';
import { getPerfil }   from '@/api/perfil';
```

---

## 4. Verificar con grep

Una vez hechos los cambios, verificar que no queden imports rotos:

```bash
# Verificar imports de ThemeContext
grep -r "from.*ThemeContext" src/

# Verificar imports de services/
grep -r "from.*services/" src/

# Verificar imports de ProtectedRoute mal ubicado
grep -r "from.*utils/ProtectedRoute" src/
grep -r "from.*components/PublicRoute" src/
grep -r "from.*components/common/ProtectedRoute" src/
```

---

## 5. Tailwind — agregar Google Fonts

Para usar las fuentes `Inter` y `Poppins` del nuevo `index.css`,
añadir en el `<head>` de `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
  rel="stylesheet"
/>
```

O si prefieres no depender de Google Fonts en producción,
elimina el `@import` al inicio del nuevo `index.css` y las fuentes
volverán a usar el stack del sistema (igual de limpio).

/******************************************************************************\******************************************************************************* \*/

# 🔄 GUÍA DE ACTUALIZACIÓN DE IMPORTS

Después de aplicar todos los cambios, actualiza estos imports en tu proyecto.

---

## 1. ThemeContext — nueva ubicación

**Buscar y reemplazar en todo el proyecto:**

```
// ANTES (incorrecto — apuntaba a components/)
import { useTheme } from './ThemeContext';
import { useTheme } from '../ThemeContext';
import { useTheme } from '@/components/ThemeContext';
import { ThemeProvider } from '@/components/ThemeContext';

// DESPUÉS (correcto)
import { useTheme }      from '@/context/ThemeContext';
import { ThemeProvider } from '@/context/ThemeContext';
```

**Archivos que necesitan el cambio:**

- `src/main.jsx` ✅ (ya actualizado)
- `src/components/common/ThemeToggle.jsx` ✅ (ya actualizado)
- `src/components/ThemeToggle.jsx` → actualizar (o eliminar este archivo)
- Cualquier otro componente que use `useTheme`

---

## 2. ProtectedRoute / PublicRoute — nueva ubicación

```
// ANTES
import ProtectedRoute from '@/utils/ProtectedRoute';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import PublicRoute    from '@/components/PublicRoute';

// DESPUÉS
import ProtectedRoute from '@/router/ProtectedRoute';
import PublicRoute    from '@/router/PublicRoute';
```

**Archivos que necesitan el cambio:**

- `src/router/AppRouter.jsx` → verificar imports

---

## 3. Servicios duplicados — unificar en api/

```
// ANTES (services/ — eliminar estos)
import { loginAdmin }  from '@/services/authService';
import { obtenerPerfil } from '@/services/profileService';

// DESPUÉS (api/ — usar estos)
import { loginAdmin }  from '@/api/auth';
import { getPerfil }   from '@/api/perfil';
```

---

## 4. Verificar con grep

Una vez hechos los cambios, verificar que no queden imports rotos:

```bash
# Verificar imports de ThemeContext
grep -r "from.*ThemeContext" src/

# Verificar imports de services/
grep -r "from.*services/" src/

# Verificar imports de ProtectedRoute mal ubicado
grep -r "from.*utils/ProtectedRoute" src/
grep -r "from.*components/PublicRoute" src/
grep -r "from.*components/common/ProtectedRoute" src/
```

---

## 5. Tailwind — agregar Google Fonts

Para usar las fuentes `Inter` y `Poppins` del nuevo `index.css`,
añadir en el `<head>` de `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
  rel="stylesheet"
/>
```

O si prefieres no depender de Google Fonts en producción,
elimina el `@import` al inicio del nuevo `index.css` y las fuentes
volverán a usar el stack del sistema (igual de limpio).
