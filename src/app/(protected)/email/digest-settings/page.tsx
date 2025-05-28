import { Metadata } from "next";
import {
  Clock,
  Mail,
  Trash2,
  Edit,
  PlusCircle,
  Calendar,
  BarChart4,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export const metadata: Metadata = {
  title: "Email Digest Settings | Vike",
  description: "Configure automated email digests and summaries",
};

// Mock digest configurations
const mockDigests = [
  {
    id: "1",
    name: "Daily Work Summary",
    frequency: "daily",
    isActive: true,
    timeOfDay: "18:00",
    categories: ["Work", "Meetings", "Support"],
    lastSent: new Date(2023, 9, 15),
  },
  {
    id: "2",
    name: "Weekly Newsletter Roundup",
    frequency: "weekly",
    isActive: true,
    dayOfWeek: 1, // Monday
    timeOfDay: "09:00",
    categories: ["Newsletters", "Updates"],
    lastSent: new Date(2023, 9, 9),
  },
  {
    id: "3",
    name: "Monthly Financial Summary",
    frequency: "monthly",
    isActive: false,
    dayOfMonth: 1,
    timeOfDay: "08:00",
    categories: ["Finance", "Bills", "Shopping"],
    lastSent: new Date(2023, 9, 1),
  },
];

export default function DigestSettingsPage() {
  return (
    <div className='container mx-auto p-4'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Email Digest Settings</h1>
          <p className='text-muted-foreground mt-1'>
            Configure automated email summaries to keep your inbox organized
          </p>
        </div>
        <Button>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Digest
        </Button>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 lg:col-span-8'>
          <Card>
            <CardHeader>
              <CardTitle>Your Digest Configurations</CardTitle>
              <CardDescription>
                Manage your automated email summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockDigests.map((digest) => (
                  <div key={digest.id} className='border rounded-md p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-medium'>{digest.name}</h3>
                          <Badge
                            variant={digest.isActive ? "default" : "outline"}>
                            {digest.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground mt-1'>
                          {digest.frequency === "daily"
                            ? `Daily at ${digest.timeOfDay}`
                            : digest.frequency === "weekly"
                            ? `Weekly on ${getDayName(digest.dayOfWeek)} at ${
                                digest.timeOfDay
                              }`
                            : `Monthly on day ${digest.dayOfMonth} at ${digest.timeOfDay}`}
                        </p>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Switch checked={digest.isActive} />
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-1 mb-3'>
                      {digest.categories.map((category) => (
                        <Badge
                          key={category}
                          variant='secondary'
                          className='text-xs'>
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <div className='text-xs text-muted-foreground'>
                      Last sent: {digest.lastSent.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Digest Preview</CardTitle>
              <CardDescription>
                See what your email digest will look like
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='border rounded-md p-4'>
                <div className='border-b pb-3 mb-3'>
                  <div className='font-medium text-lg'>Daily Work Summary</div>
                  <div className='text-sm text-muted-foreground'>
                    October 15, 2023 - Generated at 18:00
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h3 className='text-sm font-medium mb-2'>
                      Work (5 emails)
                    </h3>
                    <div className='space-y-2'>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className='text-sm border-l-2 border-blue-500 pl-3 py-1'>
                          <div className='font-medium'>
                            Project Update - Q3 Results
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            From: John Doe • 14:30
                          </div>
                        </div>
                      ))}
                      <div className='text-xs text-blue-500'>+ 2 more</div>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-2'>
                      Meetings (3 emails)
                    </h3>
                    <div className='space-y-2'>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className='text-sm border-l-2 border-green-500 pl-3 py-1'>
                          <div className='font-medium'>
                            Team Sync - Weekly Meeting
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            From: Jane Smith • 09:15
                          </div>
                        </div>
                      ))}
                      <div className='text-xs text-blue-500'>+ 1 more</div>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-2'>
                      Support (2 emails)
                    </h3>
                    <div className='space-y-2'>
                      {[1].map((i) => (
                        <div
                          key={i}
                          className='text-sm border-l-2 border-red-500 pl-3 py-1'>
                          <div className='font-medium'>
                            Your Ticket #45678 Has Been Resolved
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            From: Support Team • 16:45
                          </div>
                        </div>
                      ))}
                      <div className='text-xs text-blue-500'>+ 1 more</div>
                    </div>
                  </div>
                </div>

                <div className='mt-4 text-center'>
                  <Button variant='outline' size='sm'>
                    <Mail className='mr-2 h-4 w-4' />
                    View All Emails
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='col-span-12 lg:col-span-4'>
          <Card>
            <CardHeader>
              <CardTitle>Digest Templates</CardTitle>
              <CardDescription>
                Quick start with pre-configured digest settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <DigestTemplate
                title='Daily Work Summary'
                description='Get a daily summary of all work-related emails'
                icon={<Clock className='h-5 w-5 text-blue-500' />}
                frequency='Daily at 18:00'
              />
              <DigestTemplate
                title='Weekly Newsletter Roundup'
                description='Collect all newsletters in a weekly digest'
                icon={<Mail className='h-5 w-5 text-green-500' />}
                frequency='Weekly on Monday at 09:00'
              />
              <DigestTemplate
                title='Monthly Financial Summary'
                description='Track bills, receipts and financial emails'
                icon={<BarChart4 className='h-5 w-5 text-purple-500' />}
                frequency='Monthly on day 1 at 08:00'
              />
              <DigestTemplate
                title='Weekend Social Digest'
                description='Catch up on social emails during the weekend'
                icon={<Calendar className='h-5 w-5 text-amber-500' />}
                frequency='Weekly on Saturday at 10:00'
              />
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Digest Stats</CardTitle>
              <CardDescription>
                Usage statistics for your email digests
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Total Digests Sent</span>
                <span className='text-2xl font-bold'>28</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Emails Summarized</span>
                <span className='text-2xl font-bold'>413</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Time Saved</span>
                <span className='text-2xl font-bold'>8.2 hrs</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Open Rate</span>
                <span className='text-2xl font-bold'>87%</span>
              </div>

              <Separator className='my-2' />

              <div className='pt-2'>
                <h4 className='text-sm font-medium mb-2'>
                  Most Popular Digest
                </h4>
                <div className='bg-muted p-2 rounded-md'>
                  <div className='font-medium'>Daily Work Summary</div>
                  <div className='text-sm text-muted-foreground'>
                    Sent 20 times
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DigestTemplate({
  title,
  description,
  icon,
  frequency,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  frequency: string;
}) {
  return (
    <div className='border rounded-md p-3 hover:bg-accent/5 transition-colors cursor-pointer'>
      <div className='flex justify-between items-start'>
        <div className='flex items-start gap-3'>
          {icon}
          <div>
            <h3 className='font-medium'>{title}</h3>
            <p className='text-sm text-muted-foreground mt-1'>{description}</p>
            <div className='text-xs text-muted-foreground mt-2'>
              {frequency}
            </div>
          </div>
        </div>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <PlusCircle className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

// Helper function to get day name
function getDayName(dayNumber: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber] || "Monday";
}
