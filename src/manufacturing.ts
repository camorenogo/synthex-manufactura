export type InventoryItem = {
  id: string
  name: string
  kind: "input" | "finished"
  stock: number
  unit: "kg" | "und"
  unitCost: number
}

export type StructureIngredient = {
  productId: string
  baseQuantity: number
}

export type StructureOperation = {
  id: string
  name: string
  estimatedTime: string
  baseCost: number
}

export type ManufacturingStructure = {
  id: string
  version: number
  productId: string
  baseQuantity: number
  ingredients: StructureIngredient[]
  operations: StructureOperation[]
}

export type OrderCosts = {
  materials: number
  operations: number
  total: number
  unit: number
}

export type ProductionOrder = {
  id: string
  productId: string
  quantity: number
  date: string
  user: string
  status: "Pendiente" | "Ejecutada" | "Cancelada"
  structureSnapshot: ManufacturingStructure
  costSnapshot?: OrderCosts
  movementIds: string[]
}

export type InventoryMovement = {
  id: string
  date: string
  productId: string
  type: "Entrada" | "Salida"
  quantity: number
  orderId: string
  before: number
  after: number
}

export type ManufacturingState = {
  inventory: InventoryItem[]
  structures: ManufacturingStructure[]
  orders: ProductionOrder[]
  movements: InventoryMovement[]
  nextOrderNumber: number
  changedProductIds: string[]
}

type CreateOrderAction = {
  type: "CREATE_ORDER"
  productId: string
  quantity: number
  date: string
}

type ExecuteOrderAction = {
  type: "EXECUTE_ORDER"
  orderId: string
  timestamp?: string
}

type AddIngredientAction = {
  type: "ADD_INGREDIENT"
  structureId: string
  ingredient: StructureIngredient
}

type AddOperationAction = {
  type: "ADD_OPERATION"
  structureId: string
  operation: StructureOperation
}

type CancelOrderAction = { type: "CANCEL_ORDER"; orderId: string }
type CreateStructureAction = { type: "CREATE_STRUCTURE"; productId: string; baseQuantity: number }
type UpdateStructureAction = { type: "UPDATE_STRUCTURE"; structureId: string; patch: Partial<Pick<ManufacturingStructure, "baseQuantity" | "ingredients" | "operations">> }
type SetQuantityAction = { type: "SET_ORDER_QUANTITY"; orderId: string; quantity: number }
type AddStockAction = { type: "ADD_STOCK"; productId: string; quantity: number; timestamp?: string }

export type ManufacturingAction = CancelOrderAction | CreateStructureAction | UpdateStructureAction | SetQuantityAction | AddStockAction | CreateOrderAction | ExecuteOrderAction | AddIngredientAction | AddOperationAction | {
  type: "CLEAR_HIGHLIGHTS"
} | { type: "RESET" }

const seedInventory: InventoryItem[] = [
  {
    id: "flour",
    name: "Harina",
    kind: "input",
    stock: 10,
    unit: "kg",
    unitCost: 4000,
  },
  {
    id: "sugar",
    name: "Azúcar",
    kind: "input",
    stock: 4,
    unit: "kg",
    unitCost: 3500,
  },
  {
    id: "chocolate",
    name: "Chocolate",
    kind: "input",
    stock: 1.5,
    unit: "kg",
    unitCost: 18000,
  },
  {
    id: "eggs",
    name: "Huevos",
    kind: "input",
    stock: 150,
    unit: "und",
    unitCost: 500,
  },
  {
    id: "butter",
    name: "Mantequilla",
    kind: "input",
    stock: 3,
    unit: "kg",
    unitCost: 16000,
  },
  { id: "oats", name: "Avena", kind: "input", stock: 6, unit: "kg", unitCost: 6000 },
  { id: "honey", name: "Miel", kind: "input", stock: 5, unit: "kg", unitCost: 12000 },
  { id: "cookie", name: "Galleta de avena", kind: "finished", stock: 0, unit: "und", unitCost: 0 },
  { id: "granola", name: "Granola artesanal", kind: "finished", stock: 0, unit: "und", unitCost: 0 },
  {
    id: "brownie",
    name: "Brownie de chocolate",
    kind: "finished",
    stock: 0,
    unit: "und",
    unitCost: 0,
  },
]

