import { useEffect, useReducer, useState } from "react"
import {
  calculateOrderCosts,
  createInitialState,
  formatCOP,
  formatQuantity,
  getAvailability,
  getInventoryProjection,
  getRequiredIngredients,
  getShortageAnalysis,
  statusClass,
  ruleBasedAdvice,
  type InventoryItem,
  type ShortageAdvice,
  manufacturingReducer,
  orderNumber,
  type InventoryMovement,
  type ManufacturingAction,
  type ManufacturingState,
  type ProductionOrder,
} from "./manufacturing"

type IconName = "archive" | "box" | "calendar" | "check" | "chevron" | "clipboard" | "clock" | "close" | "cube" | "dollar" | "dots" | "factory" | "home" | "layers" | "menu" | "plus" | "refresh" | "search" | "settings" | "users" | "warning"

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-6h6v6" />
      </>
    ),
    archive: (
      <>
        <path d="M4 7v13h16V7" />
        <path d="M3 3h18v4H3zM9 11h6" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7M12 11v10" />
      </>
    ),
    factory: (
      <>
        <path d="M3 21V9l6 3V9l6 3V4h4v17" />
        <path d="M3 21h18M7 17h2M13 17h2" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5L9 6a8 8 0 0 0-1.7 1L5 6 3 9.5 5 11a7 7 0 0 0 0 2l-2 1.5L5 18l2.4-1a8 8 0 0 0 1.7 1l.4 3h5l.4-3a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M19 12a7 7 0 1 0-2 5" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    warning: (
      <>
        <path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.75 3h15.7a2 2 0 0 0 1.75-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    cube: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
        <path d="m3 7 9 5 9-5M12 12v10" />
      </>
    ),
    dollar: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M16 8.5c-.7-1-1.8-1.5-3.5-1.5-2 0-3.5 1-3.5 2.5 0 4 7 1.5 7 5.5 0 1.3-1.4 2-3.5 2-1.8 0-3-.6-3.7-1.6M12 5v14" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    dots: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  }
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

type View = "production" | "inventory" | "movements" | "trace"

export default function App() {
  const [state, dispatch] = useReducer(
    manufacturingReducer,
    undefined,
    createInitialState,
  )
  const [view, setView] = useState<View>("production")
  const [productionTab, setProductionTab] = useState<"orders" | "structures">(
    "orders",
  )
  const [selectedOrderId, setSelectedOrderId] = useState("OP-00026")
  const [showCreate, setShowCreate] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)
  const [successProjection, setSuccessProjection] =
    useState<ReturnType<typeof getInventoryProjection>>([])
  const [newQuantity, setNewQuantity] = useState(20)
  const [newProductId, setNewProductId] = useState("brownie")
  const [toast, setToast] = useState("")
  const [structureFocus, setStructureFocus] = useState("")

  const selectedOrder =
    state.orders.find((order) => order.id === selectedOrderId) ??
    state.orders[0]
  const selectedCosts = calculateOrderCosts(
    selectedOrder.structureSnapshot,
    selectedOrder.quantity,
    state.inventory,
  )
  const availability = getAvailability(selectedOrder, state.inventory)
  const canExecute =
    selectedOrder.status === "Pendiente" &&
    availability.every((item) => item.sufficient)
  const selectedProduct = state.inventory.find(
    (item) => item.id === selectedOrder.productId,
  )!

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 3000)
  }

  function openStructure(productId: string) {
    if (!state.structures.some((s) => s.productId === productId))
      dispatch({ type: "CREATE_STRUCTURE", productId, baseQuantity: 20 })
    setStructureFocus(productId)
    setProductionTab("structures")
    setView("production")
  }

  function navigate(nextView: View) {
    setStructureFocus("")
    setView(nextView)
    if (nextView === "production") setProductionTab("orders")
  }

  function createOrder() {
    const id = orderNumber(state.nextOrderNumber)
    dispatch({
      type: "CREATE_ORDER",
      quantity: newQuantity,
      productId: newProductId,
      date: "2026-10-15",
    })
    setSelectedOrderId(id)
    setShowCreate(false)
    notify(`Orden ${id} creada sin movimientos de inventario`)
    
  }

  function executeOrder() {
    const projection = getInventoryProjection(selectedOrder, state.inventory)
    setSuccessProjection(projection)
    dispatch({ type: "EXECUTE_ORDER", orderId: selectedOrder.id })
    setShowConfirm(false)
    setSuccessOrderId(selectedOrder.id)
  }

  function openTrace(orderId: string) {
    setSelectedOrderId(orderId)
    setView("trace")
  }

  function resetDemo() {
    dispatch({ type: "RESET" })
    setSelectedOrderId("OP-00026")
    setView("production")
    setProductionTab("orders")
    setSuccessOrderId(null)
    setShowConfirm(false)
    notify("Datos de demo reiniciados")
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} navigate={navigate} />
      <main className="main">
        <Topbar resetDemo={resetDemo} />
        {view === "production" && (
          <ProductionView
            state={state}
            dispatch={dispatch}
            productionTab={productionTab}
            setProductionTab={setProductionTab}
            selectedOrder={selectedOrder}
            selectedOrderId={selectedOrderId}
            setSelectedOrderId={setSelectedOrderId}
            selectedCosts={selectedCosts}
            availability={availability}
            canExecute={canExecute}
            selectedProductName={selectedProduct.name}
            openCreate={() => setShowCreate(true)}
            openConfirm={() => setShowConfirm(true)}
            openTrace={openTrace}
            structureFocus={structureFocus}
          />
        )}
        {(view === "inventory" || view === "movements") && (
          <InventoryView section={view} state={state} dispatch={dispatch} openTrace={openTrace} onConfigure={openStructure} />
        )}
        {view === "trace" && (
          <TraceView
            state={state}
            order={selectedOrder}
            back={() => navigate("production")}
          />
        )}
      </main>

      {showCreate && (
        <CreateOrderModal
          state={state}
          quantity={newQuantity}
          setQuantity={setNewQuantity}
          productId={newProductId}
          setProductId={setNewProductId}
          close={() => setShowCreate(false)}
          create={createOrder}
        />
      )}
      {showConfirm && (
        <ConfirmModal
          order={selectedOrder}
          state={state}
          close={() => setShowConfirm(false)}
          confirm={executeOrder}
        />
      )}
      {successOrderId && (
        <SuccessModal
          orderId={successOrderId}
          projection={successProjection}
          close={() => setSuccessOrderId(null)}
          seeInventory={() => {
            setSuccessOrderId(null)
            navigate("inventory")
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <span>
            <Icon name="check" size={15} />
          </span>
          {toast}
        </div>
      )}
    </div>
  )
}

