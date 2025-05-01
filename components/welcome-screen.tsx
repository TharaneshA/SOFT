"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSearch, Folder, Zap, Brain, Lock } from "lucide-react"
import { motion } from "framer-motion"

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-background/80">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <span className="text-supabase-500">SOFT</span>
          <span className="bg-supabase-500 text-white text-xs px-2 py-0.5 rounded-full">Beta</span>
        </h1>
        <p className="text-xl text-muted-foreground">Semantic File Search</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mb-8"
      >
        <FeatureCard
          icon={<FileSearch className="h-8 w-8 text-supabase-500" />}
          title="Natural Language Search"
          description="Find files using everyday language like 'Show me my resume' or 'Find that report about climate change'"
        />
        <FeatureCard
          icon={<Brain className="h-8 w-8 text-supabase-500" />}
          title="Semantic Understanding"
          description="SOFT understands the meaning behind your queries, not just keywords"
        />
        <FeatureCard
          icon={<Lock className="h-8 w-8 text-supabase-500" />}
          title="Privacy First"
          description="All processing happens locally on your device - your files never leave your computer"
        />
        <FeatureCard
          icon={<Zap className="h-8 w-8 text-supabase-500" />}
          title="Lightning Fast"
          description="Optimized for speed with Rust and vector search technology"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <Button size="lg" className="bg-supabase-500 hover:bg-supabase-600" onClick={onGetStarted}>
          <Folder className="mr-2 h-5 w-5" />
          Get Started
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Start by selecting folders to index or searching your files
        </p>
      </motion.div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