const brownieStructure: ManufacturingStructure = {
  id: "EST-001",
  version: 3,
  productId: "brownie",
  baseQuantity: 20,
  ingredients: [
    { productId: "flour", baseQuantity: 1 },
    { productId: "sugar", baseQuantity: 0.5 },
    { productId: "chocolate", baseQuantity: 0.5 },
    { productId: "eggs", baseQuantity: 20 },
    { productId: "butter", baseQuantity: 0.3 },
  ],
  operations: [
    {
      id: "mix",
      name: "Preparar mezcla",
      estimatedTime: "35 min",
      baseCost: 5000,
    },
    {
      id: "bake",
      name: "Hornear",
      estimatedTime: "45 min",
      baseCost: 8000,
    },
    {
      id: "pack",
      name: "Enfriar y empacar",
      estimatedTime: "50 min",
      baseCost: 3000,
    },
  ],
}

const cookieStructure: ManufacturingStructure = {
  id: "EST-002",
  version: 1,
  productId: "cookie",
  baseQuantity: 50,
  ingredients: [
    { productId: "oats", baseQuantity: 1.5 },
    { productId: "flour", baseQuantity: 1 },
    { productId: "sugar", baseQuantity: 0.4 },
    { productId: "butter", baseQuantity: 0.5 },
    { productId: "eggs", baseQuantity: 5 },
  ],
  operations: [
    { id: "mix", name: "Mezclar masa", estimatedTime: "25 min", baseCost: 4000 },
    { id: "bake", name: "Hornear", estimatedTime: "20 min", baseCost: 6000 },
    { id: "pack", name: "Empacar", estimatedTime: "30 min", baseCost: 2000 },
  ],
}

export function cloneStructure(
  structure: ManufacturingStructure,
): ManufacturingStructure {
  return {
    ...structure,
    ingredients: structure.ingredients.map((ingredient) => ({
      ...ingredient,
    })),
    operations: structure.operations.map((operation) => ({ ...operation })),
  }
}

export function requiredConsumption(
  baseConsumption: number,
  quantityToProduce: number,
  baseQuantity: number,
) {
  return baseConsumption * (quantityToProduce / baseQuantity)
}

export function getRequiredIngredients(
  structure: ManufacturingStructure,
  quantity: number,
) {
  return structure.ingredients.map((ingredient) => ({
    productId: ingredient.productId,
    quantity: requiredConsumption(
      ingredient.baseQuantity,
      quantity,
      structure.baseQuantity,
    ),
  }))
}

export function calculateOrderCosts(
  structure: ManufacturingStructure,
  quantity: number,
  inventory: InventoryItem[],
): OrderCosts {
  const ratio = quantity / structure.baseQuantity
  const materials = getRequiredIngredients(structure, quantity).reduce(
    (sum, required) => {
      const product = inventory.find((item) => item.id === required.productId)
      return sum + required.quantity * (product?.unitCost ?? 0)
    },
    0,
  )
  const operations = structure.operations.reduce(
    (sum, operation) => sum + operation.baseCost * ratio,
    0,
  )
  const total = materials + operations
  return {
    materials,
    operations,
    total,
    unit: quantity > 0 ? total / quantity : 0,
  }
}

export function getAvailability(
  order: ProductionOrder,
  inventory: InventoryItem[],
) {
  return getRequiredIngredients(order.structureSnapshot, order.quantity).map(
    (required) => {
      const product = inventory.find((item) => item.id === required.productId)
      const available = product?.stock ?? 0
      return {
        ...required,
        product,
        available,
        missing: Math.max(0, required.quantity - available),
        sufficient: available >= required.quantity,
      }
    },
  )
}

export function getInventoryProjection(
  order: ProductionOrder,
  inventory: InventoryItem[],
) {
  const consumed = getRequiredIngredients(
    order.structureSnapshot,
    order.quantity,
  ).map((required) => {
    const product = inventory.find((item) => item.id === required.productId)!
    return {
      product,
      type: "Salida" as const,
      quantity: required.quantity,
      before: product.stock,
      after: product.stock - required.quantity,
    }
  })
  const finished = inventory.find((item) => item.id === order.productId)!
  return [
    ...consumed,
    {
      product: finished,
      type: "Entrada" as const,
      quantity: order.quantity,
      before: finished.stock,
      after: finished.stock + order.quantity,
    },
  ]
}

export function statusClass(status: string) {
  return status === "Ejecutada" ? "done" : status === "Cancelada" ? "alert" : "ready"
}

export function formatCOP(value: number, forceDecimals = false) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: forceDecimals ? 2 : 0,
    maximumFractionDigits: forceDecimals ? 2 : 0,
  }).format(value)
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value)
}