function Sidebar({
  view,
  navigate,
}: {
  view: View
  navigate: (view: View) => void
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>SYNTHEX</span>
        <button className="icon-btn collapse" aria-label="Contraer menú">
          <Icon name="menu" size={19} />
        </button>
      </div>
      <nav className="main-nav" aria-label="Navegación principal">
        <a href="#inicio">
          <Icon name="home" />
          <span>Inicio</span>
        </a>
        <a href="#bandeja">
          <Icon name="archive" />
          <span>Bandeja de entrada</span>
          <small>1</small>
        </a>
        <div className="nav-separator" />
        <a href="#ingresos">
          <Icon name="dollar" />
          <span>Ingresos</span>
          <Icon name="chevron" size={14} />
        </a>
        <a href="#gastos">
          <Icon name="dollar" />
          <span>Gastos</span>
          <Icon name="chevron" size={14} />
        </a>
        <a href="#contactos">
          <Icon name="users" />
          <span>Contactos</span>
        </a>
        <a className={view === "inventory" || view === "movements" || view === "production" || view === "trace" ? "active" : ""} href="#inventario" onClick={(event) => { event.preventDefault(); navigate("inventory") }}>
          <Icon name="box" />
          <span>Inventario</span>
          <Icon name="chevron" size={14} />
        </a>
        <div className="sub-nav">
          {([["inventory", "Productos"], ["movements", "Movimientos"], ["production", "Producción"]] as const).map(([v, label]) => (
            <a key={v} className={view === v || (v === "production" && view === "trace") ? "sub-active" : ""} href={`#${v}`} onClick={(event) => { event.preventDefault(); navigate(v) }}>
              <span>{label}</span>
            </a>
          ))}
        </div>
        <a href="#bancos">
          <Icon name="archive" />
          <span>Bancos</span>
          <Icon name="chevron" size={14} />
        </a>
        <a href="#contabilidad">
          <Icon name="clipboard" />
          <span>Contabilidad</span>
          <Icon name="chevron" size={14} />
        </a>
        <a href="#reportes">
          <Icon name="layers" />
          <span>Reportes</span>
        </a>
        <a href="#configuracion">
          <Icon name="settings" />
          <span>Configuración</span>
        </a>
        <p className="nav-label">Descubre más soluciones</p>
        <a href="#nomina">
          <Icon name="users" />
          <span>Nómina</span>
        </a>
        <a href="#pos">
          <Icon name="archive" />
          <span>POS</span>
        </a>
      </nav>
    </aside>
  )
}

function Topbar({ resetDemo }: { resetDemo: () => void }) {
  return (
    <header className="topbar">
      <div className="search">
        <Icon name="search" size={17} />
        <input aria-label="Buscar" placeholder="Buscar" />
      </div>
      <div className="top-actions">
        <button className="reset-demo" onClick={resetDemo}>
          <Icon name="refresh" size={14} />
          Reiniciar datos de demo
        </button>
        <button className="help-btn">?</button>
        <button className="apps-btn" aria-label="Aplicaciones">
          {Array.from({ length: 9 }).map((_, index) => (
            <i key={index} />
          ))}
        </button>
        <button className="top-profile">
          <span className="avatar">CM</span>
          <strong>Camila Moreno</strong>
          <Icon name="chevron" size={14} />
        </button>
      </div>
    </header>
  )
}

type Availability = ReturnType<typeof getAvailability>

