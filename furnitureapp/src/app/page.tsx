"use client"

import { useState, useEffect } from "react"
import AutocompleteInput from "@/components/AutocompleteInput"
import OrderList from "@/components/OrderList"
import ExportButtons from "@/components/ExportButtons"
import { FurnitureData, FurnitureItem, OrderItem } from "@/types/furniture"

export default function Home() {
  const [furnitureData, setFurnitureData] = useState<FurnitureData>({})
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [orderName, setOrderName] = useState("")

  useEffect(() => {
    fetch("/furniture.json")
      .then((res) => res.json())
      .then((data) => {
        setFurnitureData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading furniture data:", error)
        setLoading(false)
      })
  }, [])

  const handleAddItem = (item: FurnitureItem, category: string) => {
    const newOrder: OrderItem = {
      ...item,
      category,
      quantity: 1,
      total: item.price,
      includePrice: true,
    }
    setOrders([...orders, newOrder])
  }

  const handleRemoveItem = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index))
  }

  const handleOrderUpdate = (index: number, updates: Partial<OrderItem>) => {
    setOrders((prev) => {
      const updated = [...prev]
      const current = updated[index]
      if (!current) return prev

      const merged = {
        ...current,
        ...updates,
      }

      const includePrice =
        updates.includePrice !== undefined
          ? updates.includePrice
          : merged.includePrice ?? true

      const price = updates.price ?? merged.price
      const quantity = updates.quantity ?? merged.quantity
      merged.includePrice = includePrice
      merged.price = price
      merged.quantity = quantity
      merged.total = includePrice ? price * quantity : 0

      updated[index] = merged
      return updated
    })
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity <= 0) return
    handleOrderUpdate(index, { quantity })
  }

  const handleClearAll = () => {
    if (confirm("Ви впевнені, що хочете очистити весь список?")) {
      setOrders([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Завантаження...</p>
        </div>
      </div>
    )
  }

  const requiredCategories = [
    "Стільниці",
    "Висувні системи (направляючі)",
    "Підйомні механізми та амортизатори",
    "Кріплення",
  ]

  const optionalCategories = Object.keys(furnitureData).filter(
    (cat) => !requiredCategories.includes(cat)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <a
            href="/admin"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Управління фурнітурою
          </a>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Калькулятор Фурнітури
          </h1>
          <p className="text-gray-600">
            Розрахунок та замовлення фурнітури для виробництва меблів
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Назва замовлення
          </label>
          <input
            type="text"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            placeholder="Введіть назву замовлення (необов'язково)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-red-500">*</span>
            Обов'язкові поля
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requiredCategories.map((category) => (
              <AutocompleteInput
                key={category}
                items={furnitureData[category] || []}
                category={category}
                onSelect={handleAddItem}
                placeholder={`Введіть назву...`}
                label={category}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Додаткові позиції
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optionalCategories.map((category) => (
              <AutocompleteInput
                key={category}
                items={furnitureData[category] || []}
                category={category}
                onSelect={handleAddItem}
                placeholder={`Введіть назву...`}
                label={category}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Список замовлення
            </h2>
            {orders.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                Очистити все
              </button>
            )}
          </div>
          <OrderList
            orders={orders}
            onRemove={handleRemoveItem}
            onQuantityChange={handleQuantityChange}
            onUpdateItem={handleOrderUpdate}
          />
        </div>

        {orders.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Експорт замовлення
            </h2>
            <ExportButtons orders={orders} orderName={orderName} />
          </div>
        )}
      </div>
    </div>
  )
}