export function orderNumber(number: number) {
  return `OP-${String(number).padStart(5, "0")}`
}

export function createInitialState(): ManufacturingState {
  const structures = [cloneStructure(brownieStructure), cloneStructure(cookieStructure)]
  const mk = (id: string, productId: string, quantity: number, date: string, status: ProductionOrder["status"]): ProductionOrder => ({
    id, productId, quantity, date, user: "Camila Moreno", status,
    structureSnapshot: cloneStructure(structures.find((s) => s.productId === productId)!),
    movementIds: [],
  })
  return {
    inventory: seedInventory.map((item) => ({ ...item })),
    structures,
    orders: [
      mk("OP-00026", "cookie", 100, "2026-10-16", "Pendiente"),
      mk("OP-00025", "brownie", 100, "2026-10-15", "Pendiente"),
      mk("OP-00024", "brownie", 40, "2026-10-10", "Cancelada"),
    ],
    movements: [],
    nextOrderNumber: 27,
    changedProductIds: [],
  }
}

export function manufacturingReducer(
  state: ManufacturingState,
  action: ManufacturingAction,
): ManufacturingState {
  if (action.type === "RESET") return createInitialState()
  if (action.type === "CLEAR_HIGHLIGHTS") {
    return { ...state, changedProductIds: [] }
  }
  if (action.type === "SET_ORDER_QUANTITY") {
    return {
      ...state,
      orders: state.orders.map((o) =>
        o.id === action.orderId && o.status === "Pendiente"
          ? { ...o, quantity: action.quantity }
          : o,
      ),
    }
  }
  if (action.type === "ADD_STOCK") {
    const item = state.inventory.find((i) => i.id === action.productId)
    if (!item || action.quantity <= 0) return state
    const mov: InventoryMovement = {
      id: `MOV-${state.movements.length + 1}`,
      date: action.timestamp ?? new Date().toISOString(),
      productId: item.id,
      type: "Entrada",
      quantity: action.quantity,
      orderId: "Ingreso manual",
      before: item.stock,
      after: item.stock + action.quantity,
    }
    return {
      ...state,
      inventory: state.inventory.map((i) =>
        i.id === item.id ? { ...i, stock: i.stock + action.quantity } : i,
      ),
      movements: [mov, ...state.movements],
      changedProductIds: [item.id],
    }
  }
  if (action.type === "CANCEL_ORDER") {
    return { ...state, orders: state.orders.map((o) => (o.id === action.orderId && o.status === "Pendiente" ? { ...o, status: "Cancelada" as const } : o)) }
  }
  if (action.type === "CREATE_STRUCTURE") {
    const s: ManufacturingStructure = { id: `EST-${String(state.structures.length + 1).padStart(3, "0")}`, version: 1, productId: action.productId, baseQuantity: action.baseQuantity, ingredients: [], operations: [] }
    return { ...state, structures: [...state.structures, s] }
  }
  if (action.type === "UPDATE_STRUCTURE") {
    return { ...state, structures: state.structures.map((s) => (s.id === action.structureId ? { ...s, ...action.patch, version: s.version + 1 } : s)) }
  }
  if (action.type === "CREATE_ORDER") {
    const structure = state.structures.find((s) => s.productId === action.productId) ?? state.structures[0]
    const order: ProductionOrder = {
      id: orderNumber(state.nextOrderNumber),
      productId: structure.productId,
      quantity: action.quantity,
      date: action.date,
      user: "Camila Moreno",
      status: "Pendiente",
      structureSnapshot: cloneStructure(structure),
      movementIds: [],
    }
    return {
      ...state,
      orders: [order, ...state.orders],
      nextOrderNumber: state.nextOrderNumber + 1,
    }
  }
  if (action.type === "ADD_INGREDIENT") {
    return {
      ...state,
      structures: state.structures.map((structure) =>
        structure.id === action.structureId
          ? {
              ...structure,
              version: structure.version + 1,
              ingredients: [...structure.ingredients, { ...action.ingredient }],
            }
          : structure,
      ),
    }
  }
  if (action.type === "ADD_OPERATION") {
    return {
      ...state,
      structures: state.structures.map((structure) =>
        structure.id === action.structureId
          ? {
              ...structure,
              version: structure.version + 1,
              operations: [...structure.operations, { ...action.operation }],
            }
          : structure,
      ),
    }
  }
  if (action.type === "EXECUTE_ORDER") {
    const order = state.orders.find((item) => item.id === action.orderId)
    if (!order || order.status !== "Pendiente") return state
    const availability = getAvailability(order, state.inventory)
    if (availability.some((item) => !item.sufficient)) return state

    const projection = getInventoryProjection(order, state.inventory)
    const timestamp = action.timestamp ?? new Date().toISOString()
    const movementIds = projection.map(
      (_, index) => `MOV-${state.movements.length + index + 1}`,
    )
    const newMovements = projection.map((row, index) => ({
      id: movementIds[index],
      date: timestamp,
      productId: row.product.id,
      type: row.type,
      quantity: row.quantity,
      orderId: order.id,
      before: row.before,
      after: row.after,
    }))
    const stockByProduct = new Map(
      projection.map((row) => [row.product.id, row.after]),
    )
    const costs = calculateOrderCosts(
      order.structureSnapshot,
      order.quantity,
      state.inventory,
    )
    return {
      ...state,
      inventory: state.inventory.map((item) =>
        item.id === order.productId
          ? {
              ...item,
              stock: stockByProduct.get(item.id)!,
              // costo promedio ponderado: existencia previa + lo recién fabricado
              unitCost:
                (item.stock * item.unitCost + order.quantity * costs.unit) /
                (item.stock + order.quantity),
            }
          : stockByProduct.has(item.id)
            ? { ...item, stock: stockByProduct.get(item.id)! }
            : item,
      ),
      orders: state.orders.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: "Ejecutada",
              costSnapshot: { ...costs },
              movementIds,
            }
          : item,
      ),
      movements: [...newMovements, ...state.movements],
      changedProductIds: projection.map((row) => row.product.id),
    }
  }
  return state
}


