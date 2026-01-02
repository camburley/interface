"use client"

import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text"
import { DrawText } from "@/components/draw-text"
import { HighlightText } from "@/components/highlight-text"
import { SplitFlapText } from "@/components/split-flap-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Upload,
  Download,
  MoreVertical,
  Calendar,
  Bell,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  Info,
  AlertCircle,
  HelpCircle,
} from "lucide-react"

export default function PatternsPage() {
  const [sliderValue, setSliderValue] = useState([50])
  const [progressValue] = useState(65)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [selectedFramework, setSelectedFramework] = useState("nextjs")
  const [notifications, setNotifications] = useState(true)
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-mono text-sm uppercase tracking-widest text-accent hover:text-foreground transition-colors"
            >
              ← Back
            </Link>
            <h1 className="font-mono text-sm uppercase tracking-widest">
              <ScrambleText text="Design System" duration={0.6} />
            </h1>
          </div>
        </header>

        {/* Introduction */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <h2 className="font-mono text-3xl md:text-5xl uppercase tracking-tight mb-6">Pattern Library</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            A comprehensive collection of 50+ UI components, interactions, and affordances for building enterprise-grade
            applications with a retro-digital aesthetic.
          </p>
        </section>

        {/* Tabbed Pattern Sections */}
        <section className="container mx-auto px-4 pb-24 max-w-7xl">
          <Tabs defaultValue="animation" className="w-full">
            <TabsList className="mb-8 w-full md:w-auto flex-wrap h-auto">
              <TabsTrigger value="animation">Animation</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="data">Data Display</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="overlays">Overlays</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            </TabsList>

            {/* ANIMATION TAB */}
            <TabsContent value="animation" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Split-Flap Text */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Split-Flap Text</CardTitle>
                    <CardDescription>Mechanical airport board animation with sound effects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/50 p-8 rounded-md flex items-center justify-center min-h-[120px]">
                      <SplitFlapText text="BURLEY" className="text-3xl" />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono space-y-1">
                      <p>• Spring physics animation</p>
                      <p>• Optional click sounds</p>
                      <p>• Hover to re-animate</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Scramble Text */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Scramble Text</CardTitle>
                    <CardDescription>Character decoding effect on mount or hover</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/50 p-8 rounded-md flex flex-col gap-4 items-center justify-center min-h-[120px]">
                      <div className="text-2xl">
                        <ScrambleText text="DECODING" />
                      </div>
                      <div className="text-sm">
                        <ScrambleTextOnHover text="Hover Me" as="button" className="underline" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono space-y-1">
                      <p>• Two variants: mount & hover</p>
                      <p>• Configurable speed</p>
                      <p>• Random character cycling</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Draw Text */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Draw Text</CardTitle>
                    <CardDescription>SVG stroke animation for blueprint aesthetic</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/50 p-8 rounded-md flex items-center justify-center min-h-[120px]">
                      <DrawText text="BLUEPRINT" className="text-3xl" />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono space-y-1">
                      <p>• SVG stroke-dasharray</p>
                      <p>• Smooth drawing effect</p>
                      <p>• Custom font support</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Highlight Text */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Highlight Text</CardTitle>
                    <CardDescription>Scroll-triggered gradient sweep</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/50 p-8 rounded-md flex items-center justify-center min-h-[120px]">
                      <p className="text-base">
                        This is <HighlightText>important</HighlightText> text
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono space-y-1">
                      <p>• Scroll-based trigger</p>
                      <p>• Inline emphasis</p>
                      <p>• Customizable colors</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Bitmap Chevron */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Bitmap Chevron</CardTitle>
                    <CardDescription>Pixelated directional indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/50 p-8 rounded-md flex items-center justify-center min-h-[120px]">
                      <div className="flex gap-6">
                        <BitmapChevron direction="up" size={32} />
                        <BitmapChevron direction="right" size={32} />
                        <BitmapChevron direction="down" size={32} />
                        <BitmapChevron direction="left" size={32} />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono space-y-1">
                      <p>• 8-bit pixel art style</p>
                      <p>• Four directions</p>
                      <p>• Lightweight SVG</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* BUTTONS TAB */}
            <TabsContent value="buttons" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Button Variants</CardTitle>
                  <CardDescription>Standard button styles with hover states</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground">Default</p>
                      <Button>Primary Action</Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground">Secondary</p>
                      <Button variant="secondary">Secondary</Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground">Outline</p>
                      <Button variant="outline">Outline</Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground">Ghost</p>
                      <Button variant="ghost">Ghost</Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground">Destructive</p>
                      <Button variant="destructive">Delete</Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground">Link</p>
                      <Button variant="link">Link Button</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Button Sizes</CardTitle>
                  <CardDescription>Size variants for different contexts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <BitmapChevron direction="right" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Icon Buttons</CardTitle>
                  <CardDescription>Buttons with icons for common actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button size="icon" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FORMS TAB */}
            <TabsContent value="forms" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Input</CardTitle>
                    <CardDescription>Text input with validation states</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="Enter text..." />
                    <Input placeholder="Disabled input" disabled />
                    <Input placeholder="Error state" aria-invalid />
                  </CardContent>
                </Card>

                {/* Checkbox & Switch */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Selection Controls</CardTitle>
                    <CardDescription>Checkbox and toggle switches</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox id="check1" />
                      <label htmlFor="check1" className="text-sm">
                        Checkbox option
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="switch1" />
                      <label htmlFor="switch1" className="text-sm">
                        Toggle switch
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Slider */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Slider</CardTitle>
                    <CardDescription>Range input for numeric values</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                    <p className="text-xs font-mono text-muted-foreground">Value: {sliderValue[0]}</p>
                  </CardContent>
                </Card>

                {/* Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Progress</CardTitle>
                    <CardDescription>Progress indicators for loading states</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={progressValue} />
                    <p className="text-xs font-mono text-muted-foreground">{progressValue}% complete</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Textarea</CardTitle>
                    <CardDescription>Multi-line text input for longer content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="Enter detailed information..." rows={4} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Radio Group</CardTitle>
                    <CardDescription>Single selection from multiple options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup defaultValue="option1">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="option1" id="r1" />
                        <Label htmlFor="r1">Option One</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="option2" id="r2" />
                        <Label htmlFor="r2">Option Two</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="option3" id="r3" />
                        <Label htmlFor="r3">Option Three</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Select</CardTitle>
                    <CardDescription>Dropdown selection menu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select defaultValue="nextjs">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nextjs">Next.js</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono uppercase text-accent">Search Input</CardTitle>
                    <CardDescription>Input with search icon for filtering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search..." className="pl-9" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Form Layout Example</CardTitle>
                  <CardDescription>Complete form with labels and validation</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fname">First Name</Label>
                        <Input id="fname" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lname">Last Name</Label>
                        <Input id="lname" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="founder">Founder</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="designer">Designer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms">Accept terms and conditions</Label>
                    </div>
                    <Button type="submit">Submit</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DATA DISPLAY TAB */}
            <TabsContent value="data" className="space-y-8">
              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Badges</CardTitle>
                  <CardDescription>Status indicators and labels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Avatar</CardTitle>
                  <CardDescription>User profile images with fallbacks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>CB</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>LG</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Table</CardTitle>
                  <CardDescription>Data tables for structured information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Days</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Seekr</TableCell>
                        <TableCell>
                          <Badge>Deployed</Badge>
                        </TableCell>
                        <TableCell className="text-right">5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>AudienceLab</TableCell>
                        <TableCell>
                          <Badge variant="secondary">In Progress</Badge>
                        </TableCell>
                        <TableCell className="text-right">3</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Guideline Buddy</TableCell>
                        <TableCell>
                          <Badge>Deployed</Badge>
                        </TableCell>
                        <TableCell className="text-right">5</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Skeleton</CardTitle>
                  <CardDescription>Loading placeholders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Icon Lists</CardTitle>
                  <CardDescription>Lists with leading icons for context</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>cam@burley.ai</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>San Francisco, CA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Stats Display</CardTitle>
                  <CardDescription>Key metrics and KPIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-mono font-bold">24</p>
                      <p className="text-xs text-muted-foreground">MVP Sprints</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-mono font-bold">5</p>
                      <p className="text-xs text-muted-foreground">Days Average</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-mono font-bold">100%</p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FEEDBACK TAB */}
            <TabsContent value="feedback" className="space-y-8">
              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Alerts</CardTitle>
                  <CardDescription>Contextual feedback messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>This is a default alert message.</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Something went wrong with your request.</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Tooltip</CardTitle>
                  <CardDescription>Contextual information on hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <div className="flex gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This is a helpful tooltip</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline">Hover me</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Additional context appears here</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Status Indicators</CardTitle>
                  <CardDescription>Visual status with icons and colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-sm">Away</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-sm">Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-500" />
                      <span className="text-sm">Unknown</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Empty State</CardTitle>
                  <CardDescription>No data available messaging</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-mono font-semibold mb-2">No results found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your search or filter to find what you're looking for
                    </p>
                    <Button variant="outline" size="sm">
                      Clear filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LAYOUT TAB */}
            <TabsContent value="layout" className="space-y-8">
              {/* Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Card</CardTitle>
                  <CardDescription>Container for grouped content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Example Card</CardTitle>
                      <CardDescription>This is a card description</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Card content goes here with any components or information.
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Separator */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Separator</CardTitle>
                  <CardDescription>Visual dividers for content sections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>Section One</div>
                  <Separator />
                  <div>Section Two</div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex gap-4">
                    <div>Column A</div>
                    <Separator orientation="vertical" className="h-8" />
                    <div>Column B</div>
                  </div>
                </CardContent>
              </Card>

              {/* Accordion */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Accordion</CardTitle>
                  <CardDescription>Collapsible content sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is an MVP Sprint?</AccordionTrigger>
                      <AccordionContent>
                        An MVP Sprint is a 5-day focused build to ship a working product vertical slice that proves your
                        riskiest assumption.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>What technologies do you use?</AccordionTrigger>
                      <AccordionContent>
                        We use Next.js, Vercel, Postgres, Firebase, Stripe, and modern AI tools to build
                        production-ready apps quickly.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>How much does it cost?</AccordionTrigger>
                      <AccordionContent>
                        Pricing varies based on scope and complexity. Contact us for a custom quote.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Tabs Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Tabs</CardTitle>
                  <CardDescription>Organize content in tabbed interfaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      <TabsTrigger value="tab1">Overview</TabsTrigger>
                      <TabsTrigger value="tab2">Details</TabsTrigger>
                      <TabsTrigger value="tab3">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="pt-4">
                      <p className="text-sm text-muted-foreground">Overview content goes here.</p>
                    </TabsContent>
                    <TabsContent value="tab2" className="pt-4">
                      <p className="text-sm text-muted-foreground">Detailed information displayed here.</p>
                    </TabsContent>
                    <TabsContent value="tab3" className="pt-4">
                      <p className="text-sm text-muted-foreground">Settings and configuration options.</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overlays" className="space-y-8">
              {/* Dialog/Modal */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Dialog / Modal</CardTitle>
                  <CardDescription>Modal windows for focused interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to proceed with this action? This cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Popover */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Popover</CardTitle>
                  <CardDescription>Floating content triggered by user action</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2">
                        <h4 className="font-mono font-medium">Popover Content</h4>
                        <p className="text-sm text-muted-foreground">
                          This is additional information displayed in a popover.
                        </p>
                        <Button size="sm" className="w-full">
                          Action
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              {/* Dropdown Menu */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Dropdown Menu</CardTitle>
                  <CardDescription>Context menus with actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Options <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <X className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuCheckboxItem checked={notifications} onCheckedChange={setNotifications}>
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={selectedFramework} onValueChange={setSelectedFramework}>
                          <DropdownMenuRadioItem value="nextjs">Grid</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="react">List</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="vue">Compact</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="navigation" className="space-y-8">
              {/* Breadcrumbs */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Breadcrumbs</CardTitle>
                  <CardDescription>Hierarchical navigation path</CardDescription>
                </CardHeader>
                <CardContent>
                  <nav className="flex items-center gap-2 text-sm">
                    <Link href="/" className="text-muted-foreground hover:text-foreground">
                      Home
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Link href="/patterns" className="text-muted-foreground hover:text-foreground">
                      Patterns
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Navigation</span>
                  </nav>
                </CardContent>
              </Card>

              {/* Pagination */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Pagination</CardTitle>
                  <CardDescription>Navigate through multiple pages of data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Showing 1-10 of 47 results</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                        disabled={currentPage === 5}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Navigation Tabs</CardTitle>
                  <CardDescription>Tab-based page navigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 border-b">
                    <button className="pb-2 px-1 border-b-2 border-foreground font-mono text-sm">Dashboard</button>
                    <button className="pb-2 px-1 text-muted-foreground hover:text-foreground font-mono text-sm">
                      Projects
                    </button>
                    <button className="pb-2 px-1 text-muted-foreground hover:text-foreground font-mono text-sm">
                      Team
                    </button>
                    <button className="pb-2 px-1 text-muted-foreground hover:text-foreground font-mono text-sm">
                      Settings
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Sidebar Navigation</CardTitle>
                  <CardDescription>Vertical navigation menu</CardDescription>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-1">
                    <a
                      href="#"
                      className="flex items-center gap-3 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                    >
                      <Calendar className="h-4 w-4" />
                      Calendar
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enterprise" className="space-y-8">
              {/* Data Grid with Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Data Grid</CardTitle>
                  <CardDescription>Advanced table with sorting, filtering, and actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search projects..." className="pl-9" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">Seekr MVP</TableCell>
                        <TableCell>
                          <Badge>Active</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>CB</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Cam</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">AudienceLab</TableCell>
                        <TableCell>
                          <Badge variant="secondary">In Progress</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>CB</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Cam</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>2 of 2 row(s) selected</p>
                    <div className="flex items-center gap-2">
                      <span>Rows per page:</span>
                      <Select value={pageSize} onValueChange={setPageSize}>
                        <SelectTrigger className="w-16 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Card Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Dashboard Cards</CardTitle>
                  <CardDescription>KPI and metric cards for dashboards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                            <p className="text-2xl font-mono font-bold">$45,231</p>
                            <p className="text-xs text-green-600 mt-1">+20.1% from last month</p>
                          </div>
                          <div className="p-3 bg-accent/10 rounded-md">
                            <Upload className="h-5 w-5 text-accent" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Active Users</p>
                            <p className="text-2xl font-mono font-bold">2,350</p>
                            <p className="text-xs text-green-600 mt-1">+180 this week</p>
                          </div>
                          <div className="p-3 bg-accent/10 rounded-md">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                            <p className="text-2xl font-mono font-bold">3.2%</p>
                            <p className="text-xs text-red-600 mt-1">-0.5% from last month</p>
                          </div>
                          <div className="p-3 bg-accent/10 rounded-md">
                            <Settings className="h-5 w-5 text-accent" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Filters & Sorting */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Filters & Sorting</CardTitle>
                  <CardDescription>Advanced filtering and sorting controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-2">
                        Status: Active
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                      <Badge variant="outline" className="gap-2">
                        Owner: Cam
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                      <Badge variant="outline" className="gap-2">
                        Date: Last 30 days
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Clear all
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select defaultValue="recent">
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Grid
                        </Button>
                        <Button variant="ghost" size="sm">
                          List
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loading States */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Loading States</CardTitle>
                  <CardDescription>Different loading patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-3">Skeleton Loading</p>
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-3">Progress Indicator</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing...</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} />
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-3">Button Loading</p>
                    <Button disabled>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Loading...
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Command Palette Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono uppercase text-accent">Command Palette</CardTitle>
                  <CardDescription>Quick search and action launcher</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Type a command or search..." className="pl-9" />
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-muted-foreground px-2">Suggestions</p>
                      <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/10">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>Search projects...</span>
                        <kbd className="ml-auto text-xs text-muted-foreground">⌘K</kbd>
                      </button>
                      <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/10">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Open profile</span>
                        <kbd className="ml-auto text-xs text-muted-foreground">⌘P</kbd>
                      </button>
                      <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/10">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                        <kbd className="ml-auto text-xs text-muted-foreground">⌘,</kbd>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Note */}
          <div className="mt-16 border border-accent/20 p-8 bg-accent/5 rounded-lg">
            <h3 className="font-mono text-sm uppercase tracking-widest mb-4 text-accent">Implementation</h3>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                All 50+ components are built with React, TypeScript, and Radix UI primitives. Animations use GSAP and
                Framer Motion for smooth, performant interactions.
              </p>
              <p>
                The design system uses CSS custom properties for theming, making it easy to customize colors, spacing,
                and typography across the entire application.
              </p>
              <p className="font-mono text-xs pt-2 border-t border-border/30">
                Components follow accessibility best practices with ARIA attributes, keyboard navigation, and screen
                reader support. Fully responsive and production-ready.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
