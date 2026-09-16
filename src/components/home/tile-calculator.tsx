"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ADHESIVE_COVERAGE_M2_PER_BAG = 5;

export function TileCalculator() {
  const [roomWidth, setRoomWidth] = useState("4.5");
  const [roomLength, setRoomLength] = useState("3.2");
  const [tileSize, setTileSize] = useState("600x600");
  const [includeWaste, setIncludeWaste] = useState(true);

  const result = useMemo(() => {
    const width = Math.max(0, Number(roomWidth) || 0);
    const length = Math.max(0, Number(roomLength) || 0);
    const [tw, tl] = tileSize.split("x").map(Number);
    const rawAreaM2 = width * length;
    const totalAreaM2 = rawAreaM2 * (includeWaste ? 1.1 : 1);
    const tileAreaM2 = ((tw || 1) / 1000) * ((tl || 1) / 1000);
    const tilesNeeded = tileAreaM2 > 0 ? Math.ceil(Number((totalAreaM2 / tileAreaM2).toFixed(6))) : 0;
    const adhesiveBags = Math.ceil(Number((totalAreaM2 / ADHESIVE_COVERAGE_M2_PER_BAG).toFixed(6)));
    return { totalAreaM2, tilesNeeded, adhesiveBags };
  }, [roomWidth, roomLength, tileSize, includeWaste]);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-surface-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.05)] sm:p-6 lg:min-h-[416px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </span>
          <div>
            <h3 className="text-[20px] leading-7 font-bold text-graphite-900">Tile &amp; Adhesive Calculator</h3>
            <p className="text-label-sm font-label-sm text-text-secondary">Wall &amp; Floor standard surface estimation</p>
          </div>
        </div>
        <span className="shrink-0 rounded bg-surface-container-low px-2.5 py-1 text-label-sm font-label-sm font-semibold text-graphite-900">Metric (m)</span>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 min-[400px]:grid-cols-2">
        <div>
          <Label htmlFor="room-width" className="mb-1 text-label-sm font-label-sm font-semibold text-graphite-900">
            Room Width (m)
          </Label>
          <Input
            id="room-width"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={roomWidth}
            onChange={(e) => setRoomWidth(e.target.value)}
            className="h-11 rounded-lg border-0 bg-surface-container-low px-3 text-[12px] font-semibold text-graphite-900"
          />
        </div>
        <div>
          <Label htmlFor="room-length" className="mb-1 text-label-sm font-label-sm font-semibold text-graphite-900">
            Room Length (m)
          </Label>
          <Input
            id="room-length"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={roomLength}
            onChange={(e) => setRoomLength(e.target.value)}
            className="h-11 rounded-lg border-0 bg-surface-container-low px-3 text-[12px] font-semibold text-graphite-900"
          />
        </div>
        <div>
          <Label htmlFor="tile-size" className="mb-1 text-label-sm font-label-sm font-semibold text-graphite-900">
            Tile Size
          </Label>
          <div className="relative">
            <select
              id="tile-size"
              value={tileSize}
              onChange={(e) => setTileSize(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border-0 bg-surface-container-low px-3 pr-8 text-[12px] font-semibold text-graphite-900"
            >
              <option value="600x600">600mm x 600mm</option>
              <option value="600x300">600mm x 300mm</option>
              <option value="300x300">300mm x 300mm</option>
              <option value="200x100">200mm x 100mm (metro)</option>
            </select>
            <span aria-hidden className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-text-secondary">
              expand_more
            </span>
          </div>
        </div>
        <div>
          <p className="mb-1 text-label-sm font-label-sm font-semibold text-graphite-900">Include 10% Waste</p>
          <label htmlFor="include-waste" className="flex min-h-11 items-center gap-2 text-label-sm font-label-sm text-graphite-900">
            <Checkbox id="include-waste" checked={includeWaste} onCheckedChange={(checked) => setIncludeWaste(checked === true)} />
            Add 10% cutting reserve
          </label>
        </div>
      </div>

      <div className="mt-4 mb-8 flex items-center justify-between gap-4 rounded-2xl bg-orange-50 p-4">
        <div>
          <p className="text-label-sm font-label-sm text-orange-700">Total Tiles Required:</p>
          <p className="text-headline-md font-headline-md font-bold text-orange-600">{result.tilesNeeded} Tiles</p>
          <p className="text-label-sm font-label-sm text-orange-700">Total Area: {result.totalAreaM2.toFixed(2)} m² {includeWaste ? '(inc. waste)' : '(excl. waste)'}</p>
        </div>
        <div className="text-right">
          <p className="text-label-sm font-label-sm text-text-secondary">Adhesive Required:</p>
          <p className="text-body-md font-body-md font-bold text-graphite-900">{result.adhesiveBags} x 20kg Bags</p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <p className="text-label-sm font-label-sm text-text-secondary">Instant SKU pack adder available</p>
        <Button
          type="button"
          className="h-8 rounded-lg bg-orange-500 px-5 text-[12px] font-bold hover:bg-orange-600"
          onClick={() => toast.success(`Added ${result.adhesiveBags} bags of adhesive to your cart estimate`)}
        >
          Add All to Basket
        </Button>
      </div>
    </div>
  );
}
