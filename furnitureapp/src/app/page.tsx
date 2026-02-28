"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AutocompleteInput from "@/components/AutocompleteInput"
import OrderList from "@/components/OrderList"
import ExportButtons from "@/components/ExportButtons"
import SaveProjectDialog from "@/components/SaveProjectDialog"
import {
  FurnitureData,
  FurnitureItem,
  OrderItem,
  Project,
} from "@/types/furniture"
import { FolderOpen, Search, X } from "lucide-react"

export default function Home() {
  const [furnitureData, setFurnitureData] = useState<FurnitureData>({})
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [orderName, setOrderName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [globalSearch, setGlobalSearch] = useState("")
  const [searchResults, setSearchResults] = useState<
    { item: FurnitureItem; category: string }[]
  >([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadFurniture() {
      try {
        // First try to load from KV via API
        const apiRes = await fetch("/api/furniture")
        const apiData = await apiRes.json()

        if (apiData && Object.keys(apiData).length > 0) {
          setFurnitureData(apiData)
          setLoading(false)
          return
        }

        // Fallback to static file
        const staticRes = await fetch("/furniture.json")
        const staticData = await staticRes.json()
        setFurnitureData(staticData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading furniture data:", error)
        setLoading(false)
      }
    }
    loadFurniture()

    const loadedProject = localStorage.getItem("loadedProject")
    if (loadedProject) {
      try {
        const project: Project = JSON.parse(loadedProject)
        setOrders(project.orders)
        setOrderName(project.name)
        setCurrentProjectId(project.id)
        localStorage.removeItem("loadedProject")
      } catch (error) {
        console.error("Error loading project:", error)
      }
    }
  }, [])

  // Global search effect
  useEffect(() => {
    if (globalSearch.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const query = globalSearch.toLowerCase()
    const results: { item: FurnitureItem; category: string }[] = []

    Object.entries(furnitureData).forEach(([category, items]) => {
      items.forEach((item) => {
        if (item.name.toLowerCase().includes(query)) {
          results.push({ item, category })
        }
      })
    })

    setSearchResults(results.slice(0, 20)) // Limit to 20 results
    setShowSearchResults(true)
  }, [globalSearch, furnitureData])

  const handleAddItem = (item: FurnitureItem, category: string) => {
    const newOrder: OrderItem = {
      ...item,
      category,
      quantity: 1,
      total: 0,
      includePrice: false,
    }
    setOrders([...orders, newOrder])
  }

  const handleSearchSelect = (item: FurnitureItem, category: string) => {
    handleAddItem(item, category)
    setGlobalSearch("")
    setShowSearchResults(false)
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
          : (merged.includePrice ?? true)

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
      setCurrentProjectId(null)
    }
  }

  const handleSaveProject = async () => {
    try {
      const projectName = orderName.trim() || "Без назви"
      const method = currentProjectId ? "PUT" : "POST"
      const body = currentProjectId
        ? { id: currentProjectId, name: projectName, orders }
        : { name: projectName, orders }

      const response = await fetch("/api/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const project = await response.json()
        setCurrentProjectId(project.id)
      } else {
        throw new Error("Failed to save project")
      }
    } catch (error) {
      console.error("Error saving project:", error)
      throw error
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
    (cat) => !requiredCategories.includes(cat),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Пошук по всій фурнітурі..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-500"
                />
                {globalSearch && (
                  <button
                    onClick={() => {
                      setGlobalSearch("")
                      setShowSearchResults(false)
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <button
                onClick={() => router.push("/projects")}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <FolderOpen size={18} />
                <span className="hidden sm:inline">Мої проекти</span>
              </button>
              <a
                href="/admin"
                className="px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">Управління</span>
                <span className="sm:hidden">⚙️</span>
              </a>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                  Знайдено: {searchResults.length}{" "}
                  {searchResults.length === 20 ? "(показано перші 20)" : ""}
                </div>
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleSearchSelect(result.item, result.category)
                    }
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {result.item.name}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {result.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {result.item.price.toFixed(2)} грн / {result.item.unit}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSearchResults &&
              globalSearch.length >= 2 &&
              searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-center text-gray-500">
                  Нічого не знайдено
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
              <div className="space-y-4">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex items-center justify-center gap-2"
                >
                  <FolderOpen size={20} />
                  {currentProjectId ? "Оновити проект" : "Зберегти проект"}
                </button>
                <ExportButtons orders={orders} orderName={orderName} />
              </div>
            </div>
          )}
        </div>
      </div>

      <SaveProjectDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveProject}
        defaultName={orderName || "Новий проект"}
        orders={orders}
      />
    </div>
  )
}
