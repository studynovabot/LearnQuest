import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/useTheme";
import { SunIcon, MoonIcon, HomeIcon, MessageIcon, ImageIcon } from "@/components/ui/icons";

const ThemeTest = () => {
  const { isDark, isLight, resolvedTheme } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Theme Test Page</h1>
        <p className="text-muted-foreground mb-4">
          Current theme: <span className="font-semibold">{resolvedTheme}</span>
        </p>
        <ThemeToggle size="lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Colors Card */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Testing color variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span className="text-sm">Primary</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-secondary rounded"></div>
              <span className="text-sm">Secondary</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <span className="text-sm">Muted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent rounded"></div>
              <span className="text-sm">Accent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive rounded"></div>
              <span className="text-sm">Destructive</span>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Card */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Different button variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Default</Button>
            <Button variant="secondary" className="w-full">Secondary</Button>
            <Button variant="outline" className="w-full">Outline</Button>
            <Button variant="ghost" className="w-full">Ghost</Button>
            <Button variant="destructive" className="w-full">Destructive</Button>
          </CardContent>
        </Card>

        {/* Form Elements Card */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="test-input">Text Input</Label>
              <Input id="test-input" placeholder="Enter text..." />
            </div>
            <div>
              <Label htmlFor="test-textarea">Textarea</Label>
              <Textarea id="test-textarea" placeholder="Enter description..." rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Icons Card */}
        <Card>
          <CardHeader>
            <CardTitle>Icons</CardTitle>
            <CardDescription>Icon visibility test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <HomeIcon size={24} />
              <MessageIcon size={24} />
              <ImageIcon size={24} />
              <SunIcon size={24} />
              <MoonIcon size={24} />
            </div>
          </CardContent>
        </Card>

        {/* Text Contrast Card */}
        <Card>
          <CardHeader>
            <CardTitle>Text Contrast</CardTitle>
            <CardDescription>Readability test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-foreground">Primary text (foreground) ✅</p>
            <p className="text-muted-foreground">Muted text ✅</p>
            <p className="text-primary">Primary colored text ✅</p>
            <p className="text-secondary">Secondary colored text ⚠️ (Fixed in components)</p>
            <p className="text-destructive">Destructive colored text ✅</p>
          </CardContent>
        </Card>

        {/* Navigation Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Visibility</CardTitle>
            <CardDescription>Testing active navigation states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="font-semibold">Fixed Components:</p>
              <ul className="text-sm space-y-1">
                <li>✅ SlidingSidebar active states</li>
                <li>✅ MainLayout mobile navigation</li>
                <li>✅ Sidebar desktop navigation</li>
                <li>✅ Dashboard user name display</li>
                <li>✅ ChatAgents badge text</li>
              </ul>
            </div>
            <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded">
              Active navigation style preview
            </div>
          </CardContent>
        </Card>

        {/* Background Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>Backgrounds</CardTitle>
            <CardDescription>Background color test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted rounded">Muted background</div>
            <div className="p-3 bg-accent rounded">Accent background</div>
            <div className="p-3 bg-primary text-primary-foreground rounded">
              Primary background
            </div>
            <div className="p-3 bg-secondary text-secondary-foreground rounded">
              Secondary background
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Status */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Is Dark:</strong> {isDark ? "Yes" : "No"}
            </div>
            <div>
              <strong>Is Light:</strong> {isLight ? "Yes" : "No"}
            </div>
            <div>
              <strong>Resolved Theme:</strong> {resolvedTheme}
            </div>
            <div>
              <strong>System Preference:</strong> {
                window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeTest;
