"use client"

import { useState } from "react"
import { OrderItem } from "@/types/furniture"
import { Save, X } from "lucide-react"

interface SaveProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  defaultName: string
  orders: OrderItem[]
}

export default function SaveProjectDialog({
  isOpen,
  onClose,
  onSave,
  defaultName,
  orders,
}: SaveProjectDialogProps) {
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
      onClose()
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Помилка при збереженні проекту")
    } finally {
      setSaving(false)
    }
  }

  const totalSum = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Зберегти проект</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={saving}
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Назва проекту
            </label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium">
              {defaultName || "Без назви"}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Кількість позицій:</span>
              <span className="text-gray-900 font-medium">{orders.length}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Загальна сума:</span>
              <span className="text-blue-600 font-bold">
                {totalSum.toFixed(2)} грн
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            disabled={saving}
          >
            Відмінити
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Збереження...
              </>
            ) : (
              <>
                <Save size={20} />
                Зберегти
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
