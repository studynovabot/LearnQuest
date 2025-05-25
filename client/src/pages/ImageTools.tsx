import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, UploadIcon, WandIcon, EyeIcon, LoaderIcon } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ImageTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
        console.error('Response not ok:', response.status, response.statusText);
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Text to image error:', error);
      // Fallback with placeholder
      setGeneratedImage('https://via.placeholder.com/512x512/6366f1/ffffff?text=Generated+Image');
      toast({
        title: "Demo Mode",
        description: "Image generation is in demo mode. Real generation will be available soon!",
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
            description: "Your image has been successfully transformed.",
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
        title: "Demo Mode",
        description: "Image transformation is in demo mode. Real transformation will be available soon!",
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <ImageIcon size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">AI Image Tools</h1>
          </div>
          <p className="text-muted-foreground">
            Generate, analyze, and transform images with AI-powered tools
          </p>
        </motion.div>

        <Tabs defaultValue="text-to-image" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="text-to-image">Text to Image</TabsTrigger>
            <TabsTrigger value="image-to-text">Image to Text</TabsTrigger>
            <TabsTrigger value="image-to-image">Image to Image</TabsTrigger>
          </TabsList>

          {/* Text to Image */}
          <TabsContent value="text-to-image">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WandIcon size={24} />
                  Text to Image Generation
                </CardTitle>
                <p className="text-muted-foreground">
                  Generate images from text descriptions using AI
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Describe the image you want to generate:
                  </label>
                  <Textarea
                    placeholder="e.g., A detailed diagram of the water cycle with labels, educational style"
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleTextToImage}
                  disabled={isGenerating || !textPrompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <LoaderIcon size={16} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <WandIcon size={16} className="mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                  >
                    <h3 className="font-semibold mb-3">Generated Image:</h3>
                    <div className="border rounded-lg overflow-hidden bg-white p-4">
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full max-w-md mx-auto block"
                        onLoad={() => console.log('Image loaded successfully:', generatedImage)}
                        onError={(e) => console.error('Image failed to load:', e, generatedImage)}
                        style={{ minHeight: '200px', backgroundColor: '#f3f4f6' }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Image URL: {generatedImage}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image to Text (OCR) */}
          <TabsContent value="image-to-text">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeIcon size={24} />
                  Image to Text Analysis
                </CardTitle>
                <p className="text-muted-foreground">
                  Extract text from images and get AI explanations
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Upload an image:
                  </label>
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Uploaded" className="max-w-full max-h-64 mx-auto rounded" />
                    ) : (
                      <div>
                        <UploadIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Click to upload an image</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'ocr')}
                    className="hidden"
                  />
                </div>

                <Button
                  onClick={handleImageToText}
                  disabled={isProcessing || !uploadedImage}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <LoaderIcon size={16} className="mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <EyeIcon size={16} className="mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>

                {extractedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="font-semibold mb-2">Extracted Text:</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm font-mono">{extractedText}</p>
                      </div>
                    </div>

                    {aiExplanation && (
                      <div>
                        <h3 className="font-semibold mb-2">AI Explanation:</h3>
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <p className="text-sm">{aiExplanation}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image to Image */}
          <TabsContent value="image-to-image">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon size={24} />
                  Image to Image Transformation
                </CardTitle>
                <p className="text-muted-foreground">
                  Transform images based on text prompts
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Upload source image:
                  </label>
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => handleImageUpload(e as any, 'transform');
                      input.click();
                    }}
                  >
                    {sourceImage ? (
                      <img src={sourceImage} alt="Source" className="max-w-full max-h-64 mx-auto rounded" />
                    ) : (
                      <div>
                        <UploadIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Click to upload source image</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Transformation prompt:
                  </label>
                  <Textarea
                    placeholder="e.g., Convert this diagram to a colorful, cartoon style"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleImageToImage}
                  disabled={isTransforming || !sourceImage || !imagePrompt.trim()}
                  className="w-full"
                >
                  {isTransforming ? (
                    <>
                      <LoaderIcon size={16} className="mr-2 animate-spin" />
                      Transforming...
                    </>
                  ) : (
                    <>
                      <WandIcon size={16} className="mr-2" />
                      Transform Image
                    </>
                  )}
                </Button>

                {transformedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                  >
                    <h3 className="font-semibold mb-3">Transformed Image:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Original:</p>
                        <img src={sourceImage} alt="Original" className="w-full rounded border" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Transformed:</p>
                        <img src={transformedImage} alt="Transformed" className="w-full rounded border" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ImageTools;
