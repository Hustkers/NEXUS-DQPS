"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Database,
  ChartLineUp,
  Lightning,
  ShieldCheck,
  Rocket,
  CaretRight,
} from "@phosphor-icons/react";
import { IsometricBox01 } from "@/components/ui/isometric-box-01";
import { IsometricBoxes02 } from "@/components/ui/isometric-boxes-02";
import { cn } from "@/lib/utils";

export interface BentoAvatarMember {
  id?: string;
  name: string;
  image: string;
}

export const DEFAULT_BENTO_TEAM_MEMBERS: BentoAvatarMember[] = [
  {
    name: "Jay Gopal Tripathy",
    image: "/team/jay-gopal.webp",
  },
  {
    name: "Shivam Kumar",
    image: "https://github.com/shi-ivam.png",
  },
  {
    name: "Abhishek",
    image: "https://github.com/Abhishek-singh06.png",
  },
  {
    name: "Pragyan Jain",
    image: "https://github.com/pragyan43jain.png",
  },
  {
    name: "Anushree Tiwari",
    image: "https://github.com/anuut1.png",
  },
  {
    name: "Garv Gupta",
    image: "https://github.com/garv2412.png",
  },
];

const PIPELINE_STEPS = [
  { id: "01", label: "INGEST", Icon: Database },
  { id: "02", label: "DIAGNOSE", Icon: ChartLineUp },
  { id: "03", label: "SOLVE", Icon: Lightning },
  { id: "04", label: "GUARD", Icon: ShieldCheck },
  { id: "05", label: "ACTUATE", Icon: Rocket },
];

export interface WhyUsBentoProps {
  className?: string;
  teamAvatars?: (string | BentoAvatarMember)[];
}