function ProductionView({
  state,
  dispatch,
  productionTab,
  setProductionTab,
  selectedOrder,
  selectedOrderId,
  setSelectedOrderId,
  selectedCosts,
  availability,
  canExecute,
  selectedProductName,
  openCreate,
  openConfirm,
  openTrace,
  structureFocus,
}: {
  structureFocus: string
  state: ManufacturingState
  dispatch: React.Dispatch<ManufacturingAction>
  productionTab: "orders" | "structures"
  setProductionTab: (tab: "orders" | "structures") => void
  selectedOrder: ProductionOrder
  selectedOrderId: string
  setSelectedOrderId: (id: string) => void
  selectedCosts: ReturnType<typeof calculateOrderCosts>
  availability: Availability
  canExecute: boolean
  selectedProductName: string
  openCreate: () => void
  openConfirm: () => void
  openTrace: (id: string) => void
}) {
  const finishedStock = state.inventory.filter((i) => i.kind === "finished").reduce((s, i) => s + i.stock, 0)
  const nameOf = (id: string) => state.inventory.find((i) => i.id === id)?.name ?? id
  const executedCount = state.orders.filter(
    (order) => order.status === "Ejecutada",
  ).length
  return (
    <div className="content">
      <section className="page-heading">
        <div>
          <h1>Producción</h1>
          <p>
            Administra lo que fabricas y su impacto en inventario.{" "}
            <button className="learn-more">Ver más</button>
          </p>
        </div>
        <button className="primary-btn" onClick={openCreate}>
          <Icon name="plus" size={17} />
          Nueva orden
        </button>
      </section>
      <div className="tabs">
        <button
          className={productionTab === "orders" ? "active" : ""}
          onClick={() => setProductionTab("orders")}
        >
          Órdenes de producción
        </button>
        <button
          className={productionTab === "structures" ? "active" : ""}
          onClick={() => setProductionTab("structures")}
        >
          Estructuras de fabricación
        </button>
      </div>
      {productionTab === "structures" ? (
        <StructuresView state={state} dispatch={dispatch} focus={structureFocus} />
      ) : (
        <>
          <section className="stats-grid">
            <Stat
              icon="clipboard"
              tone="lilac"
              label="Total de órdenes"
              value={String(state.orders.length)}
              note={`Siguiente: ${orderNumber(state.nextOrderNumber)}`}
            />
            <Stat
              icon="clock"
              tone="amber"
              label="Pendientes"
              value={String(state.orders.length - executedCount)}
              note="Validación en tiempo real"
            />
            <Stat
              icon="check"
              tone="green"
              label="Órdenes ejecutadas"
              value={String(executedCount)}
              note="Con movimientos generados"
            />
            <Stat
              icon="box"
              tone="blue"
              label="Producto terminado en inventario"
              value={`${formatQuantity(finishedStock)} und`}
              note="Existencia compartida"
            />
          </section>
          <section className="workspace">
            <div className="order-list">
              <div className="panel-title">
                <div>
                  <h2>Todas las órdenes</h2>
                  <p>Los valores se calculan desde su estructura guardada.</p>
                </div>
                <span className="live-state">
                  <i />
                  Estado sincronizado
                </span>
              </div>
              <div className="table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ORDEN</th>
                      <th>PRODUCTO</th>
                      <th>FECHA</th>
                      <th>CANTIDAD</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.orders.map((order) => (
                      <tr
                        className={
                          selectedOrderId === order.id ? "selected" : ""
                        }
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td>
                          <strong>{order.id}</strong>
                        </td>
                        <td>
                          <div className="product-cell">
                            <span className={`product-thumb ${order.productId}`} />
                            {nameOf(order.productId)}
                          </div>
                        </td>
                        <td>{formatDate(order.date)}</td>
                        <td>{formatQuantity(order.quantity)} und</td>
                        <td>
                          <span
                            className={`status ${
                              statusClass(order.status)
                            }`}
                          >
                            <i />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <aside className="order-detail">
              <div className="detail-head">
                <div>
                  <span>DETALLE DE LA ORDEN</span>
                  <h2>{selectedOrder.id}</h2>
                </div>
                {selectedOrder.status === "Ejecutada" && (
                  <button
                    className="trace-link"
                    onClick={() => openTrace(selectedOrder.id)}
                  >
                    Ver trazabilidad
                  </button>
                )}
              </div>
              <div className="detail-product">
                <span className={`large-product ${selectedOrder.productId}`} />
                <div>
                  <small>PRODUCTO A FABRICAR</small>
                  <strong>{selectedProductName}</strong>
                  <span>{formatQuantity(selectedOrder.quantity)} unidades</span>
                </div>
              </div>
              <div className="detail-meta">
                <div>
                  <Icon name="calendar" />
                  <span>
                    Fecha
                    <strong>{formatDate(selectedOrder.date)}</strong>
                  </span>
                </div>
                <div>
                  <Icon name="layers" />
                  <span>
                    Estructura guardada
                    <strong>
                      {selectedOrder.structureSnapshot.id} · Versión{" "}
                      {selectedOrder.structureSnapshot.version}
                    </strong>
                  </span>
                </div>
              </div>
              
              {selectedOrder.status === "Pendiente" && <AvailabilityBanner availability={availability} />}
              {selectedOrder.status === "Pendiente" && !canExecute && (
                <ShortageAssistant productName={nameOf(selectedOrder.productId)} order={selectedOrder} inventory={state.inventory} dispatch={dispatch} />
              )}
              <div className="section-label">
                <span>INSUMOS REQUERIDOS</span>
                <span>Requerido / Disponible</span>
              </div>
              <div className="ingredient-list">
                {availability.map((row) => (
                  <div className="ingredient" key={row.productId}>
                    <span>{row.product?.name}</span>
                    <div>
                      <strong>
                        {formatQuantity(row.quantity)} {row.product?.unit}
                      </strong>
                      <small>
                        de {formatQuantity(row.available)} {row.product?.unit}
                      </small>
                    </div>
                    <i className={row.sufficient ? "ok" : "not-ok"}>
                      <Icon
                        name={row.sufficient ? "check" : "warning"}
                        size={13}
                      />
                    </i>
                  </div>
                ))}
              </div>
              <div className="cost-summary">
                <div>
                  <span>Insumos</span>
                  <strong>{formatCOP(selectedCosts.materials)}</strong>
                </div>
                <div>
                  <span>Operaciones</span>
                  <strong>{formatCOP(selectedCosts.operations)}</strong>
                </div>
                <div className="total">
                  <span>
                    Costo total
                    <small>
                      {formatCOP(selectedCosts.unit, true)} por unidad
                    </small>
                  </span>
                  <strong>{formatCOP(selectedCosts.total)}</strong>
                </div>
              </div>
              <button
                className="execute-btn"
                disabled={!canExecute}
                onClick={openConfirm}
              >
                <Icon
                  name={
                    selectedOrder.status === "Ejecutada" ? "check" : "factory"
                  }
                  size={18}
                />
                {selectedOrder.status === "Ejecutada"
                  ? "Producción ejecutada"
                  : selectedOrder.status === "Cancelada" ? "Orden cancelada"
                  : canExecute
                    ? "Ejecutar producción"
                    : "Existencias insuficientes"}
              </button>
              {selectedOrder.status === "Pendiente" && (
                <button className="secondary-btn" style={{ width: "100%", marginTop: 8 }} onClick={() => dispatch({ type: "CANCEL_ORDER", orderId: selectedOrder.id })}>Cancelar orden</button>
              )}
              <p className="inventory-note">
                <Icon name="archive" size={14} />
                El inventario cambia únicamente al confirmar.
              </p>
            </aside>
          </section>
        </>
      )}
    </div>
  )
}

function ShortageAssistant({ productName, order, inventory, dispatch }: { productName: string; order: ProductionOrder; inventory: InventoryItem[]; dispatch: React.Dispatch<ManufacturingAction> }) {
  const analysis = getShortageAnalysis(order, inventory)
  const [advice, setAdvice] = useState<ShortageAdvice | null>(null)
  const [loading, setLoading] = useState(false)
  const [byAI, setByAI] = useState(false)
  const key = order.id + order.quantity + analysis.shortages.map((s) => s.productId + s.missing).join()
  useEffect(() => { setAdvice(null) }, [key])

  async function ask() {
    setLoading(true)
    const fallback = ruleBasedAdvice(analysis)
    try {
      const sample = await (window as any).claude?.use("sample")
      if (!sample) throw new Error("no-ai")
      const data = { producto: productName, cantidadPedida: analysis.requested, faltantes: analysis.shortages, maximoProducible: analysis.maxProducible, costoAjustado: Math.round(analysis.adjustedCosts.total) }
      const res = await sample.json(
        `Eres el asistente de producción de una PYME de alimentos. Responde SIEMPRE en español (Colombia), sin anglicismos. Con estos datos YA CALCULADOS: ${JSON.stringify(data)}. Responde SOLO JSON: {"diagnostico": string (1-2 frases simples), "opciones": [{"titulo": string, "descripcion": string corta, "accion": "reducir_cantidad"|"registrar_ingreso"|"guardar_borrador"}] (exactamente 3, una por acción), "recomendada": string (cuál sugieres y por qué, 1 frase)}. Tono directo, sin tecnicismos. No inventes números: usa solo los dados. No propongas ejecutar nada.`,
        { modelTier: "quick" },
      ) as ShortageAdvice
      if (!res?.opciones?.length) throw new Error("bad")
      setAdvice(res); setByAI(true)
    } catch {
      setAdvice(fallback); setByAI(false)
    }
    setLoading(false)
  }

  function apply(accion: string) {
    if (accion === "reducir_cantidad" && analysis.maxProducible > 0)
      dispatch({ type: "SET_ORDER_QUANTITY", orderId: order.id, quantity: analysis.maxProducible })
    if (accion === "registrar_ingreso")
      analysis.shortages.forEach((s) => dispatch({ type: "ADD_STOCK", productId: s.productId, quantity: Math.round(s.missing * 1000) / 1000 }))
  }

  return (
    <div className="ai-box">
      <div className="ai-head"><strong>Asistente de faltantes</strong>{advice && <em>{byAI ? "Sugerencia generada con IA" : "Sugerencia por reglas"}</em>}</div>
      {!advice && !loading && <button className="ai-ask" onClick={ask}>Ver sugerencia</button>}
      {loading && <p className="ai-note">Analizando tus existencias…</p>}
      {advice && (
        <>
          <p className="ai-diag">{advice.diagnostico}</p>
          {advice.opciones.map((o) => (
            <button key={o.accion} className="ai-opt" onClick={() => apply(o.accion)}>
              <strong>{o.titulo}</strong><span>{o.descripcion}</span>
            </button>
          ))}
          <p className="ai-note"><b>Recomendación:</b> {advice.recomendada}</p>
          <p className="ai-note">Tú decides: nada se ejecuta sin tu confirmación.</p>
        </>
      )}
    </div>
  )
}

function Stat({
  icon,
  tone,
  label,
  value,
  note,
}: {
  icon: IconName
  tone: string
  label: string
  value: string
  note: string
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

function AvailabilityBanner({ availability }: { availability: Availability }) {
  const missing = availability.filter((row) => !row.sufficient)
  if (!missing.length) {
    return (
      <div className="availability-banner">
        <Icon name="check" />
        <div>
          <strong>Insumos disponibles</strong>
          <span>Puedes ejecutar esta producción.</span>
        </div>
      </div>
    )
  }
  return (
    <div className="availability-banner danger">
      <Icon name="warning" />
      <div>
        <strong>No es posible ejecutar la producción</strong>
        <span>
          {missing
            .map(
              (row) =>
                `${row.product?.name}: faltan ${formatQuantity(row.missing)} ${row.product?.unit}`,
            )
            .join(" · ")}
        </span>
      </div>
    </div>
  )
}

function InventoryView({ section, state, dispatch, openTrace, onConfigure }: {
  section: View
  state: ManufacturingState
  dispatch: React.Dispatch<ManufacturingAction>
  openTrace: (id: string) => void
  onConfigure: (productId: string) => void
}) {
  const [kind, setKind] = useState<"all" | "input" | "finished">("all")
  const [origin, setOrigin] = useState<"all" | "prod" | "manual">("all")
  const [showEntry, setShowEntry] = useState(false)
  const [entryId, setEntryId] = useState("")
  const [entryQty, setEntryQty] = useState(1)
  useEffect(() => {
    if (!state.changedProductIds.length) return
    const timeout = window.setTimeout(() => dispatch({ type: "CLEAR_HIGHLIGHTS" }), 3200)
    return () => window.clearTimeout(timeout)
  }, [dispatch, state.changedProductIds.length])
  const items = state.inventory.filter((i) => kind === "all" || i.kind === kind)
  const moves = state.movements.filter((m) => origin === "all" || (origin === "prod") === m.orderId.startsWith("OP-"))
  const chip = (active: boolean) => `chip ${active ? "on" : ""}`
  const isProducts = section === "inventory"
  return (
    <div className="content">
      <section className="page-heading">
        <div>
          <h1>{isProducts ? "Productos" : "Movimientos de inventario"}</h1>
          <p>{isProducts ? "Insumos y productos terminados. Desde un producto terminado configuras cómo se fabrica." : "Todas las entradas y salidas, con el origen de cada una."}</p>
        </div>
        {!isProducts && (
          <button className="primary-btn" onClick={() => { setEntryId(state.inventory.find((i) => i.kind === "input")!.id); setShowEntry(true) }}>
            <Icon name="plus" size={17} />
            Registrar ingreso
          </button>
        )}
      </section>
      {isProducts ? (
        <section className="inventory-panel">
          <div className="chips">
            <button className={chip(kind === "all")} onClick={() => setKind("all")}>Todos</button>
            <button className={chip(kind === "input")} onClick={() => setKind("input")}>Insumos</button>
            <button className={chip(kind === "finished")} onClick={() => setKind("finished")}>Productos terminados</button>
          </div>
          <table className="inventory-table">
            <thead>
              <tr><th>PRODUCTO</th><th>TIPO</th><th>EXISTENCIA</th><th>COSTO UNITARIO</th><th>VALOR</th><th>FABRICACIÓN</th></tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const changed = state.changedProductIds.includes(item.id)
                const has = state.structures.some((s) => s.productId === item.id)
                return (
                  <tr className={changed ? "inventory-changed" : ""} key={item.id}>
                    <td>
                      <div className="inventory-product">
                        <span className={`stock-icon ${item.kind === "finished" ? "finished" : ""}`}>
                          <Icon name={item.kind === "finished" ? "factory" : "box"} size={15} />
                        </span>
                        <strong>{item.name}</strong>
                        {changed && <b>Actualizado</b>}
                      </div>
                    </td>
                    <td>{item.kind === "finished" ? "Producto terminado" : "Insumo"}</td>
                    <td><strong>{formatQuantity(item.stock)} {item.unit}</strong></td>
                    <td>{item.unitCost ? `${formatCOP(item.unitCost)} / ${item.unit}` : "—"}</td>
                    <td>{item.unitCost ? formatCOP(item.stock * item.unitCost) : "—"}</td>
                    <td>
                      {item.kind === "finished" ? (
                        <button className="secondary-btn" onClick={() => onConfigure(item.id)}>{has ? "Configurar fabricación" : "Crear estructura"}</button>
                      ) : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="movement-panel">
          <div className="chips">
            <button className={chip(origin === "all")} onClick={() => setOrigin("all")}>Todos</button>
            <button className={chip(origin === "prod")} onClick={() => setOrigin("prod")}>Producción</button>
            <button className={chip(origin === "manual")} onClick={() => setOrigin("manual")}>Ingreso manual</button>
            <span className="record-count">{moves.length} movimientos</span>
          </div>
          {moves.length ? (
            <table className="inventory-table movement-table">
              <thead><tr><th>FECHA</th><th>PRODUCTO</th><th>TIPO</th><th>CANTIDAD</th><th>ORIGEN</th></tr></thead>
              <tbody>
                {moves.map((movement) => {
                  const product = state.inventory.find((item) => item.id === movement.productId)!
                  return (
                    <tr key={movement.id}>
                      <td>{formatDateTime(movement.date)}</td>
                      <td><strong>{product.name}</strong></td>
                      <td><span className={`movement-type ${movement.type.toLowerCase()}`}>{movement.type}</span></td>
                      <td>{movement.type === "Entrada" ? "+" : "−"}{formatQuantity(movement.quantity)} {product.unit}</td>
                      <td>
                        {movement.orderId.startsWith("OP-") ? (
                          <button className="order-link" onClick={() => openTrace(movement.orderId)}>{movement.orderId}</button>
                        ) : (<span>{movement.orderId}</span>)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-movements">
              <Icon name="archive" />
              <strong>Aún no hay movimientos</strong>
              <span>Se generan al ejecutar una orden de producción o al registrar un ingreso.</span>
            </div>
          )}
        </section>
      )}
      {showEntry && (
        <SimpleModal title="Registrar ingreso" close={() => setShowEntry(false)}>
          <div className="form-field">
            <label>Producto</label>
            <select className="form-select" value={entryId} onChange={(e) => setEntryId(e.target.value)}>
              {state.inventory.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Cantidad ({state.inventory.find((i) => i.id === entryId)?.unit})</label>
            <input className="form-input" type="number" min="0" step="any" value={entryQty} onChange={(e) => setEntryQty(Number(e.target.value))} />
          </div>
          <div className="modal-actions">
            <button className="secondary-btn" onClick={() => setShowEntry(false)}>Cancelar</button>
            <button className="primary-btn" disabled={!(entryQty > 0)} onClick={() => { dispatch({ type: "ADD_STOCK", productId: entryId, quantity: entryQty }); setShowEntry(false) }}>Registrar</button>
          </div>
        </SimpleModal>
      )}
    </div>
  )
}

function CostDistribution({ order, inventory }: { order: ProductionOrder; inventory: InventoryItem[] }) {
  const s = order.structureSnapshot
  const ratio = order.quantity / s.baseQuantity
  const product = inventory.find((i) => i.id === order.productId)!
  const ing = getRequiredIngredients(s, order.quantity).map((r) => {
    const item = inventory.find((i) => i.id === r.productId)!
    return { label: item.name, calc: `${formatQuantity(r.quantity)} ${item.unit} × ${formatCOP(item.unitCost)}`, cost: r.quantity * item.unitCost }
  })
  const ops = s.operations.map((o) => ({ label: o.name, calc: `${formatQuantity(ratio)} × ${formatCOP(o.baseCost)}`, cost: o.baseCost * ratio }))
  const materials = ing.reduce((t, r) => t + r.cost, 0)
  const operations = ops.reduce((t, r) => t + r.cost, 0)
  const total = materials + operations
  const row = (r: { label: string; calc: string; cost: number }) => (
    <div className="cd-row" key={r.label}>
      <span>{r.label}</span>
      <small>{r.calc}</small>
      <strong>{formatCOP(r.cost)}</strong>
      <span className="cd-bar"><i style={{ width: `${total ? (r.cost / total) * 100 : 0}%` }} /></span>
      <small>{total ? ((r.cost / total) * 100).toFixed(1).replace(".", ",") : 0}%</small>
    </div>
  )
  return (
    <article className="trace-card trace-wide">
      <h2>Distribución del costo y transformación del inventario</h2>
      <div className="cd-flow">
        <div>
          <div className="cd-row cd-sub"><span>Insumos consumidos</span><small></small><strong>{formatCOP(materials)}</strong><span></span><small>{total ? ((materials / total) * 100).toFixed(1).replace(".", ",") : 0}%</small></div>
          {ing.map(row)}
          <div className="cd-row cd-sub"><span>Operaciones</span><small></small><strong>{formatCOP(operations)}</strong><span></span><small>{total ? ((operations / total) * 100).toFixed(1).replace(".", ",") : 0}%</small></div>
          {ops.map(row)}
          <div className="cd-row cd-total"><span>Costo total de producción</span><small>÷ {formatQuantity(order.quantity)} {product.unit}</small><strong>{formatCOP(total)}</strong></div>
        </div>
        <div className="cd-result">
          <small>ENTRA AL INVENTARIO</small>
          <strong>+{formatQuantity(order.quantity)} {product.unit}</strong>
          <span>{product.name}</span>
          <small>Costo de esta producción</small>
          <strong>{formatCOP(total / order.quantity, true)} por unidad</strong>
          <small>Costo unitario actual en inventario</small>
          <strong>{formatCOP(product.unitCost, true)} (promedio ponderado)</strong>
        </div>
      </div>
    </article>
  )
}

function TraceView({
  state,
  order,
  back,
}: {
  state: ManufacturingState
  order: ProductionOrder
  back: () => void
}) {
  const product = state.inventory.find((item) => item.id === order.productId)!
  const required = getRequiredIngredients(
    order.structureSnapshot,
    order.quantity,
  )
  const costs =
    order.costSnapshot ??
    calculateOrderCosts(
      order.structureSnapshot,
      order.quantity,
      state.inventory,
    )
  const movements = order.movementIds
    .map((id) => state.movements.find((movement) => movement.id === id))
    .filter(Boolean) as InventoryMovement[]
  return (
    <div className="content trace-content">
      <button className="back-link" onClick={back}>
        <Icon name="chevron" size={14} />
        Volver a órdenes
      </button>
      <section className="trace-header">
        <div>
          <p className="eyebrow">TRAZABILIDAD DE PRODUCCIÓN</p>
          <h1>{order.id}</h1>
          <span
            className={`status ${
              statusClass(order.status)
            }`}
          >
            <i />
            {order.status}
          </span>
        </div>
        <div className="trace-total">
          <span>Costo total</span>
          <strong>{formatCOP(costs.total)}</strong>
          <small>{formatCOP(costs.unit, true)} por unidad</small>
        </div>
      </section>
      <section className="trace-grid">
        <CostDistribution order={order} inventory={state.inventory} />
        <article className="trace-card trace-general">
          <h2>Información general</h2>
          <dl>
            <div>
              <dt>Producto</dt>
              <dd>{product.name}</dd>
            </div>
            <div>
              <dt>Cantidad producida</dt>
              <dd>
                {formatQuantity(order.quantity)} {product.unit}
              </dd>
            </div>
            <div>
              <dt>Estructura utilizada</dt>
              <dd>
                {order.structureSnapshot.id} · Versión{" "}
                {order.structureSnapshot.version}
              </dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{formatDate(order.date)}</dd>
            </div>
            <div>
              <dt>Usuario</dt>
              <dd>{order.user}</dd>
            </div>
          </dl>
        </article>
        <article className="trace-card">
          <h2>Insumos consumidos</h2>
          <div className="trace-list">
            {required.map((row) => {
              const item = state.inventory.find(
                (inventoryItem) => inventoryItem.id === row.productId,
              )!
              return (
                <div key={row.productId}>
                  <span>{item.name}</span>
                  <strong>
                    {formatQuantity(row.quantity)} {item.unit}
                  </strong>
                </div>
              )
            })}
          </div>
        </article>
        <article className="trace-card">
          <h2>Operaciones registradas</h2>
          <div className="trace-list">
            {order.structureSnapshot.operations.map((operation, index) => (
              <div key={operation.id}>
                <span>
                  {index + 1}. {operation.name}
                </span>
                <strong>
                  {formatCOP(
                    operation.baseCost *
                      (order.quantity / order.structureSnapshot.baseQuantity),
                  )}
                </strong>
              </div>
            ))}
          </div>
        </article>
        <article className="trace-card trace-movements">
          <h2>Movimientos generados</h2>
          {movements.length ? (
            <div className="trace-list">
              {movements.map((movement) => {
                const item = state.inventory.find(
                  (inventoryItem) => inventoryItem.id === movement.productId,
                )!
                return (
                  <div key={movement.id}>
                    <span>
                      <b className={movement.type.toLowerCase()}>
                        {movement.type}
                      </b>{" "}
                      {item.name}
                    </span>
                    <strong>
                      {formatQuantity(movement.before)} →{" "}
                      {formatQuantity(movement.after)} {item.unit}
                    </strong>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="trace-empty">
              Esta orden aún no ha generado movimientos de inventario.
            </p>
          )}
        </article>
      </section>
    </div>
  )
}

function StructuresView({ state, dispatch, focus }: { focus?: string; state: ManufacturingState; dispatch: React.Dispatch<ManufacturingAction> }) {
  const [selId, setSelId] = useState(state.structures.find((s) => s.productId === focus)?.id ?? state.structures[0].id)
  const [creating, setCreating] = useState(false)
  const [newProd, setNewProd] = useState("")
  const [newBase, setNewBase] = useState(20)
  const [ing, setIng] = useState("")
  const [ingQty, setIngQty] = useState(1)
  const [op, setOp] = useState({ name: "", time: "", cost: 0 })
  const structure = state.structures.find((s) => s.id === selId) ?? state.structures[0]
  const nameOf = (id: string) => state.inventory.find((i) => i.id === id)?.name ?? id
  const free = state.inventory.filter((i) => i.kind === "finished" && !state.structures.some((s) => s.productId === i.id))
  const usable = state.inventory.filter((i) => i.kind === "input" && !structure.ingredients.some((g) => g.productId === i.id))
  const costs = calculateOrderCosts(structure, structure.baseQuantity, state.inventory)
  const update = (patch: any) => dispatch({ type: "UPDATE_STRUCTURE", structureId: structure.id, patch })
  const num = (e: React.FocusEvent<HTMLInputElement>) => Number(e.target.value)
  return (
    <>
      <section className="structure-catalog">
        <div className="catalog-heading">
          <div>
            <h2>Estructuras de fabricación</h2>
            <p>Define qué insumos y operaciones lleva cada producto. Edita directamente en las tablas.</p>
          </div>
          <button className="secondary-btn" disabled={!free.length} onClick={() => { setCreating(!creating); setNewProd(free[0]?.id ?? "") }}>
            <Icon name="plus" size={15} />
            Nueva estructura
          </button>
        </div>
        {creating && free.length > 0 && (
          <div className="inline-create">
            <select className="form-select" value={newProd} onChange={(e) => setNewProd(e.target.value)}>
              {free.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span>Cantidad base</span>
            <input className="cell-input" type="number" min="1" value={newBase} onChange={(e) => setNewBase(Number(e.target.value))} />
            <button className="primary-btn" disabled={!newProd || newBase <= 0} onClick={() => { setSelId(`EST-${String(state.structures.length + 1).padStart(3, "0")}`); dispatch({ type: "CREATE_STRUCTURE", productId: newProd, baseQuantity: newBase }); setCreating(false) }}>Crear</button>
          </div>
        )}
        <div className="structure-cards">
          {state.structures.map((s) => (
            <button key={s.id} className={`structure-card ${s.id === structure.id ? "active" : ""}`} onClick={() => setSelId(s.id)}>
              <span className={`product-thumb ${s.productId}`} />
              <span>
                <strong>{nameOf(s.productId)}</strong>
                <small>{s.id} · Base {s.baseQuantity} und</small>
              </span>
              <Icon name="chevron" size={15} />
            </button>
          ))}
        </div>
      </section>
      <section className="structures-layout">
        <div className="structure-main">
          <div className="structure-title">
            <div className="structure-product">
              <span className={`large-product ${structure.productId}`} />
              <div>
                <p className="eyebrow">ESTRUCTURA {structure.id}</p>
                <h2>{nameOf(structure.productId)}</h2>
                <span>
                  Base:{" "}
                  <input className="cell-input" type="number" min="1" defaultValue={structure.baseQuantity} key={structure.id + structure.baseQuantity}
                    onBlur={(e) => { const v = num(e); if (v > 0 && v !== structure.baseQuantity) update({ baseQuantity: v }) }} />{" "}
                  unidades · Versión {structure.version}
                </span>
              </div>
            </div>
            <span className="status done"><i />Activa</span>
          </div>
          <div className="recipe-section">
            <div className="recipe-heading">
              <div><h3>Insumos y consumos</h3><p>Cantidades para la producción base. Cambia el número y sale del campo para guardar.</p></div>
            </div>
            <table className="recipe-table">
              <thead><tr><th>INSUMO</th><th>CANTIDAD BASE</th><th>COSTO UNITARIO</th><th>COSTO</th><th></th></tr></thead>
              <tbody>
                {structure.ingredients.map((g) => {
                  const item = state.inventory.find((p) => p.id === g.productId)!
                  return (
                    <tr key={g.productId}>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        <input className="cell-input" type="number" step="any" min="0" defaultValue={g.baseQuantity} key={structure.id + g.productId + g.baseQuantity}
                          onBlur={(e) => { const v = num(e); if (v > 0 && v !== g.baseQuantity) update({ ingredients: structure.ingredients.map((x) => (x.productId === g.productId ? { ...x, baseQuantity: v } : x)) }) }} /> {item.unit}
                      </td>
                      <td>{formatCOP(item.unitCost)} / {item.unit}</td>
                      <td><strong>{formatCOP(g.baseQuantity * item.unitCost)}</strong></td>
                      <td><button className="row-x" aria-label="Quitar insumo" onClick={() => update({ ingredients: structure.ingredients.filter((x) => x.productId !== g.productId) })}>✕</button></td>
                    </tr>
                  )
                })}
                {!structure.ingredients.length && <tr><td colSpan={5}>Aún no hay insumos. Agrega el primero en la fila de abajo.</td></tr>}
                <tr className="add-row">
                  <td>
                    <select className="form-select" value={ing} onChange={(e) => setIng(e.target.value)}>
                      <option value="">Selecciona un insumo…</option>
                      {usable.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </td>
                  <td><input className="cell-input" type="number" step="any" min="0" value={ingQty} onChange={(e) => setIngQty(Number(e.target.value))} /> {state.inventory.find((i) => i.id === ing)?.unit}</td>
                  <td></td><td></td>
                  <td><button className="secondary-btn" disabled={!ing || !(ingQty > 0)} onClick={() => { update({ ingredients: [...structure.ingredients, { productId: ing, baseQuantity: ingQty }] }); setIng(""); setIngQty(1) }}>Agregar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="recipe-section">
            <div className="recipe-heading">
              <div><h3>Operaciones</h3><p>Pasos del proceso y su costo para la producción base.</p></div>
            </div>
            <table className="recipe-table">
              <thead><tr><th>#</th><th>OPERACIÓN</th><th>TIEMPO</th><th>COSTO</th><th></th></tr></thead>
              <tbody>
                {structure.operations.map((o, idx) => (
                  <tr key={o.id}>
                    <td>{idx + 1}</td>
                    <td><strong>{o.name}</strong></td>
                    <td>{o.estimatedTime}</td>
                    <td>
                      <input className="cell-input" type="number" min="0" defaultValue={o.baseCost} key={o.id + o.baseCost}
                        onBlur={(e) => { const v = num(e); if (v >= 0 && v !== o.baseCost) update({ operations: structure.operations.map((x) => (x.id === o.id ? { ...x, baseCost: v } : x)) }) }} />
                    </td>
                    <td><button className="row-x" aria-label="Quitar operación" onClick={() => update({ operations: structure.operations.filter((x) => x.id !== o.id) })}>✕</button></td>
                  </tr>
                ))}
                {!structure.operations.length && <tr><td colSpan={5}>Aún no hay operaciones. Agrega la primera en la fila de abajo.</td></tr>}
                <tr className="add-row">
                  <td></td>
                  <td><input className="form-input" placeholder="Ej. Decorar y etiquetar" value={op.name} onChange={(e) => setOp({ ...op, name: e.target.value })} /></td>
                  <td><input className="form-input" placeholder="Ej. 30 min" value={op.time} onChange={(e) => setOp({ ...op, time: e.target.value })} /></td>
                  <td><input className="cell-input" type="number" min="0" value={op.cost} onChange={(e) => setOp({ ...op, cost: Number(e.target.value) })} /></td>
                  <td><button className="secondary-btn" disabled={!op.name.trim()} onClick={() => { update({ operations: [...structure.operations, { id: `op-${Date.now()}`, name: op.name.trim(), estimatedTime: op.time.trim() || "—", baseCost: op.cost }] }); setOp({ name: "", time: "", cost: 0 }) }}>Agregar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <aside className="recipe-summary">
          <p className="eyebrow">COSTO TOTAL</p>
          <h3>Producción base</h3>
          <div><span>Insumos</span><strong>{formatCOP(costs.materials)}</strong></div>
          <div><span>Operaciones</span><strong>{formatCOP(costs.operations)}</strong></div>
          <div className="recipe-total"><span>Costo total</span><strong>{formatCOP(costs.total)}</strong></div>
          <div className="unit-cost"><span>Costo por unidad</span><strong>{formatCOP(costs.unit, true)}</strong></div>
          <small>Los cambios se guardan solos. Las órdenes existentes conservan una copia de la versión utilizada.</small>
        </aside>
      </section>
    </>
  )
}

function CreateOrderModal({ state, productId, setProductId, quantity, setQuantity, close, create }: {
  state: ManufacturingState
  productId: string
  setProductId: (id: string) => void
  quantity: number
  setQuantity: (quantity: number) => void
  close: () => void
  create: () => void
}) {
  const structure = state.structures.find((s) => s.productId === productId) ?? state.structures[0]
  const previewOrder: ProductionOrder = {
    id: orderNumber(state.nextOrderNumber),
    productId: structure.productId,
    quantity,
    date: "2026-10-15",
    user: "Camila Moreno",
    status: "Pendiente",
    structureSnapshot: structure,
    movementIds: [],
  }
  const availability = getAvailability(previewOrder, state.inventory)
  const costs = calculateOrderCosts(structure, quantity, state.inventory)
  const nameOf = (id: string) => state.inventory.find((i) => i.id === id)?.name ?? id
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">NUEVA ORDEN {previewOrder.id}</p>
            <h2 id="create-title">¿Qué quieres fabricar?</h2>
          </div>
          <button className="icon-btn" onClick={close}><Icon name="close" /></button>
        </div>
        <div className="form-row order-form-row">
          <div className="form-field">
            <label>Producto</label>
            <select className="form-select" value={structure.productId} onChange={(e) => setProductId(e.target.value)}>
              {state.structures.map((s) => <option key={s.id} value={s.productId}>{nameOf(s.productId)}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Cantidad a producir</label>
            <input className="form-input" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          </div>
        </div>
        <div className="scale-note">
          <Icon name="cube" />
          <span>
            {structure.id} · Versión {structure.version} · Escala: {formatQuantity(quantity / structure.baseQuantity)} × base. Costo total <strong>{formatCOP(costs.total)}</strong>.
          </span>
        </div>
        <AvailabilityBanner availability={availability} />
        <p className="no-movement-note">Crear esta orden no modifica las existencias.</p>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>Cancelar</button>
          <button className="primary-btn" disabled={!quantity || !structure.ingredients.length} onClick={create}>Crear orden</button>
        </div>
      </section>
    </div>
  )
}

function ConfirmModal({
  order,
  state,
  close,
  confirm,
}: {
  order: ProductionOrder
  state: ManufacturingState
  close: () => void
  confirm: () => void
}) {
  const projection = getInventoryProjection(order, state.inventory)
  const fin = state.inventory.find((i) => i.id === order.productId)!
  const costs = calculateOrderCosts(
    order.structureSnapshot,
    order.quantity,
    state.inventory,
  )
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section
        className="modal inventory-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">CONFIRMAR {order.id}</p>
            <h2 id="confirm-title">Impacto en inventario</h2>
          </div>
          <button className="icon-btn" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        <p className="confirm-description">
          Estos movimientos se generarán únicamente cuando confirmes.
        </p>
        <ProjectionTable projection={projection} />
        <div className="cd-confirm">
          <span>Insumos {formatCOP(costs.materials)} ({((costs.materials / costs.total) * 100).toFixed(0)}%) + operaciones {formatCOP(costs.operations)} ({((costs.operations / costs.total) * 100).toFixed(0)}%)</span>
          <span>
            Costo unitario de {fin.name}: {fin.unitCost ? formatCOP(fin.unitCost, true) : "sin costo"} → <strong>{formatCOP((fin.stock * fin.unitCost + order.quantity * costs.unit) / (fin.stock + order.quantity), true)}</strong>
          </span>
        </div>
        <div className="confirm-cost">
          <span>Costo total de producción</span>
          <strong>{formatCOP(costs.total)}</strong>
        </div>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Volver
          </button>
          <button className="primary-btn" onClick={confirm}>
            <Icon name="check" size={15} />
            Confirmar y ejecutar
          </button>
        </div>
      </section>
    </div>
  )
}

function SuccessModal({
  orderId,
  projection,
  close,
  seeInventory,
}: {
  orderId: string
  projection: ReturnType<typeof getInventoryProjection>
  close: () => void
  seeInventory: () => void
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section
        className="modal success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="success-mark">
          <Icon name="check" size={23} />
        </div>
        <h2 id="success-title">Producción ejecutada correctamente</h2>
        <p>
          {orderId} quedó ejecutada y todos los movimientos fueron registrados.
        </p>
        <ProjectionTable projection={projection} />
        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Cerrar
          </button>
          <button className="primary-btn" onClick={seeInventory}>
            <Icon name="box" size={15} />
            Ver inventario
          </button>
        </div>
      </section>
    </div>
  )
}

function ProjectionTable({
  projection,
}: {
  projection: ReturnType<typeof getInventoryProjection>
}) {
  return (
    <div className="projection-table">
      <div className="projection-head">
        <span>PRODUCTO</span>
        <span>ANTES</span>
        <span>DESPUÉS</span>
      </div>
      {projection.map((row) => (
        <div className="projection-row" key={row.product.id}>
          <span>
            <strong>{row.product.name}</strong>
            <small>{row.type}</small>
          </span>
          <span>
            {formatQuantity(row.before)} {row.product.unit}
          </span>
          <span className={row.type.toLowerCase()}>
            {row.type === "Entrada" ? "+" : ""}
            {formatQuantity(row.after)} {row.product.unit}
          </span>
        </div>
      ))}
    </div>
  )
}

function SimpleModal({
  title,
  close,
  children,
}: {
  title: string
  close: () => void
  children: React.ReactNode
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section
        className="modal compact-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}
