import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "@/components/ui/premium-card";
import { PremiumUpload, PremiumFilePreview, PremiumProgressBar } from "@/components/ui/premium-upload";
import { PremiumTextarea } from "@/components/ui/premium-form";
import { GradientButton, GlassButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, UploadIcon, WandIcon, EyeIcon, LoaderIcon, SparklesIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ImageTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedTheme, themeConfig } = useAdvancedTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text to Image states
  const [textPrompt, setTextPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Debug log for generatedImage state changes
  React.useEffect(() => {
    console.log('generatedImage state changed to:', generatedImage);
  }, [generatedImage]);

  // Image to Text states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Image to Image states
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);

  const handleTestImage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/test-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          prompt: textPrompt || 'test image'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test image response:', data);
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Test Image Generated! 🎨",
          description: "Test image loaded successfully.",
        });
      } else {
        throw new Error('Failed to generate test image');
      }
    } catch (error) {
      console.error('Test image error:', error);
      toast({
        title: "Test Failed",
        description: "Could not generate test image.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextToImage = async () => {
    if (!textPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a text prompt to generate an image.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          prompt: textPrompt,
          type: 'text-to-image'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Image generation response:', data);

        // Validate the imageUrl before setting it
        if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.startsWith('http')) {
          console.log('Setting generated image to:', data.imageUrl);
          setGeneratedImage(data.imageUrl);
          console.log('Generated image state should now be:', data.imageUrl);
          toast({
            title: "Image Generated! 🎨",
            description: "Your image has been successfully generated.",
          });
        } else {
          console.error('Invalid imageUrl received:', data.imageUrl);
          console.log('imageUrl type:', typeof data.imageUrl);
          console.log('imageUrl starts with http:', data.imageUrl?.startsWith('http'));
          throw new Error('Invalid image URL received from server');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Response not ok:', response.status, response.statusText, errorData);
        throw new Error(errorData.message || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Text to image error:', error);
      // Use a better fallback image
      const fallbackImage = `https://picsum.photos/512/512?random=${Date.now()}`;
      setGeneratedImage(fallbackImage);
      toast({
        title: "Using Demo Image",
        description: "Generated a demo image for testing. The AI service may be temporarily unavailable.",
        variant: "default"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'ocr' | 'transform') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'ocr') {
          setUploadedImage(imageUrl);
        } else {
          setSourceImage(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageToText = async () => {
    if (!uploadedImage) {
      toast({
        title: "Error",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/image-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          imageData: uploadedImage,
          type: 'ocr-analysis'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.extractedText);
        setAiExplanation(data.explanation);
        toast({
          title: "Image Analyzed! 🔍",
          description: "Text extracted and explanation generated.",
        });
      } else {
        throw new Error('Failed to analyze image');
      }
    } catch (error) {
      console.error('Image to text error:', error);
      // Show actual error instead of demo fallback
      setExtractedText("Error: Failed to extract text from image.");
      setAiExplanation("There was an error processing your image. Please check your internet connection and try again. If the problem persists, the image might not contain readable text or the OCR service might be temporarily unavailable.");
      toast({
        title: "OCR Error",
        description: "Failed to extract text from image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageToImage = async () => {
    if (!sourceImage || !imagePrompt.trim()) {
      toast({
        title: "Error",
        description: "Please upload an image and provide a transformation prompt.",
        variant: "destructive"
      });
      return;
    }

    setIsTransforming(true);
    try {
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          sourceImage: sourceImage,
          prompt: imagePrompt,
          type: 'image-to-image'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Image transformation response:', data);

        // Validate the imageUrl before setting it
        if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.startsWith('http')) {
          setTransformedImage(data.imageUrl);
          toast({
            title: "Image Transformed! ✨",
            description: "Your image has been successfully transformed with Starry AI.",
          });
        } else {
          console.error('Invalid imageUrl received:', data.imageUrl);
          throw new Error('Invalid image URL received from server');
        }
      } else {
        throw new Error('Failed to transform image');
      }
    } catch (error) {
      console.error('Image to image error:', error);
      // Fallback with placeholder
      setTransformedImage('https://via.placeholder.com/512x512/10b981/ffffff?text=Transformed+Image');
      toast({
        title: "Transformation Error",
        description: "Failed to transform image. Please try again or check your prompt.",
        variant: "destructive"
      });
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Image Tools | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="AI-powered image tools: generate images from text, extract text from images, and transform images with AI." />
      </Helmet>

      <div className="space-y-6">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="p-4 gradient-primary rounded-2xl shadow-glow animate-float">
              <ImageIcon size={40} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              AI Image Tools
            </h1>
          </motion.div>
          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Generate, analyze, and transform images with Starry AI and advanced OCR technology
          </motion.p>

          {/* Feature badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Badge variant="secondary" className="glass-card px-4 py-2">
              <SparklesIcon size={16} className="mr-2" />
              Starry AI Powered
            </Badge>
            <Badge variant="secondary" className="glass-card px-4 py-2">
              <EyeIcon size={16} className="mr-2" />
              Advanced OCR
            </Badge>
            <Badge variant="secondary" className="glass-card px-4 py-2">
              <WandIcon size={16} className="mr-2" />
              Image Transformation
            </Badge>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="text-to-image" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="text-to-image">Text to Image</TabsTrigger>
            <TabsTrigger value="image-to-text">Image to Text</TabsTrigger>
            <TabsTrigger value="image-to-image">Image to Image</TabsTrigger>
          </TabsList>

          {/* Premium Text to Image */}
          <TabsContent value="text-to-image">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PremiumCard variant="glass" glow={true}>
                <PremiumCardHeader>
                  <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <WandIcon size={24} className="text-purple-500" />
                    </div>
                    Text to Image Generation
                  </PremiumCardTitle>
                  <p className="text-muted-foreground text-base">
                    Generate high-quality images from text descriptions using Starry AI
                  </p>
                </PremiumCardHeader>
                <PremiumCardContent className="space-y-6">
                  <PremiumTextarea
                    label="Describe the image you want to generate"
                    placeholder="e.g., A detailed diagram of the water cycle with labels, educational style"
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    rows={4}
                    variant="glass"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GradientButton
                      gradient="primary"
                      onClick={handleTextToImage}
                      disabled={isGenerating || !textPrompt.trim()}
                      size="lg"
                      className="shadow-glow"
                    >
                      {isGenerating ? (
                        <>
                          <LoaderIcon size={18} className="mr-2 animate-spin" />
                          Generating with Starry AI...
                        </>
                      ) : (
                        <>
                          <WandIcon size={18} className="mr-2" />
                          Generate Image
                        </>
                      )}
                    </GradientButton>

                    <GlassButton
                      onClick={handleTestImage}
                      disabled={isGenerating}
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <LoaderIcon size={18} className="mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={18} className="mr-2" />
                          Test Generation
                        </>
                      )}
                    </GlassButton>
                  </div>

                  <AnimatePresence>
                    {generatedImage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mt-8"
                      >
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                          <SparklesIcon size={20} className="text-primary" />
                          Generated Image:
                        </h3>
                        <PremiumCard variant="glass" className="p-4 overflow-hidden">
                          <div className="relative group">
                            <motion.img
                              src={generatedImage}
                              alt="Generated"
                              className="w-full max-w-lg mx-auto block rounded-xl shadow-premium"
                              onLoad={() => console.log('Image loaded successfully:', generatedImage)}
                              onError={(e) => {
                                console.error('Image failed to load:', e, generatedImage);
                                const imgElement = e.target as HTMLImageElement;
                                if (imgElement && !imgElement.src.includes('?cache=')) {
                                  imgElement.src = `${generatedImage}?cache=${Date.now()}`;
                                }
                              }}
                              style={{
                                minHeight: '200px',
                                objectFit: 'contain',
                                backgroundColor: 'transparent'
                              }}
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.3 }}
                            />

                            {/* Overlay with download button */}
                            <motion.div
                              className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={false}
                            >
                              <GlassButton
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = generatedImage;
                                  link.download = 'generated-image.png';
                                  link.click();
                                }}
                                className="shadow-glow"
                              >
                                <UploadIcon size={18} className="mr-2" />
                                Download
                              </GlassButton>
                            </motion.div>
                          </div>
                        </PremiumCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </TabsContent>

          {/* Premium Image to Text (OCR) */}
          <TabsContent value="image-to-text">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PremiumCard variant="glass" glow={true}>
                <PremiumCardHeader>
                  <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <EyeIcon size={24} className="text-blue-500" />
                    </div>
                    Image to Text Analysis
                  </PremiumCardTitle>
                  <p className="text-muted-foreground text-base">
                    Extract text from images and get AI explanations with advanced OCR
                  </p>
                </PremiumCardHeader>
                <PremiumCardContent className="space-y-6">
                  {!uploadedImage ? (
                    <PremiumUpload
                      onFileSelect={(files) => {
                        const file = files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setUploadedImage(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      accept="image/*"
                      variant="image"
                      maxSize={10}
                      className="mb-6"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <PremiumCard variant="glass" className="p-4">
                        <div className="relative group">
                          <img
                            src={uploadedImage}
                            alt="Uploaded"
                            className="max-w-full max-h-64 mx-auto rounded-xl shadow-premium"
                          />
                          <motion.button
                            className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setUploadedImage(null)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ×
                          </motion.button>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  )}

                  <GradientButton
                    gradient="blue"
                    onClick={handleImageToText}
                    disabled={isProcessing || !uploadedImage}
                    size="lg"
                    className="w-full shadow-glow-blue"
                  >
                    {isProcessing ? (
                      <>
                        <LoaderIcon size={18} className="mr-2 animate-spin" />
                        Analyzing with OCR...
                      </>
                    ) : (
                      <>
                        <EyeIcon size={18} className="mr-2" />
                        Analyze Image
                      </>
                    )}
                  </GradientButton>

                  <AnimatePresence>
                    {extractedText && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6 mt-8"
                      >
                        <div>
                          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                            <EyeIcon size={20} className="text-blue-500" />
                            Extracted Text:
                          </h3>
                          <PremiumCard variant="glass" className="p-4">
                            <div className="glass-card p-4 rounded-xl bg-muted/20">
                              <p className="text-sm font-mono leading-relaxed">{extractedText}</p>
                            </div>
                          </PremiumCard>
                        </div>

                        {aiExplanation && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                              <SparklesIcon size={20} className="text-primary" />
                              AI Explanation:
                            </h3>
                            <PremiumCard variant="glass" className="p-4">
                              <div className="glass-card p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <p className="text-sm leading-relaxed">{aiExplanation}</p>
                              </div>
                            </PremiumCard>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </TabsContent>

          {/* Premium Image to Image */}
          <TabsContent value="image-to-image">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PremiumCard variant="glass" glow={true}>
                <PremiumCardHeader>
                  <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <ImageIcon size={24} className="text-green-500" />
                    </div>
                    Image to Image Transformation
                  </PremiumCardTitle>
                  <p className="text-muted-foreground text-base">
                    Transform images based on text prompts using Starry AI
                  </p>
                </PremiumCardHeader>
                <PremiumCardContent className="space-y-6">
                  {!sourceImage ? (
                    <PremiumUpload
                      onFileSelect={(files) => {
                        const file = files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setSourceImage(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      accept="image/*"
                      variant="image"
                      maxSize={10}
                      className="mb-6"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <PremiumCard variant="glass" className="p-4">
                        <div className="relative group">
                          <img
                            src={sourceImage}
                            alt="Source"
                            className="max-w-full max-h-64 mx-auto rounded-xl shadow-premium"
                          />
                          <motion.button
                            className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSourceImage(null)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ×
                          </motion.button>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  )}

                  <PremiumTextarea
                    label="Transformation prompt"
                    placeholder="e.g., Convert this diagram to a colorful, cartoon style"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={3}
                    variant="glass"
                  />

                  <GradientButton
                    gradient="green"
                    onClick={handleImageToImage}
                    disabled={isTransforming || !sourceImage || !imagePrompt.trim()}
                    size="lg"
                    className="w-full shadow-glow-green"
                  >
                    {isTransforming ? (
                      <>
                        <LoaderIcon size={18} className="mr-2 animate-spin" />
                        Transforming with Starry AI...
                      </>
                    ) : (
                      <>
                        <WandIcon size={18} className="mr-2" />
                        Transform Image
                      </>
                    )}
                  </GradientButton>

                  <AnimatePresence>
                    {transformedImage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mt-8"
                      >
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                          <SparklesIcon size={20} className="text-green-500" />
                          Transformation Results:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <PremiumCard variant="glass" className="p-4">
                            <p className="text-sm font-medium text-muted-foreground mb-3">Original:</p>
                            <div className="relative group">
                              <img
                                src={sourceImage}
                                alt="Original"
                                className="w-full rounded-xl shadow-premium"
                              />
                            </div>
                          </PremiumCard>

                          <PremiumCard variant="glass" className="p-4">
                            <p className="text-sm font-medium text-muted-foreground mb-3">Transformed:</p>
                            <div className="relative group">
                              <motion.img
                                src={transformedImage}
                                alt="Transformed"
                                className="w-full rounded-xl shadow-premium"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                              />

                              {/* Overlay with download button */}
                              <motion.div
                                className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={false}
                              >
                                <GlassButton
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = transformedImage;
                                    link.download = 'transformed-image.png';
                                    link.click();
                                  }}
                                  className="shadow-glow"
                                >
                                  <UploadIcon size={18} className="mr-2" />
                                  Download
                                </GlassButton>
                              </motion.div>
                            </div>
                          </PremiumCard>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

// Theme-aware styling functions for image tools
const getThemeAwareImageCardClasses = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'border-blue-400/20 hover:border-blue-400/40';
    case 'forest-green':
      return 'border-green-400/20 hover:border-green-400/40';
    case 'sunset-orange':
      return 'border-orange-400/20 hover:border-orange-400/40';
    case 'purple-galaxy':
      return 'border-purple-400/20 hover:border-purple-400/40';
    case 'minimalist-gray':
      return 'border-gray-400/20 hover:border-gray-400/40';
    default:
      return 'border-primary/20 hover:border-primary/40';
  }
};

const getThemeAwareImageShadow = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'hover:shadow-glow-blue';
    case 'forest-green':
      return 'hover:shadow-glow-green';
    case 'sunset-orange':
      return 'hover:shadow-glow-orange';
    case 'purple-galaxy':
      return 'hover:shadow-glow';
    case 'minimalist-gray':
      return 'hover:shadow-lg';
    default:
      return 'hover:shadow-glow';
  }
};

export default ImageTools;