export function WhyUsBento({
  className,
  teamAvatars = DEFAULT_BENTO_TEAM_MEMBERS,
}: WhyUsBentoProps) {
  const normalizedAvatars: BentoAvatarMember[] = teamAvatars.map((item, idx) => {
    if (typeof item === "string") {
      return { name: `Team Member ${idx + 1}`, image: item };
    }
    return item;
  });

  return (
    <section className={cn("py-12 sm:py-16 relative z-10 w-full", className)}>
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex flex-col gap-6 sm:gap-8">
        {/* Bold Statement Header: Spans left to right across the website */}
        <div className="w-full mb-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-border/60">
            <div className="space-y-2 max-w-5xl">
              <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]">
                <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                ENTERPRISE ADVANTAGE
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight text-foreground uppercase leading-[1.06]">
                Why High-Growth Brands Run on NEXUS
              </h2>
            </div>
            <div className="font-mono text-[11px] sm:text-xs text-muted-foreground tracking-widest uppercase shrink-0 pb-1">
              [ DETERMINISTIC SCALING &bull; ROAS PROTECTION ]
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-auto">
          {/* 01: AI & Autonomous Control (Wide) */}
          <motion.div
            initial="initial"
            whileHover="hover"
            className="col-span-1 md:col-span-2 row-span-1 rounded-2xl bg-card border border-border/70 backdrop-blur-md p-6 sm:p-7 md:p-8 relative overflow-hidden group transition-all duration-500 flex flex-col justify-center min-h-[180px] sm:min-h-[200px] shadow-sm hover:border-primary/40 hover:shadow-lg"
          >
            {/* Visual: Isometric Box on the right */}
            <div className="absolute right-2 sm:right-6 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 w-40 sm:w-52 md:w-64 lg:w-72 z-20 hidden sm:block pointer-events-none opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500">
              <IsometricBox01 className="w-full h-auto" />
            </div>

            <div className="relative z-30 w-full sm:w-3/5 md:w-3/5">
              <h3 className="text-xl sm:text-2xl font-orbitron font-bold text-foreground mb-2 relative overflow-hidden flex flex-wrap">
                <span className="flex">
                  {"AI & Autonomous Control".split("").map((l, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      variants={{
                        initial: { y: 0 },
                        hover: { y: "-100%" },
                      }}
                      transition={{ duration: 0.3, delay: i * 0.02, ease: [0.33, 1, 0.68, 1] }}
                    >
                      {l === " " ? "\u00A0" : l}
                    </motion.span>
                  ))}
                </span>
                <span className="absolute inset-0 flex text-emerald-500 dark:text-[#39FF14] pointer-events-none" aria-hidden>
                  {"AI & Autonomous Control".split("").map((l, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      variants={{
                        initial: { y: "100%" },
                        hover: { y: 0 },
                      }}
                      transition={{ duration: 0.3, delay: i * 0.02, ease: [0.33, 1, 0.68, 1] }}
                    >
                      {l === " " ? "\u00A0" : l}
                    </motion.span>
                  ))}
                </span>
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">
                Deterministic dual-engine intelligence that neutralizes ad fatigue, halts ROAS collapse, and dynamically shifts capital across Meta, Google, and TikTok.
              </p>
            </div>
            
            {/* Watermark Number */}
            <div className="absolute -right-3 -bottom-8 text-[7rem] sm:text-[9rem] font-orbitron font-black text-muted/30 pointer-events-none group-hover:scale-105 transition-transform duration-700 leading-none select-none z-10">
              01
            </div>
          </motion.div>

          {/* 02: Real-time Circuit (Tall & Dark) */}
          <div className="col-span-1 md:col-span-1 row-span-1 md:row-span-2 rounded-2xl border border-neutral-800 bg-[#07090e] p-6 sm:p-7 relative overflow-hidden group transition-all duration-500 flex flex-col justify-between text-white min-h-[320px] sm:min-h-[380px] shadow-sm hover:border-emerald-500/40">
            {/* Visual: Stacked Cards */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[140px] sm:min-h-[170px] mb-4 translate-x-1">
              <div className="relative w-full max-w-[180px] sm:max-w-[210px] aspect-4/3 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300 ease-out">
                {/* Back card 4 */}
                <div className="absolute inset-0 bg-neutral-700 rounded-xl border border-neutral-600/50 transform -rotate-12 -translate-x-3 translate-y-3 shadow-xl transition-all duration-300 ease-out group-hover:rotate-[-20deg] group-hover:-translate-x-6 group-hover:translate-y-6" />
                {/* Back card 3 */}
                <div className="absolute inset-0 bg-neutral-600 rounded-xl border border-neutral-500/50 transform -rotate-9 -translate-x-2.5 translate-y-2.5 shadow-xl transition-all duration-300 ease-out group-hover:rotate-[-15deg] group-hover:-translate-x-5 group-hover:translate-y-5" />
                {/* Back card 2 */}
                <div className="absolute inset-0 bg-neutral-400 rounded-xl border border-neutral-300/50 transform -rotate-6 -translate-x-1.5 translate-y-1.5 shadow-xl transition-all duration-300 ease-out group-hover:rotate-[-10deg] group-hover:-translate-x-3 group-hover:translate-y-3" />
                {/* Back card 1 */}
                <div className="absolute inset-0 bg-neutral-200 rounded-xl border border-neutral-100 transform -rotate-3 -translate-x-1 translate-y-1 shadow-xl transition-all duration-300 ease-out group-hover:-rotate-5 group-hover:-translate-x-1.5 group-hover:translate-y-1.5" />

                {/* Front card */}
                <div
                  className="absolute inset-0 bg-white rounded-xl p-4 flex flex-col justify-between text-black shadow-2xl border border-white/60"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
                    backgroundSize: "10px 10px",
                  }}
                >
                  <div className="flex gap-1 items-center">
                    <div className="w-2.5 h-3 bg-emerald-500 rounded-xs" />
                    <div className="w-1.5 h-3 bg-black rounded-xs" />
                    <div className="w-1 h-3 bg-black/40 rounded-xs" />
                  </div>

                  <div className="font-mono text-[16px] sm:text-[18px] md:text-[20px] font-bold leading-tight tracking-tight mt-auto mb-2 text-neutral-950">
                    Telemetry.
                    <br />
                    Convex Solver.
                    <br />
                    Production.
                  </div>

                  <div className="font-mono text-[8px] sm:text-[9px] text-neutral-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="text-emerald-600 font-extrabold">&gt; SUB-15M SLA CIRCUIT</span>
                    <span className="animate-pulse text-emerald-600">_</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-orbitron font-bold text-white mb-1.5">
                Telemetry to Execution
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                From real-time attribution and stockout signals to closed-loop budget deployment across Meta, Google, and TikTok under microsecond safety circuits.
              </p>
            </div>
            {/* Watermark Number */}
            <div className="absolute -right-6 -bottom-12 text-[9rem] sm:text-[11rem] font-orbitron font-black text-neutral-800/20 pointer-events-none group-hover:scale-105 transition-transform duration-700 leading-none select-none">
              02
            </div>
          </div>

          {/* 03: Built by Systems Engineers */}
          <motion.div
            initial="initial"
            whileHover="hover"
            className="col-span-1 md:col-span-1 row-span-1 rounded-2xl bg-card border border-border/70 backdrop-blur-md p-6 sm:p-7 relative overflow-hidden group transition-all duration-500 flex flex-col justify-between min-h-[170px] sm:min-h-[190px] shadow-sm hover:border-primary/40 hover:shadow-lg"
          >
            {/* Stacked avatars */}
            <div className="flex items-center relative z-10 mb-4 h-9 sm:h-11">
              {normalizedAvatars.map((member, i) => (
                <motion.div
                  key={member.name || i}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-background shadow-md cursor-pointer group/avatar"
                  style={{
                    marginLeft: i === 0 ? 0 : "-10px",
                    zIndex: normalizedAvatars.length - i,
                  }}
                  variants={{
                    initial: { x: 0, y: 0, rotate: 0, scale: 1 },
                    hover: {
                      x: i * 13,
                      y: i % 2 === 0 ? -4 : 4,
                      rotate: (i - 2) * 5,
                      scale: 1.15,
                    },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    bounce: 0,
                  }}
                  title={member.name}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                    unoptimized
                  />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-orbitron font-bold text-foreground mb-1.5">
                Built by Systems Engineers
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Architected by full-stack systems & quant engineers: Jay Gopal Tripathy, Shivam Kumar, Abhishek, Pragyan Jain, Anushree Tiwari, and Garv Gupta.
              </p>
            </div>
            <div className="absolute -right-3 -bottom-8 text-[6rem] sm:text-[8rem] font-orbitron font-black text-muted/30 pointer-events-none group-hover:scale-105 transition-transform duration-700 leading-none select-none">
              03
            </div>
          </motion.div>

          {/* 04: Zero Human Bottlenecks */}
          <motion.div
            initial="initial"
            whileHover="hover"
            className="col-span-1 md:col-span-1 row-span-1 rounded-2xl bg-card border border-border/70 backdrop-blur-md p-6 sm:p-7 relative overflow-hidden group transition-all duration-500 flex flex-col justify-between min-h-[170px] sm:min-h-[190px] shadow-sm hover:border-primary/40 hover:shadow-lg"
          >
            {/* Pipeline visual */}
            <div className="relative z-10 w-full mb-3 pt-1">
              <div className="flex items-center justify-between">
                {PIPELINE_STEPS.map(({ id, label, Icon }, i) => (
                  <React.Fragment key={id}>
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <Icon size={20} weight="fill" className="text-foreground sm:w-5 sm:h-5" />
                        {i === PIPELINE_STEPS.length - 1 && (
                          <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping" />
                        )}
                      </div>
                      <span className="text-[6.5px] sm:text-[7.5px] text-muted-foreground font-mono font-bold tracking-widest">
                        {label}
                      </span>
                    </div>

                    {i < PIPELINE_STEPS.length - 1 && (
                      <div className="text-muted-foreground/40 group-hover:text-primary transition-colors duration-300">
                        <CaretRight size={10} weight="bold" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-orbitron font-bold text-foreground mb-1.5">
                Zero Human Bottlenecks
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Autonomous closed-loop lifecycle. Ingestion, causal DAG diagnosis, convex optimization, safety guardrails, and automated API execution.
              </p>
            </div>
            <div className="absolute -right-3 -bottom-8 text-[6rem] sm:text-[8rem] font-orbitron font-black text-muted/30 pointer-events-none group-hover:scale-105 transition-transform duration-700 leading-none select-none">
              04
            </div>
          </motion.div>

          {/* 05: Deep Full-Stack Infrastructure (Wide Bottom) */}
          <motion.div
            initial="initial"
            whileHover="hover"
            className="col-span-1 md:col-span-3 row-span-1 min-h-[170px] sm:min-h-[190px] rounded-2xl bg-card border border-border/70 backdrop-blur-md p-6 sm:p-7 md:p-8 relative overflow-hidden group transition-all duration-500 flex flex-col justify-center shadow-sm hover:border-primary/40 hover:shadow-lg"
          >
            {/* Visual: Isometric Layered Boxes on the right */}
            <div className="absolute right-4 sm:right-6 md:right-10 lg:right-16 bottom-0 w-36 sm:w-56 md:w-72 lg:w-80 z-20 hidden sm:block pointer-events-none opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500">
              <IsometricBoxes02 className="w-full h-auto drop-shadow-xs" />
            </div>

            <div className="relative z-30 w-full sm:w-3/5 md:w-3/5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-orbitron font-bold text-foreground mb-2">
                Deep Full-Stack Infrastructure
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed md:max-w-xl">
                High-frequency ad-network telemetry ingestion, deterministic integer programming, multi-tenant RBAC, and sub-second decision ledgers.
              </p>
            </div>

            {/* Watermark Number */}
            <div className="absolute -right-6 -bottom-12 text-[8rem] sm:text-[11rem] font-orbitron font-black text-muted/30 pointer-events-none group-hover:scale-105 transition-transform duration-700 leading-none select-none z-10">
              05
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsBento;
