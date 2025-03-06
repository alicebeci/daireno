"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Apartment {
  number: number | string
}

interface Floor {
  y: number
  isBasement: boolean
  label: string
  apartmentCount: number
  apartments: Apartment[]
}

export default function DaireNoFormu() {
  const [normalFloorCount, setNormalFloorCount] = useState(1)
  const [basementCount, setBasementCount] = useState(0)
  const [apartmentCount, setApartmentCount] = useState(1)
  const [floors, setFloors] = useState<Floor[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const floorHeight = 50

  // Generate floors with apartment numbers already included
  const drawSection = () => {
    const totalFloors = normalFloorCount + basementCount
    const newFloors: Floor[] = []
    let daireCounter = 1

    // Create basement floors
    for (let basement = basementCount - 1; basement >= 0; basement--) {
      const y = (normalFloorCount + basement) * floorHeight
      const apartments = []

      for (let apt = 0; apt < apartmentCount; apt++) {
        apartments.push({ number: daireCounter++ })
      }

      newFloors.push({
        y,
        isBasement: true,
        label: `${basement + 1}. Bodrum Kat`,
        apartmentCount,
        apartments,
      })
    }

    // Create normal floors
    for (let floor = normalFloorCount - 1; floor >= 0; floor--) {
      const y = floor * floorHeight
      const floorLabel = floor === normalFloorCount - 1 ? "Zemin Kat" : `${normalFloorCount - floor - 1}. Normal Kat`
      const apartments = []

      for (let apt = 0; apt < apartmentCount; apt++) {
        apartments.push({ number: daireCounter++ })
      }

      newFloors.push({
        y,
        isBasement: false,
        label: floorLabel,
        apartmentCount,
        apartments,
      })
    }

    setFloors(newFloors)
  }

  // Update apartment numbers when floor apartment counts change
  const recalculateApartmentNumbers = (updatedFloors: Floor[]) => {
    let daireCounter = 1
    return updatedFloors.map((floor) => {
      const updatedApartments = []
      for (let apt = 0; apt < floor.apartmentCount; apt++) {
        // Preserve custom apartment numbers if they exist
        if (apt < floor.apartments.length && typeof floor.apartments[apt].number === "string") {
          updatedApartments.push({ number: floor.apartments[apt].number })
        } else {
          updatedApartments.push({ number: daireCounter++ })
        }
      }
      return { ...floor, apartments: updatedApartments }
    })
  }

  // Only redraw canvas when floors change
  useEffect(() => {
    if (floors.length > 0) {
      redrawCanvas()
    }
  }, [floors])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Update canvas height based on total floors
    canvas.height = (normalFloorCount + basementCount) * floorHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 5
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    floors.forEach((floor) => {
      const aptWidth = (canvas.width - 150) / floor.apartmentCount
      ctx.strokeStyle = floor.isBasement ? "#666633" : "#333333"
      ctx.lineWidth = 1.5
      ctx.strokeRect(0, floor.y, canvas.width - 150, floorHeight)

      // Draw floor label area
      ctx.fillStyle = floor.isBasement ? "#80804d" : "#e6e6e6"
      ctx.fillRect(canvas.width - 150, floor.y, 150, floorHeight)
      ctx.strokeStyle = "#ccc"
      ctx.strokeRect(canvas.width - 150, floor.y, 150, floorHeight)
      ctx.fillStyle = "#333"
      ctx.textAlign = "center"
      if (floor.label === "Zemin Kat") {
        ctx.font = "bold 16px Roboto"
        ctx.fillText(floor.label, canvas.width - 75, floor.y + floorHeight / 2 + 6)
      } else {
        ctx.font = "14px Roboto"
        ctx.fillText(floor.label, canvas.width - 75, floor.y + floorHeight / 2 + 5)
      }

      // Draw apartments
      floor.apartments.forEach((apt, index) => {
        const x = index * aptWidth
        ctx.fillStyle = "#f5f5f5"
        ctx.fillRect(x, floor.y, aptWidth, floorHeight)
        ctx.strokeStyle = floor.isBasement ? "#666633" : "#333333"
        ctx.strokeRect(x, floor.y, aptWidth, floorHeight)

        ctx.fillStyle = "#555"
        ctx.font = "bold 14px Roboto"
        ctx.textAlign = "center"
        ctx.fillText(apt.number.toString(), x + aptWidth / 2, floor.y + floorHeight / 2 + 5)
      })
    })

    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Check if clicked on floor label area
    if (clickX >= canvas.width - 150) {
      for (let i = 0; i < floors.length; i++) {
        const floor = floors[i]
        if (clickY >= floor.y && clickY <= floor.y + floorHeight) {
          const newCount = prompt(
            `Bu katın daire sayısını girin (eski: ${floor.apartmentCount}):`,
            floor.apartmentCount.toString(),
          )
          if (newCount !== null && newCount !== "" && !isNaN(Number(newCount)) && Number.parseInt(newCount) > 0) {
            const updatedFloors = [...floors]
            updatedFloors[i] = { ...floor, apartmentCount: Number.parseInt(newCount) }
            // Recalculate apartment numbers after changing apartment count
            setFloors(recalculateApartmentNumbers(updatedFloors))
          }
          return
        }
      }
    }

    // Check if clicked on an apartment
    for (let i = 0; i < floors.length; i++) {
      const floor = floors[i]
      const aptWidth = (canvas.width - 150) / floor.apartmentCount
      for (let j = 0; j < floor.apartments.length; j++) {
        const apt = floor.apartments[j]
        const x = j * aptWidth
        if (clickX >= x && clickX <= x + aptWidth && clickY >= floor.y && clickY <= floor.y + floorHeight) {
          const newNumber = prompt(`Daire numarasını girin (eski: ${apt.number}):`, apt.number.toString())
          if (newNumber !== null && newNumber !== "") {
            const updatedFloors = [...floors]
            updatedFloors[i].apartments[j] = { ...apt, number: newNumber }
            setFloors(updatedFloors)
          }
          return
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 min-h-screen py-6 bg-gradient-to-b from-indigo-50 to-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-80 flex flex-col gap-5">
        <h2 className="text-xl font-bold text-gray-800">Daire No Formu</h2>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-700">Normal Kat Sayısı:</label>
          <span className="italic text-xs text-gray-500">(Zemin Kat dâhil)</span>
          <input
            type="number"
            min="1"
            value={normalFloorCount}
            onChange={(e) => setNormalFloorCount(Number.parseInt(e.target.value) || 1)}
            className="p-2.5 border border-gray-300 rounded-lg w-full text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-700">Bodrum Kat Sayısı:</label>
          <input
            type="number"
            min="0"
            value={basementCount}
            onChange={(e) => setBasementCount(Number.parseInt(e.target.value) || 0)}
            className="p-2.5 border border-gray-300 rounded-lg w-full text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-700">Kattaki Daire Sayısı (Varsayılan):</label>
          <input
            type="number"
            min="1"
            value={apartmentCount}
            onChange={(e) => setApartmentCount(Number.parseInt(e.target.value) || 1)}
            className="p-2.5 border border-gray-300 rounded-lg w-full text-sm"
          />
        </div>

        <button
          onClick={drawSection}
          className="p-3 bg-blue-500 text-white rounded-lg cursor-pointer text-base transition-colors hover:bg-blue-600 w-full"
        >
          Hazırla
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={450}
        height={0}
        onClick={handleCanvasClick}
        className="border border-gray-300 rounded-lg bg-gray-50 shadow-sm"
      />
    </div>
  )
}