export function getShortageAnalysis(order: ProductionOrder, inventory: InventoryItem[]) {
  const s = order.structureSnapshot
  const rows = getAvailability(order, inventory)
  const shortages = rows
    .filter((r) => !r.sufficient)
    .map((r) => ({
      productId: r.productId,
      name: r.product?.name ?? r.productId,
      unit: r.product?.unit ?? "",
      required: r.quantity,
      available: r.available,
      missing: r.missing,
    }))
  const perUnit = s.ingredients.map((i) => ({
    productId: i.productId,
    perUnit: i.baseQuantity / s.baseQuantity,
  }))
  const maxProducible = Math.floor(
    Math.min(
      ...perUnit.map((p) => {
        const stock = inventory.find((i) => i.id === p.productId)?.stock ?? 0
        return stock / p.perUnit
      }),
    ) + 1e-9,
  )
  const limiting = shortages.length
    ? shortages.reduce((a, b) => (a.available / a.required < b.available / b.required ? a : b))
    : null
  const adjustedCosts = calculateOrderCosts(s, maxProducible, inventory)
  return { shortages, maxProducible, limiting, adjustedCosts, requested: order.quantity }
}

export type ShortageAdvice = {
  diagnostico: string
  opciones: { titulo: string; descripcion: string; accion: "reducir_cantidad" | "registrar_ingreso" | "guardar_borrador" }[]
  recomendada: string
}

export function ruleBasedAdvice(a: ReturnType<typeof getShortageAnalysis>): ShortageAdvice {
  const l = a.limiting
  const falta = a.shortages.map((x) => `${formatQuantity(x.missing)} ${x.unit} de ${x.name.toLowerCase()}`).join(" y ")
  return {
    diagnostico: l
      ? `Te falta ${falta} para producir ${a.requested} unidades. Con lo que tienes puedes hacer hasta ${a.maxProducible}.`
      : "Hay existencias suficientes.",
    opciones: [
      { titulo: `Producir solo ${a.maxProducible} unidades`, descripcion: `Ajusta la orden al máximo posible. Costo: ${formatCOP(a.adjustedCosts.total)}.`, accion: "reducir_cantidad" },
      { titulo: "Registrar ingreso del faltante", descripcion: `Suma ${falta} al inventario y mantén las ${a.requested} unidades.`, accion: "registrar_ingreso" },
      { titulo: "Dejar la orden pendiente", descripcion: "No cambia nada; la completas cuando llegue el insumo.", accion: "guardar_borrador" },
    ],
    recomendada: a.maxProducible > 0
      ? "Si necesitas entregar hoy, produce lo posible; si puedes esperar el insumo, registra el ingreso."
      : "Registra el ingreso del faltante: hoy no alcanza para producir ninguna unidad.",
  }
}
