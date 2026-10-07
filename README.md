# Manufactura dentro del inventario — MVP para PYMEs de alimentos

Prototipo funcional de una primera experiencia de manufactura para el módulo de inventario de SYNTHEX (escenario ficticio del reto *Product Owner Especialista en Inventario*).

- **Demo:** https://claude.ai/artifact/NuPVFBu3UpjvqDAK6eqQRA
- **Demo sin conexión:** abre `demo/demo-manufactura.html` en el navegador (doble clic).
- **Video:** [pegar aquí el link]
- **Autora:** [tu nombre]

---

## 1. Problema y a quién le resuelve

Muchas PYMEs de alimentos (panaderías, productores de snacks, etc.) compran insumos y venden productos terminados, pero la transformación de uno en otro la llevan en hojas de cálculo o cuadernos. Resultado: no saben cuánto les cuesta producir, descubren faltantes tarde y su inventario no refleja lo que realmente pasó.

**Usuario:** administrador o responsable de producción de una PYME de alimentos, sin conocimientos de manufactura industrial.

**Objetivo:** que pueda completar sin herramientas externas este recorrido:

> Configurar cómo se fabrica un producto → crear una orden → ver qué necesita y cuánto cuesta → validar existencias → ejecutar → actualizar el inventario → consultar qué ocurrió.

## 2. Cómo se conecta con el inventario (el núcleo de la propuesta)

La manufactura **no es un módulo paralelo**: vive dentro de Inventario (Productos · Movimientos · Producción) y usa los mismos productos y existencias.

```
Producto terminado existente  →  Estructura de fabricación  →  Orden de producción  →  Movimientos de inventario
   (ya está en Inventario)       (insumos + operaciones)       (calcula y valida)       (solo al confirmar)
```

Reglas clave:

1. No existe un catálogo paralelo: insumos y terminados son los productos del inventario.
2. La estructura se configura **desde el producto terminado** (botón *Configurar fabricación*).
3. Crear o editar una orden **no mueve inventario**. Solo al confirmar se generan: una salida por cada insumo y una entrada del producto terminado.
4. Cada movimiento queda ligado a la orden que lo originó.
5. La orden guarda una **copia de la estructura** usada, así editar la receta después no altera el historial.

## 3. Costos: cómo se calcula y se distribuye

Ejemplo real del demo — Brownie de chocolate, estructura base de 20 unidades, orden de 100 (escala ×5):

| Concepto | Cálculo | Valor |
|---|---|---:|
| Insumos | cantidad consumida × costo unitario de cada insumo | $147.750 |
| Operaciones | costo base × 5 | $80.000 |
| **Costo total** | insumos + operaciones | **$227.750** |
| **Costo unitario** | total ÷ 100 unidades | **$2.277,50** |

Distribución: insumos ≈ 65 %, operaciones ≈ 35 %.

**Transformación del inventario:** salen los insumos (con su valor), se suma el costo de las operaciones y entra el producto terminado a ese costo. Si ya había existencias del producto a otro costo, el costo unitario en inventario se recalcula con **promedio ponderado**.

## 4. Qué incluye la primera versión

- Estructura de fabricación con **cantidad base**, insumos y operaciones, editable en tablas.
- Escalado automático de consumos según la cantidad a producir.
- Validación de disponibilidad, indicando insumo, requerido, disponible y faltante.
- **Asistente de IA para faltantes** (ver sección 6).
- Costeo de materiales y operaciones, con distribución por concepto.
- Órdenes con estados **Pendiente → Ejecutada** y **Cancelada**.
- Ejecución con resumen *Antes → Después*, movimientos de inventario y actualización del costo del terminado.
- Trazabilidad por orden: producto, cantidad, estructura y versión, insumos, operaciones, costos, usuario y movimientos.
- Dos productos con estructura (Brownie, Galleta de avena) que **comparten insumos**, y un tercero (Granola) sin estructura para demostrar su creación.
- Registro manual de ingresos y filtros de movimientos.

## 5. Qué se dejó fuera (y por qué)

Lotes y vencimientos, mermas y desperdicios, MRP y compras automáticas, capacidad de máquinas y turnos, subproductos, múltiples niveles de producción, producción parcial y costeo contable industrial.

Motivo: no son indispensables para el escenario central y complicarían una primera versión pensada para PYMEs. Se evaluarían con necesidades reales de clientes.

**Supuestos explícitos**

- Una receta de un solo nivel (sin subensambles).
- El costo de las operaciones escala proporcionalmente a la cantidad producida.
- Costo del terminado = promedio ponderado.
- Los ingresos manuales suman cantidad pero no modifican el costo del insumo (el costo de compra se gestiona en el módulo existente).
- Se descuenta la cantidad teórica requerida (sin mermas).

## 6. Uso de la IA

**Para construir:** el prototipo se diseñó y generó con apoyo de IA (Figma Make para la primera versión y Claude para la lógica, los ajustes y la documentación).

**Dentro del producto:** *Asistente de faltantes.* Cuando una orden no se puede ejecutar:

- El **código calcula** todo lo numérico: faltantes, cantidad máxima producible y costo ajustado, para que sea exacto.
- La **IA explica y recomienda** en español sencillo, con tres opciones: producir solo lo posible, registrar el ingreso del insumo o dejar la orden pendiente.
- La persona decide; nada se ejecuta sin su confirmación.
- Si la IA no está disponible (por ejemplo, al abrir el demo en local), aparece una sugerencia generada por reglas con las mismas opciones. La experiencia no se rompe.

## 7. Cómo correrlo en tu computador

**Opción A — la más fácil (sin instalar nada):** abre el archivo `demo/demo-manufactura.html` con doble clic.

**Opción B — como desarrolladora:**

1. Instala [Node.js](https://nodejs.org) (versión LTS).
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta:

```bash
npm install      # descarga las dependencias (solo la primera vez)
npm run dev      # inicia el demo en http://localhost:5173
```

Otros comandos:

```bash
npm run build         # genera la versión de producción en /dist
npm run build:single  # genera un único archivo HTML en /dist-single
```

## 8. Guion de demo recomendado

1. Inventario → Productos → *Configurar fabricación* en Brownie.
2. Producción → orden OP-00025 (100 brownies): aparece el faltante de chocolate.
3. *Ver sugerencia* del asistente → registrar el ingreso.
4. Ejecutar → revisar resumen y costos → confirmar.
5. Trazabilidad: distribución del costo y transformación del inventario.
6. Inventario → Movimientos: 5 salidas y 1 entrada ligadas a la orden.

Botón **Reiniciar demo** (arriba a la derecha) para repetir el recorrido.

## 9. Estructura del código

```
src/
  manufacturing.ts   Lógica de negocio: tipos, cálculos de consumo y costo,
                     validaciones, reglas de inventario y reducer de estado.
  App.tsx            Pantallas: menú, productos, movimientos, producción,
                     estructuras, trazabilidad y asistente de faltantes.
  index.css          Estilos.
demo/                Demo en un solo archivo HTML.
```

Tecnología: React + TypeScript + Vite + Tailwind CSS. Todo el estado vive en un único *reducer*, por eso cualquier cambio se refleja a la vez en todas las pantallas.

## 10. Siguientes pasos

1. Lotes y vencimientos.
2. Mermas y consumo real vs. teórico.
3. Costos de compra de insumos y su efecto en el costo del terminado.
4. Producción parcial y órdenes programadas.
5. Alertas de stock mínimo y sugerencia de compras.

## 11. Nota

Ejercicio con escenario ficticio, sin fines comerciales. El diseño visual se inspira en la apariencia de herramientas de gestión existentes solo como referencia.
