"use client";

import { FileUp, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardProps {
  onSelectWorkflow: (mode: 'full' | 'direct') => void;
}

export function Dashboard({ onSelectWorkflow }: DashboardProps) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Product Data Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your workflow to get started with AI-powered product approval
          </p>
        </div>

        {/* Workflow Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Full Workflow */}
          <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Full Workflow</CardTitle>
              <CardDescription className="text-base">
                Complete product data management with upload, preview, and AI justification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </span>
                  <span>Upload product files (Application, EG Form, Catalogue)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </span>
                  <span>Preview and verify extracted data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </span>
                  <span>Generate AI-powered approval justifications</span>
                </li>
              </ul>
              <Button 
                className="w-full gap-2 mt-6" 
                size="lg"
                onClick={() => onSelectWorkflow('full')}
              >
                Start Full Workflow
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Direct to Justification */}
          <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Direct Justification</CardTitle>
              <CardDescription className="text-base">
                Skip to AI justification generation for existing products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">✓</span>
                  </span>
                  <span>Bypass upload and preview stages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">✓</span>
                  </span>
                  <span>Work with pre-processed product data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">✓</span>
                  </span>
                  <span>Focus on approval decisions and justifications</span>
                </li>
              </ul>
              <Button 
                className="w-full gap-2 mt-6" 
                size="lg"
                variant="outline"
                onClick={() => onSelectWorkflow('direct')}
              >
                Go to Justification
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Need help choosing?</strong> Use the Full Workflow for new products that need data extraction. 
            Use Direct Justification when you already have processed product data and just need approval decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
