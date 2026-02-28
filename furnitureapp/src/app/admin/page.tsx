"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, ChevronDown } from "lucide-react"
import { FurnitureData, FurnitureItem } from "@/types/furniture"

export default function AdminPage() {
  const router = useRouter()
  const [furnitureData, setFurnitureData] = useState<FurnitureData>({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newItem, setNewItem] = useState<FurnitureItem>({
    name: "",
    unit: "",
    price: 0,
  })
  const [newCategory, setNewCategory] = useState("")
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  )

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
  }, [])

  const handleAddItem = async () => {
    if (!selectedCategory || !newItem.name || !newItem.unit) {
      alert("Заповніть всі поля")
      return
    }

    const updatedData = { ...furnitureData }
    if (!updatedData[selectedCategory]) {
      updatedData[selectedCategory] = []
    }
    updatedData[selectedCategory].push({ ...newItem })

    try {
      const response = await fetch("/api/furniture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setFurnitureData(updatedData)
        setNewItem({ name: "", unit: "", price: 0 })
        setSaveStatus("Додано успішно!")
        setTimeout(() => setSaveStatus(null), 2000)
      } else {
        alert("Помилка збереження")
      }
    } catch (error) {
      console.error("Error saving:", error)
      alert("Помилка збереження")
    }
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert("Введіть назву категорії")
      return
    }
    if (furnitureData[newCategory]) {
      alert("Категорія вже існує")
      return
    }
    const updatedData = { ...furnitureData, [newCategory]: [] }
    setFurnitureData(updatedData)
    setSelectedCategory(newCategory)
    setNewCategory("")
  }

  const handleDeleteItem = async (category: string, itemIndex: number) => {
    if (!confirm("Видалити цей елемент?")) return

    const updatedData = { ...furnitureData }
    updatedData[category] = updatedData[category].filter(
      (_, idx) => idx !== itemIndex,
    )

    try {
      const response = await fetch("/api/furniture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setFurnitureData(updatedData)
        setSaveStatus("Видалено!")
        setTimeout(() => setSaveStatus(null), 2000)
      }
    } catch (error) {
      console.error("Error deleting:", error)
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

  const categories = Object.keys(furnitureData).sort()
  const displayedCategories = (
    categoryFilter
      ? categories.filter((cat) => cat === categoryFilter)
      : categories
  ).filter((cat) => (furnitureData[cat]?.length || 0) > 0)

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? false),
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
            Назад до калькулятора
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Управління Фурнітурою
          </h1>
          <p className="text-gray-600">
            Додавайте та редагуйте фурнітуру в базі даних
          </p>
        </div>

        {saveStatus && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
            {saveStatus}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Додати нову категорію
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Назва категорії"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
            />
            <button
              onClick={handleAddCategory}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus size={20} />
              Додати категорію
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Додати новий елемент
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категорія
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
              >
                <option value="">Оберіть категорію</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Назва
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Назва фурнітури"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Одиниця виміру
              </label>
              <input
                type="text"
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem({ ...newItem, unit: e.target.value })
                }
                placeholder="шт, м/п, к-кт"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ціна (грн)
              </label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: Number(e.target.value) })
                }
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
              />
            </div>
          </div>

          <button
            onClick={handleAddItem}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Додати елемент
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Поточна база даних
          </h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Оберіть категорію для перегляду
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
            >
              <option value="">Усі категорії</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {displayedCategories.length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-50 rounded-lg py-6">
              Немає категорій для відображення. Додайте елементи або змініть
              фільтр.
            </div>
          ) : (
            <div className="space-y-4">
              {displayedCategories.map((category) => {
                const isOpen = openCategories[category] ?? false
                return (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-left">
                        <div className="text-base font-semibold text-gray-900">
                          {category}
                        </div>
                        <div className="text-xs text-gray-500">
                          {furnitureData[category].length} позицій
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-gray-500 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                        {furnitureData[category].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex-1 pr-4">
                              <div className="font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.price.toFixed(2)} грн / {item.unit}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteItem(category, idx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Видалити"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
