"use client"

import { useState } from "react"
import { OrderItem } from "@/types/furniture"
import { ClipboardCopy, Image } from "lucide-react"

interface ExportButtonsProps {
  orders: OrderItem[]
  orderName?: string
}

export default function ExportButtons({
  orders,
  orderName = "",
}: ExportButtonsProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const generateTableText = (name = "") => {
    if (orders.length === 0) return ""

    const lines: string[] = []
    const orderLabel = name.trim() ? name.trim() : "Без назви"
    lines.push(`Назва замовлення: **${orderLabel}**`)
    lines.push("")

    orders.forEach((order, index) => {
      const priceInfo = order.includePrice
        ? ` - ${order.price.toFixed(2)} грн`
        : ""
      lines.push(`${index + 1}. ${order.name}`)
      lines.push(`   ${order.quantity} ${order.unit}${priceInfo}`)
      lines.push("")
    })

    const totalSum = orders.reduce(
      (sum, order) => sum + (order.includePrice ? order.total : 0),
      0
    )
    lines.push("----------------------------")
    lines.push(`ЗАГАЛЬНА СУМА: ${totalSum.toFixed(2)} грн`)

    return lines.join("\n")
  }

  const handleCopy = async () => {
    const text = generateTableText(orderName)

    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
      } catch (e) {
        console.error("Failed to copy text")
      }
      document.body.removeChild(textArea)
    }

    setCopyStatus("Текст скопійовано")
    setTimeout(() => setCopyStatus(null), 2000)
  }

  const handleDownloadImage = async () => {
    const columns = [
      { width: 70, align: "right" as const },
      { width: 420, align: "left" as const },
      { width: 100, align: "center" as const },
      { width: 90, align: "left" as const },
      { width: 130, align: "right" as const },
      { width: 130, align: "right" as const },
    ]
    const headerLabels = ["№", "Назва", "К-сть", "Од.", "Ціна", "Сума"]
    const headerFont = `600 16px 'Segoe UI', sans-serif`
    const bodyFont = `400 16px 'Segoe UI', sans-serif`
    const totalFont = `600 16px 'Segoe UI', sans-serif`
    const labelFont = `600 18px 'Segoe UI', sans-serif`
    const nameFont = `700 24px 'Segoe UI', sans-serif`
    const padding = 32
    const cellPaddingX = 12
    const cellPaddingY = 10
    const lineHeight = 22
    const tableWidth = columns.reduce((sum, col) => sum + col.width, 0)
    const totalSum = orders.reduce(
      (sum, order) => sum + (order.includePrice ? order.total : 0),
      0
    )

    type RowType = "header" | "body" | "total"
    interface RowConfig {
      type: RowType
      values: (string | number)[]
    }

    const rows: RowConfig[] = [
      { type: "header", values: headerLabels },
      ...orders.map<RowConfig>((order, index) => ({
        type: "body",
        values: [
          index + 1,
          order.name,
          `${order.quantity}`,
          order.unit,
          order.includePrice ? order.price.toFixed(2) : "-",
          order.includePrice ? order.total.toFixed(2) : "-",
        ],
      })),
      { type: "total", values: ["", "Разом", "", "", "", totalSum.toFixed(2)] },
    ]

    const measureCanvas = document.createElement("canvas")
    const measureCtx = measureCanvas.getContext("2d")
    if (!measureCtx) return

    const wrapText = (
      text: string,
      maxWidth: number,
      font: string
    ): string[] => {
      const words = text.split(/\s+/).filter(Boolean)
      measureCtx.font = font
      const lines: string[] = []
      let current = ""

      const pushLine = (line: string) => {
        if (line) {
          lines.push(line)
        }
      }

      const addSegment = (segment: string) => {
        if (!segment) return
        if (measureCtx.measureText(segment).width <= maxWidth) {
          current = segment
          return
        }
        let temp = ""
        for (const char of segment) {
          const attempt = temp + char
          if (measureCtx.measureText(attempt).width > maxWidth && temp) {
            lines.push(temp)
            temp = char
          } else {
            temp = attempt
          }
        }
        if (temp) {
          current = temp
        }
      }

      if (words.length === 0) {
        addSegment(text)
      } else {
        words.forEach((word) => {
          const attempt = current ? `${current} ${word}` : word
          if (measureCtx.measureText(attempt).width <= maxWidth) {
            current = attempt
          } else {
            if (current) {
              lines.push(current)
            }
            if (measureCtx.measureText(word).width <= maxWidth) {
              current = word
            } else {
              let part = ""
              for (const char of word) {
                const attemptPart = part + char
                if (
                  measureCtx.measureText(attemptPart).width > maxWidth &&
                  part
                ) {
                  lines.push(part)
                  part = char
                } else {
                  part = attemptPart
                }
              }
              current = part
            }
          }
        })
      }

      if (current) {
        pushLine(current)
      }

      return lines.length ? lines : [""]
    }

    const rowsMeta = rows.map((row) => {
      const columnsData = row.values.map((value, idx) => {
        const column = columns[idx]
        const isHeader = row.type === "header"
        const font = isHeader
          ? headerFont
          : row.type === "total" && column.align === "right"
          ? totalFont
          : bodyFont
        const maxContentWidth = column.width - cellPaddingX * 2
        const lines = wrapText(String(value ?? ""), maxContentWidth, font)
        return { lines, font }
      })
      const maxLines = Math.max(...columnsData.map((col) => col.lines.length))
      const height = maxLines * lineHeight + cellPaddingY * 2
      return { ...row, columnsData, height }
    })

    const tableHeight = rowsMeta.reduce((sum, row) => sum + row.height, 0)

    const nameLabel = orderName.trim() ? orderName.trim() : "Без назви"
    const nameLines = wrapText(nameLabel, tableWidth, nameFont)
    const titleBlockHeight = 30 + nameLines.length * 28

    const logicalWidth = tableWidth + padding * 2
    const logicalHeight = titleBlockHeight + tableHeight + padding * 2
    const dpr = Math.max(window.devicePixelRatio || 1, 2)

    const canvas = document.createElement("canvas")
    canvas.width = logicalWidth * dpr
    canvas.height = logicalHeight * dpr
    canvas.style.width = `${logicalWidth}px`
    canvas.style.height = `${logicalHeight}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.scale(dpr, dpr)

    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, logicalWidth, logicalHeight)

    ctx.fillStyle = "#0f172a"
    ctx.font = labelFont
    ctx.textBaseline = "top"
    ctx.textAlign = "left"
    ctx.fillText("Назва замовлення:", padding, padding)
    ctx.font = nameFont
    nameLines.forEach((line, idx) => {
      ctx.fillText(line, padding, padding + 24 + idx * 28)
    })

    let currentY = padding + titleBlockHeight

    const drawRow = (rowMeta: (typeof rowsMeta)[number]) => {
      let x = padding
      const isHeader = rowMeta.type === "header"
      const isTotal = rowMeta.type === "total"
      if (isHeader) {
        ctx.fillStyle = "#e2e8f0"
        ctx.fillRect(x, currentY, tableWidth, rowMeta.height)
      }

      rowMeta.columnsData.forEach((columnData, idx) => {
        const column = columns[idx]
        const font = columnData.font
        ctx.font = font
        ctx.textBaseline = "top"
        ctx.textAlign = column.align
        ctx.fillStyle = isHeader ? "#0f172a" : "#111827"
        if (isTotal) {
          ctx.fillStyle = idx >= 4 ? "#0f172a" : "#1f2937"
        }

        const drawX =
          column.align === "right"
            ? x + column.width - cellPaddingX
            : column.align === "center"
            ? x + column.width / 2
            : x + cellPaddingX

        columnData.lines.forEach((line, lineIdx) => {
          const lineY = currentY + cellPaddingY + lineIdx * lineHeight
          ctx.fillText(line, drawX, lineY)
        })

        ctx.strokeStyle = "#cbd5f5"
        ctx.strokeRect(x, currentY, column.width, rowMeta.height)
        x += column.width
      })

      currentY += rowMeta.height
    }

    rowsMeta.forEach((row) => drawRow(row))

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zamovlennya-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  if (orders.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 relative">
      {copyStatus && (
        <div className="absolute -top-10 left-0 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {copyStatus}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="flex-1 min-w-[200px] px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <ClipboardCopy size={20} />
        Скопіювати текст
      </button>
      <button
        onClick={handleDownloadImage}
        className="flex-1 min-w-[200px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Image size={20} />
        Зберегти як зображення
      </button>
    </div>
  )
}
