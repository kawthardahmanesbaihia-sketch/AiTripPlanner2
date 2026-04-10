'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, Download } from 'lucide-react';

export function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch('/api/hf-generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setImage(data.image);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('[v0] Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      generateImage();
    }
  };

  const downloadImage = () => {
    if (!image) return;

    const link = document.createElement('a');
    link.href = image;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 bg-card/50 backdrop-blur-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Image Generator</h2>
            <p className="text-sm text-muted-foreground">
              Generate beautiful images from text descriptions using Stable Diffusion
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <label htmlFor="prompt" className="block text-sm font-semibold">
              Image Prompt
            </label>
            <Input
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="bg-background/50 border-2"
            />
            <p className="text-xs text-muted-foreground">
              Be specific with details like style, colors, composition, and mood
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
            >
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </motion.div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating... (This may take 30-60 seconds)
              </>
            ) : (
              'Generate Image'
            )}
          </Button>

          {/* Generated Image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <div className="relative rounded-lg overflow-hidden border-2 border-primary/30 bg-background">
                <img
                  src={image}
                  alt="Generated image"
                  className="w-full h-auto"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
                <Button
                  onClick={() => {
                    setImage(null);
                    setPrompt('');
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Generate Another
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && !image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Generating your image...
                <br />
                This may take a minute or two
              </p>
            </motion.div>
          )}

          {/* Info Section */}
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              💡 Tip: More detailed prompts produce better results. Include style, mood, and composition details.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
