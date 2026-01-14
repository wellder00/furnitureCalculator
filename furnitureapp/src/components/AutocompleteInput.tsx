"use client"

import { useState, useRef, useEffect } from "react"
import { FurnitureItem } from "@/types/furniture"

interface AutocompleteInputProps {
  items: FurnitureItem[]
  category: string
  onSelect: (item: FurnitureItem, category: string) => void
  placeholder: string
  label: string
}

export default function AutocompleteInput({
  items,
  category,
  onSelect,
  placeholder,
  label,
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [filteredItems, setFilteredItems] = useState<FurnitureItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.trim()) {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredItems(filtered)
      setShowDropdown(true)
      setSelectedIndex(-1)
    } else {
      setFilteredItems([])
      setShowDropdown(false)
    }
  }

  const handleSelect = (item: FurnitureItem) => {
    onSelect(item, category)
    setInputValue("")
    setFilteredItems([])
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredItems.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
          handleSelect(filteredItems[selectedIndex])
        }
        break
      case "Escape":
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue.trim() && filteredItems.length > 0) {
            setShowDropdown(true)
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-500"
      />
      {showDropdown && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 text-white border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-gray-300 mt-1">
                {item.price.toFixed(2)} грн / {item.unit}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
