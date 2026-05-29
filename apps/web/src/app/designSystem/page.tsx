'use client';

import type { ReactNode } from 'react';
import { DomesticSidebar } from '@/components/shared/domestic-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Settings, User, Home } from 'lucide-react';
import {
  DetailLayout,
  DetailPanel,
  DetailPanelHeader,
  DetailPanelSearch,
  DetailPanelContent,
} from '@/components/shared/detail-layout';
import { FileText } from 'lucide-react';
import { DynamicForm } from '@/components/dynamic-form';
import basicFormConfig from '@/components/dynamic-form/examples/basic-form.json';
import registrationFormConfig from '@/components/dynamic-form/examples/registration-form.json';
import surveyFormConfig from '@/components/dynamic-form/examples/survey-form.json';
import progressFormConfig from '@/components/dynamic-form/examples/progress-form.json';
import allFieldsFormConfig from '@/components/dynamic-form/examples/all-fields-form.json';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 border rounded-xl p-4 shadow-sm bg-white">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
export default function DesignSystemPage() {
  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold">Design System</h1>

      {/* SIDEBAR */}
      <Section title="Sidebar">
        <div className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-background">
            Reusable component — <code className="text-xs">AppSidebar</code>
          </Badge>
          <div className="flex h-[36rem] w-full items-stretch justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/20 shadow-sm">
            <SidebarProvider
              defaultOpen
              style={
                {
                  '--sidebar-width': '16rem',
                  '--sidebar-width-icon': '3.5rem',
                } as React.CSSProperties
              }
            >
              <DomesticSidebar
                pathnameOverride="/domestic/settings"
                collapsible="none"
                showTrigger={false}
                showRail={false}
                className="rounded-none border-none shadow-none"
              />
              <div className="flex flex-1 items-center justify-center p-8">
                <p className="max-w-xs text-sm text-muted-foreground text-center">
                  This is a preview. The real sidebar uses{' '}
                  <code className="text-xs">collapsible=&quot;icon&quot;</code> and appears on the
                  left of your app page.
                </p>
              </div>
            </SidebarProvider>
          </div>
        </div>
      </Section>

      {/* ALERT */}
      <Section title="Alert">
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>This is a default alert message.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>This is a destructive alert message.</AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* BADGE */}
      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </div>
      </Section>

      {/* BUTTON */}
      <Section title="Button">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* TOAST */}
      <Section title="Toast">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success('Success! Everything went well.')}>
            Success Toast
          </Button>
          <Button variant="destructive" onClick={() => toast.error('Error! Something went wrong.')}>
            Error Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Info. Here's some helpful information.")}
          >
            Info Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast('Loading...', {
                description: 'Processing your request',
              })
            }
          >
            Default Toast
          </Button>
        </div>
      </Section>

      {/* BREADCRUMB */}
      <Section title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="size-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      {/* CARD */}
      <Section title="Card">
        <div className="max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This is the card content.</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">
                View More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* ACCORDION */}
      <Section title="Accordion">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is this application about?</AccordionTrigger>
            <AccordionContent>
              This is a ship flow management application that helps you track and manage shipping
              operations.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How do I get started?</AccordionTrigger>
            <AccordionContent>
              Simply register an account and start exploring the dashboard to manage your shipments.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I customize my dashboard?</AccordionTrigger>
            <AccordionContent>
              Yes, you can customize the dashboard layout and widgets to suit your needs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      {/* CAROUSEL */}
      <Section title="Carousel">
        <Carousel className="w-full max-w-sm">
          <CarouselContent>
            <CarouselItem>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold">Slide 1</h3>
                <p className="text-sm text-muted-foreground">First slide content</p>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold">Slide 2</h3>
                <p className="text-sm text-muted-foreground">Second slide content</p>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold">Slide 3</h3>
                <p className="text-sm text-muted-foreground">Third slide content</p>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Section>

      {/* DROPDOWN MENU */}
      <Section title="Dropdown Menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      {/* TABLE */}
      <Section title="Table">
        <Table>
          <TableCaption>A list of users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Johnson</TableCell>
              <TableCell>bob@example.com</TableCell>
              <TableCell>Editor</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell></TableCell>
              <TableCell>3 users</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Section>

      {/* INPUT */}
      <Section title="Input Types">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter email" />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter password" />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" type="url" placeholder="https://example.com" />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>

          {/* Time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" />
          </div>

          {/* Month */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="month">Month</Label>
            <Input id="month" type="month" />
          </div>

          {/* Week */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="week">Week</Label>
            <Input id="week" type="week" />
          </div>

          {/* Range */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="range">Range</Label>
            <Input id="range" type="range" min={0} max={100} defaultValue={40} />
          </div>
        </div>
      </Section>

      {/* SKELETON */}
      <Section title="Skeleton">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card skeleton */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full max-w-88" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>

          {/* List skeleton */}
          <div className="rounded-xl border bg-white p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SPINNER */}
      <Section title="Spinner">
        <Spinner className="size-6" />
      </Section>

      {/* PROGRESS */}
      <Section title="Progress">
        <div className="w-80">
          <Progress value={64} />
        </div>
      </Section>
      {/* TOOLTIP */}
      <Section title="Tooltip">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Section>

      {/* TABS */}
      <Section title="Tabs">
        <Tabs defaultValue="overview" className="max-w-md">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">Overview content</TabsContent>

          <TabsContent value="details">Details content</TabsContent>
        </Tabs>
      </Section>

      {/* PAGINATION */}
      <Section title="Pagination">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Example: page 2 of 10</div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">10</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Section>

      {/* DETAIL LAYOUT */}
      <Section title="Detail Layout">
        <div className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-background">
            Reusable layout —{' '}
            <code className="text-xs">
              DetailLayout + DetailPanel + DetailPanelHeader + DetailPanelSearch +
              DetailPanelContent
            </code>
          </Badge>
          <p className="text-sm text-muted-foreground">
            Two-column layout with a fixed-width left panel and a flexible right content area. The
            left panel composes reusable sub-components: Header, Search, and scrollable Content.
          </p>
          <div className="h-[28rem] w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/20 shadow-sm">
            <DetailLayout
              leftWidth="20rem"
              leftPanel={
                <DetailPanel>
                  <DetailPanelHeader
                    icon={<FileText className="w-4 h-4" />}
                    title="List Panel"
                    action={
                      <Button className="h-10 min-w-20 shrink-0 gap-1 rounded-[5px] bg-green-700 px-2.5 text-white shadow-sm hover:bg-green-800 active:scale-[0.98] transition-all cursor-pointer w-full text-xs font-semibold tracking-wide">
                        <Plus className="w-5 h-5" />
                        NEW
                      </Button>
                    }
                  />
                  <DetailPanelSearch placeholder="Search items..." />
                  <DetailPanelContent>
                    <div className="space-y-3">
                      <div className="text-[11px] text-gray-500 px-1 font-medium">5 items</div>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`border rounded-xl p-3 bg-white hover:bg-slate-50/50 transition-all duration-200 cursor-pointer shadow-sm ${
                            i === 1
                              ? 'border-emerald-600 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                              : 'border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                checked={i === 1}
                                readOnly
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex justify-between items-start mb-1.5">
                                <h3 className="font-semibold text-[13px] text-slate-800 leading-tight">
                                  Item {i}
                                </h3>
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700">
                                  Active
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                REF-{String(i).padStart(3, '0')}
                              </div>
                              <div className="flex justify-between items-center pt-1.5">
                                <span className="text-[11px] text-slate-400 font-medium">
                                  23 May 2026
                                </span>
                                <span className="font-bold text-[13px] text-slate-800">
                                  ₹{(i * 1500).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DetailPanelContent>
                </DetailPanel>
              }
              rightPanel={
                <div className="flex h-full flex-col">
                  <header className="h-12 flex items-center justify-end px-4 space-x-2 border-b border-slate-200 bg-white shadow-sm" />
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="max-w-xs w-full">
                      <div className="relative mb-3 flex justify-center">
                        <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150 opacity-30" />
                        <div className="relative w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-md border border-slate-100">
                          <FileText className="w-7 h-7 text-emerald-600" />
                        </div>
                      </div>
                      <h2 className="text-sm font-extrabold text-slate-700 tracking-tight mb-1">
                        Select an item to view details
                      </h2>
                      <p className="text-xs text-slate-400 font-normal">or create a new one</p>
                    </div>
                  </div>
                  <footer className="p-3 flex justify-between items-center text-[8px] uppercase tracking-widest text-slate-400 font-semibold border-t border-slate-200 bg-white">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      System Operational
                    </div>
                    <div>Ship Flow © 2026</div>
                  </footer>
                </div>
              }
            />
          </div>
        </div>
      </Section>

      {/* DYNAMIC FORMS */}
      <Section title="Dynamic Forms - JSON Driven">
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Forms that are generated from JSON configurations. Each form is fully dynamic and can be
            customized through JSON.
          </p>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="registration">Registration</TabsTrigger>
              <TabsTrigger value="survey">Survey</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="all">All Fields</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <DynamicForm config={basicFormConfig as any} />
            </TabsContent>

            <TabsContent value="registration" className="mt-6">
              <DynamicForm config={registrationFormConfig as any} />
            </TabsContent>

            <TabsContent value="survey" className="mt-6">
              <DynamicForm config={surveyFormConfig as any} />
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <DynamicForm config={progressFormConfig as any} />
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <DynamicForm config={allFieldsFormConfig as any} />
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </div>
  );
}
