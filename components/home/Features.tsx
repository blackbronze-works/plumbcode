"use client";

import { motion } from "framer-motion";
import { AiFillRocket } from "react-icons/ai";
import { BsFillPaletteFill, BsStars } from "react-icons/bs";
import { FiZap, FiStar } from "react-icons/fi";
import Tag from "../ui/Tag";
import GradientText from "../ui/GradientText";
import Button from "../ui/Button";
import Link from "next/link";

const features = [
  {
    icon: BsStars,
    title: "AI-Powered Generation",
    desc: "Instantly generate clean components with natural language.",
  },
  {
    icon: FiZap,
    title: "Live Preview",
    desc: "See real-time updates as you tweak your code and design with just prompts.",
  },
  {
    icon: BsFillPaletteFill,
    title: "Custom Styling",
    desc: "Easily adjust color, layout, and motion — all within just prompts.",
  },
  {
    icon: FiStar,
    title: "Smart Suggestions",
    desc: "Right away, get improvements for UX, accessibility, and performance.",
  },
  {
    icon: AiFillRocket,
    title: "Deploy Ready",
    desc: "Export ready-to-use components straight into your Next.js or Vite project.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-20 text-white overflow-hidden"
    >
      <Tag>Features</Tag>
      <div className="max-w-6xl mx-auto text-center px-6">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-3"
        >
          Build Faster with <GradientText>LotusFlow</GradientText>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mb-12"
        >
          Everything you need to design, generate, and deploy components
        </motion.p>

        {/* Features */}
        <div className="flex-center gap-5 flex-wrap max-w-3xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative flex flex-col items-center justify-between
                         p-2 md:p-4 rounded-2xl bg-[#111] border border-white/10
                         size-44 md:size-60
                         shadow-[0_-4px_15px_-8px_#ec4899,0_-4px_15px_-8px_#a855f7]
                         hover:shadow-[0_-8px_25px_-6px_#ec4899,0_-8px_25px_-6px_#a855f7]
                         hover:border-pink-400/40
                         transition-all duration-300 backdrop-blur-sm"
            >
              {/* Icon Section (1/3 height) */}
              <div className="flex items-center justify-center h-auto md:h-1/3 mt-3">
                <div
                  className="flex-center rounded-full size-14 md:size-16
                             shadow-[0_-4px_15px_-8px_#ec4899,0_-4px_15px_-8px_#a855f7]
                             group-hover:shadow-[0_0px_25px_-6px_#ec4899,0_-8px_25px_-6px_#a855f7]
                             transition-all duration-300"
                >
                  <f.icon className="size-6 md:size-8 text-pink-400" />
                </div>
              </div>

              {/* Text Section */}
              <div className="flex flex-col justify-center flex-1 text-center">
                <h3 className="text-sm md:text-lg font-semibold mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-xs md:text-sm">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex-center py-4 mt-5">
        <Link href="/build">
          <Button>Try for free</Button>
        </Link>
      </div>
    </section>
  );
}
