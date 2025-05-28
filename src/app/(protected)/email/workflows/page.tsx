import { Suspense } from "react";
import { Metadata } from "next";
import { PlusCircle, Filter, RefreshCw, ArrowRight } from "lucide-react";
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
import { WorkflowList } from "@/components/email/workflow-list";
import { WorkflowEditor } from "@/components/email/workflow-editor";

export const metadata: Metadata = {
  title: "Email Workflows | Vike",
  description:
    "Automated email workflows to save time and streamline your email management",
};

export default function WorkflowsPage() {
  return (
    <div className='container mx-auto p-4'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Email Workflows</h1>
          <p className='text-muted-foreground mt-1'>
            Create automated workflows to process your emails based on rules
          </p>
        </div>
        <Button>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Workflow
        </Button>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 lg:col-span-8'>
          <Suspense fallback={<WorkflowListSkeleton />}>
            <WorkflowList />
          </Suspense>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Workflow Editor</CardTitle>
              <CardDescription>
                Design your email automation workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowEditor />
            </CardContent>
          </Card>
        </div>

        <div className='col-span-12 lg:col-span-4'>
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>
                Quick start with pre-configured workflows
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <WorkflowTemplate
                title='Newsletter Filter'
                description='Automatically categorize and organize newsletter emails'
                tags={["Newsletters", "Categorization"]}
              />
              <WorkflowTemplate
                title='Meeting Scheduler'
                description='Detect meeting requests and add them to your calendar'
                tags={["Meetings", "Calendar"]}
              />
              <WorkflowTemplate
                title='Receipt Organizer'
                description='Save receipts and invoices to a dedicated folder'
                tags={["Finance", "Organization"]}
              />
              <WorkflowTemplate
                title='Auto Responder'
                description='Send automatic replies to specific types of emails'
                tags={["Replies", "Automation"]}
              />
              <WorkflowTemplate
                title='VIP Notifications'
                description='Get special notifications for emails from important contacts'
                tags={["Notifications", "Priority"]}
              />
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Workflow Stats</CardTitle>
              <CardDescription>
                Performance of your automated workflows
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Emails Processed</span>
                <span className='text-2xl font-bold'>247</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Time Saved</span>
                <span className='text-2xl font-bold'>4.2 hrs</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Active Workflows</span>
                <span className='text-2xl font-bold'>8</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Success Rate</span>
                <span className='text-2xl font-bold'>98.3%</span>
              </div>

              <Separator className='my-2' />

              <div className='pt-2'>
                <h4 className='text-sm font-medium mb-2'>
                  Top Performing Workflow
                </h4>
                <div className='bg-muted p-2 rounded-md'>
                  <div className='font-medium'>Newsletter Filter</div>
                  <div className='text-sm text-muted-foreground'>
                    124 emails processed
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant='outline' className='w-full'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Refresh Stats
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WorkflowTemplate({
  title,
  description,
  tags,
}: {
  title: string;
  description: string;
  tags: string[];
}) {
  return (
    <div className='border rounded-md p-3 hover:bg-accent/5 transition-colors cursor-pointer'>
      <div className='flex justify-between items-start'>
        <h3 className='font-medium'>{title}</h3>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <PlusCircle className='h-4 w-4' />
        </Button>
      </div>
      <p className='text-sm text-muted-foreground mt-1 mb-2'>{description}</p>
      <div className='flex flex-wrap gap-1'>
        {tags.map((tag) => (
          <Badge key={tag} variant='secondary' className='text-xs'>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function WorkflowListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className='h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
        <div className='h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='border rounded-md p-4'>
              <div className='flex justify-between items-start mb-3'>
                <div className='h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                <div className='h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
              </div>
              <div className='h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3'></div>
              <div className='flex gap-2'>
                <div className='h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                <div className='h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
