"use client"

import { useEffect, useState } from "react"
import { OrderItem } from "@/types/furniture"
import { Trash2 } from "lucide-react"

interface OrderListProps {
  orders: OrderItem[]
  onRemove: (index: number) => void
  onQuantityChange: (index: number, quantity: number) => void
  onUpdateItem: (index: number, updates: Partial<OrderItem>) => void
}

export default function OrderList({
  orders,
  onRemove,
  onQuantityChange,
  onUpdateItem,
}: OrderListProps) {
  const [quantityInputs, setQuantityInputs] = useState<string[]>([])

  const formatQuantityValue = (quantity: number) => {
    const str = quantity.toString()
    return str.includes(".") ? str.replace(".", ",") : str
  }

  useEffect(() => {
    setQuantityInputs(
      orders.map((order) => formatQuantityValue(order.quantity)),
    )
  }, [orders])

  const updateQuantityInput = (value: string, index: number) => {
    setQuantityInputs((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const parseQuantityValue = (value: string): number | null => {
    if (!value.trim()) return null
    const normalized = value.replace(/,/g, ".")
    const num = Number(normalized)
    if (!Number.isFinite(num) || num <= 0) return null
    return num
  }

  const handleQuantityInputChange = (value: string, index: number) => {
    updateQuantityInput(value, index)

    const trimmed = value.trim()
    if (trimmed === "" || /[.,]$/.test(trimmed)) {
      return
    }

    const parsed = parseQuantityValue(value)
    if (parsed !== null) {
      onQuantityChange(index, parsed)
    }
  }

  const handleQuantityInputBlur = (value: string, index: number) => {
    const parsed = parseQuantityValue(value)
    const nextValue = parsed !== null ? parsed : 1
    onQuantityChange(index, nextValue)
    updateQuantityInput(formatQuantityValue(nextValue), index)
  }

  const totalSum = orders.reduce((sum, order) => sum + order.total, 0)

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">Список замовлень порожній</p>
        <p className="text-sm text-gray-400 mt-2">
          Додайте позиції, використовуючи форму вище
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5">
                Найменування
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">
                Категорія
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                Кількість
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                Ціна
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                Сума
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-14">
                Дії
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900 w-2/5">
                  <input
                    type="text"
                    value={order.name}
                    onChange={(e) =>
                      onUpdateItem(index, { name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 w-1/6">
                  <input
                    type="text"
                    value={order.category}
                    onChange={(e) =>
                      onUpdateItem(index, { category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                  />
                </td>
                <td className="px-4 py-3 text-center w-24">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={
                      quantityInputs[index] ??
                      formatQuantityValue(order.quantity)
                    }
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      handleQuantityInputChange(e.target.value, index)
                    }
                    onBlur={(e) =>
                      handleQuantityInputBlur(e.target.value, index)
                    }
                    className="w-24 px-3 py-2 text-center border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900 placeholder-gray-500"
                  />
                  <span className="ml-2 text-xs text-gray-500">
                    {order.unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 w-28">
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={order.price}
                      onChange={(e) =>
                        onUpdateItem(index, {
                          price: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                      disabled={!order.includePrice}
                    />
                    <label className="flex items-center justify-end gap-2 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={!order.includePrice}
                        onChange={(e) =>
                          onUpdateItem(index, {
                            includePrice: !e.target.checked ? true : false,
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Без ціни
                    </label>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 w-28">
                  {order.includePrice ? `${order.total.toFixed(2)} грн` : "—"}
                </td>
                <td className="px-4 py-3 text-center w-14">
                  <button
                    onClick={() => onRemove(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Видалити"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td
                colSpan={4}
                className="px-4 py-4 text-right font-semibold text-gray-900"
              >
                Загальна сума:
              </td>
              <td className="px-4 py-4 text-right font-bold text-lg text-blue-600">
                {totalSum.toFixed(2)} грн
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-200">
          {orders.map((order, index) => (
            <div key={index} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Найменування
                  </label>
                  <input
                    type="text"
                    value={order.name}
                    onChange={(e) =>
                      onUpdateItem(index, { name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                  />
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Видалити"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Категорія
                </label>
                <input
                  type="text"
                  value={order.category}
                  onChange={(e) =>
                    onUpdateItem(index, { category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Кількість
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={
                        quantityInputs[index] ??
                        formatQuantityValue(order.quantity)
                      }
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        handleQuantityInputChange(e.target.value, index)
                      }
                      onBlur={(e) =>
                        handleQuantityInputBlur(e.target.value, index)
                      }
                      className="w-20 px-3 py-2 text-center text-sm border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                    />
                    <span className="text-xs text-gray-500">{order.unit}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Ціна
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={order.price}
                    onChange={(e) =>
                      onUpdateItem(index, {
                        price: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                    disabled={!order.includePrice}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={!order.includePrice}
                    onChange={(e) =>
                      onUpdateItem(index, {
                        includePrice: !e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Без ціни
                </label>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Сума</div>
                  <div className="text-base font-semibold text-gray-900">
                    {order.includePrice ? `${order.total.toFixed(2)} грн` : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border-t-2 border-gray-300 p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Загальна сума:</span>
            <span className="font-bold text-lg text-blue-600">
              {totalSum.toFixed(2)} грн
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
