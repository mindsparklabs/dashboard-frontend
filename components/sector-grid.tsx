"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import type { Sector } from "@/lib/sectors";

export type SectorWithPreview = Sector & { preview: string | null };

const ROTATE_MS = 3000;

export function SectorGrid({ sectors }: { sectors: SectorWithPreview[] }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % sectors.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [sectors.length]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[22vh] gap-5 max-w-[1800px] mx-auto">
      {sectors.map((sector, index) => {
        const isFeatured = index === featuredIndex;
        const pulseDuration = 2.5 + (index % 4) * 0.6;
        const pulseDelay = index * 0.4;
        const waveDuration = 5 + (index % 3) * 1.2;
        const waveDelay = index * 0.6;
        const textColor = isFeatured
          ? sector.color
          : `color-mix(in srgb, ${sector.color} 40%, white)`;

        return (
          <motion.div
            key={sector.slug}
            layout
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className={
              isFeatured ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
            }
          >
            <Link href={`/sector/${sector.slug}`} className="block h-full w-full">
              <div
                className="h-full w-full rounded-3xl cursor-pointer hover:scale-[1.03] backdrop-blur-xl transition-transform duration-300"
                style={
                  isFeatured
                    ? {
                        border: `1.5px solid ${sector.color}`,
                        background: `linear-gradient(160deg, ${sector.color}30, ${sector.color}0a)`,
                        boxShadow: `0 0 35px ${sector.color}77, 0 0 80px ${sector.color}33, inset 0 1px 0 ${sector.color}44`,
                        animation: `pulseGlow ${pulseDuration}s ease-in-out ${pulseDelay}s infinite, waveGrow ${waveDuration}s ease-in-out ${waveDelay}s infinite`,
                      }
                    : {
                        border: `1px solid ${sector.color}44`,
                        background: `linear-gradient(160deg, ${sector.color}1c, ${sector.color}08)`,
                        boxShadow: `0 0 14px ${sector.color}33`,
                        animation: `waveGrow ${waveDuration}s ease-in-out ${waveDelay}s infinite`,
                      }
                }
              >
                <div className="h-full w-full flex flex-col items-center justify-center px-6 py-6 text-center gap-1">
                  <span
                    className={`transition-all duration-[900ms] ease-out ${
                      isFeatured
                        ? "text-3xl sm:text-4xl font-black leading-tight"
                        : "text-lg sm:text-xl font-extrabold leading-tight"
                    }`}
                    style={{
                      color: textColor,
                      textShadow: isFeatured ? `0 0 14px ${sector.color}` : "none",
                    }}
                  >
                    {sector.name}
                  </span>
                  {sector.preview && (
                    <span
                      className="w-full text-xs sm:text-sm font-medium opacity-70"
                      style={{
                        color: textColor,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sector.preview}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
