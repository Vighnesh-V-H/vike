"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  CalendarRange,
  Users,
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lead, UserType } from "@/lib/leads/types";

// Types
interface DashboardProps {
  leads: Lead[];
  users?: UserType[];
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
}

export function Dashboard({
  leads = [],
  users = [],
  dateRange,
  onDateRangeChange,
}: DashboardProps) {
  const [timeframe, setTimeframe] = useState("week");

  // Calculate metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const qualifiedLeads = leads.filter(
    (lead) => lead.status === "qualified"
  ).length;
  const wonLeads = leads.filter((lead) => lead.status === "won").length;

  // Calculate total potential value
  const totalValue = leads.reduce((sum, lead) => {
    const value = lead.value ? parseFloat(lead.value) : 0;
    return sum + value;
  }, 0);

  // Calculate conversion rate
  const conversionRate =
    totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  // Status distribution for pie chart
  const statusData = [
    {
      name: "New",
      value: leads.filter((lead) => lead.status === "new").length,
      color: "#3b82f6",
    },
    {
      name: "Contacted",
      value: leads.filter((lead) => lead.status === "contacted").length,
      color: "#8b5cf6",
    },
    {
      name: "Qualified",
      value: leads.filter((lead) => lead.status === "qualified").length,
      color: "#f59e0b",
    },
    {
      name: "Proposal",
      value: leads.filter((lead) => lead.status === "proposal").length,
      color: "#10b981",
    },
    {
      name: "Negotiation",
      value: leads.filter((lead) => lead.status === "negotiation").length,
      color: "#ec4899",
    },
    {
      name: "Won",
      value: leads.filter((lead) => lead.status === "won").length,
      color: "#22c55e",
    },
    {
      name: "Lost",
      value: leads.filter((lead) => lead.status === "lost").length,
      color: "#6b7280",
    },
  ].filter((item) => item.value > 0);

  // Lead source data for bar chart
  const sourceData = [
    { name: "Website", value: 35 },
    { name: "Referral", value: 25 },
    { name: "LinkedIn", value: 20 },
    { name: "Email", value: 15 },
    { name: "Other", value: 5 },
  ];

  // Lead trend data for line chart
  const trendData = [
    { name: "Mon", value: 5 },
    { name: "Tue", value: 8 },
    { name: "Wed", value: 12 },
    { name: "Thu", value: 7 },
    { name: "Fri", value: 10 },
    { name: "Sat", value: 4 },
    { name: "Sun", value: 3 },
  ];

  // Top performing users
  const topUsers = users
    .map((user) => {
      const userLeads = leads.filter((lead) => lead.assignedTo === user.id);
      const userWon = userLeads.filter((lead) => lead.status === "won").length;
      return {
        ...user,
        totalLeads: userLeads.length,
        wonLeads: userWon,
        conversionRate:
          userLeads.length > 0 ? (userWon / userLeads.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.wonLeads - a.wonLeads)
    .slice(0, 5);

  // Recent high-value leads
  const highValueLeads = [...leads]
    .filter((lead) => (lead.value ? parseFloat(lead.value) > 0 : false))
    .sort((a, b) => {
      const valueA = a.value ? parseFloat(a.value) : 0;
      const valueB = b.value ? parseFloat(b.value) : 0;
      return valueB - valueA;
    })
    .slice(0, 5);

  // Format currency
  const formatCurrency = (value?: string | number | null) => {
    if (!value) return "$0";
    const numValue =
      typeof value === "string" ? parseFloat(value) : Number(value);
    if (isNaN(numValue)) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(numValue);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  // Get user info
  const getUserInfo = (userId?: string) => {
    if (!userId) return null;
    return users.find((user) => user.id === userId);
  };

  return (
    <div className='space-y-4 max-w-full'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>
          Lead Dashboard
        </h2>
        <div className='flex flex-col md:flex-row w-full md:w-auto items-start md:items-center gap-3'>
          <div className='w-full md:w-auto'>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={(date) => {
                if (date?.from && date?.to) {
                  onDateRangeChange?.({ from: date.from, to: date.to });
                }
              }}
            />
          </div>
          <Button variant='outline' size='sm' className='w-full md:w-auto'>
            <Filter className='mr-2 h-4 w-4' />
            Filters
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Leads</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-xl md:text-2xl font-bold'>{totalLeads}</div>
            <p className='text-xs text-muted-foreground'>
              +20% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Conversion Rate
            </CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{conversionRate}%</div>
            <div className='flex items-center pt-1'>
              <ArrowUpRight className='mr-1 h-3 w-3 text-green-500' />
              <p className='text-xs text-green-500'>+5% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Qualified Leads
            </CardTitle>
            <CalendarRange className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{qualifiedLeads}</div>
            <div className='flex items-center pt-1'>
              <ArrowDownRight className='mr-1 h-3 w-3 text-red-500' />
              <p className='text-xs text-red-500'>-2% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Potential Value
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalValue.toString())}
            </div>
            <p className='text-xs text-muted-foreground'>
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <div className='overflow-x-auto pb-2'>
          <TabsList className='w-full md:w-auto'>
            <TabsTrigger value='overview' className='flex-1 md:flex-none'>
              Overview
            </TabsTrigger>
            <TabsTrigger value='analytics' className='flex-1 md:flex-none'>
              Analytics
            </TabsTrigger>
            <TabsTrigger value='reports' className='flex-1 md:flex-none'>
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 grid-cols-1 lg:grid-cols-7'>
            {/* Status distribution */}
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of leads by current status
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <div className='flex flex-col md:flex-row'>
                  <div className='w-full md:w-1/2 h-[220px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx='50%'
                          cy='50%'
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey='value'
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='w-full md:w-1/2 flex flex-row flex-wrap md:flex-col justify-center gap-2 mt-4 md:mt-0'>
                    {statusData.map((status) => (
                      <div
                        key={status.name}
                        className='flex items-center mr-4 md:mr-0 mb-1 md:mb-2'>
                        <div
                          className='w-3 h-3 rounded-full mr-2'
                          style={{ backgroundColor: status.color }}></div>
                        <span className='text-xs md:text-sm'>
                          {status.name}: {status.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top performers */}
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Team members with highest conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {topUsers.map((user) => (
                    <div key={user.id} className='flex items-center'>
                      <Avatar className='h-9 w-9 mr-3'>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name?.charAt(0) ||
                            user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium'>
                            {user.name || user.email}
                          </p>
                          <Badge variant='outline'>{user.wonLeads} won</Badge>
                        </div>
                        <Progress value={user.conversionRate} className='h-2' />
                        <p className='text-xs text-muted-foreground'>
                          {user.conversionRate.toFixed(0)}% conversion rate
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 grid-cols-1 lg:grid-cols-7'>
            {/* Leads by source */}
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2'>
                <div>
                  <CardTitle>Leads by Source</CardTitle>
                  <CardDescription>
                    Where your leads are coming from
                  </CardDescription>
                </div>
                <Select defaultValue='week'>
                  <SelectTrigger className='w-full md:w-[120px] mt-2 md:mt-0'>
                    <SelectValue placeholder='Select timeframe' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='week'>This week</SelectItem>
                    <SelectItem value='month'>This month</SelectItem>
                    <SelectItem value='quarter'>This quarter</SelectItem>
                    <SelectItem value='year'>This year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className='h-[220px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={sourceData}>
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey='value'
                        fill='#3b82f6'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* High value leads */}
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>High Value Leads</CardTitle>
                <CardDescription>
                  Top opportunities by potential value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {highValueLeads.map((lead) => {
                    const user = getUserInfo(lead.assignedTo);
                    return (
                      <div
                        key={lead.id}
                        className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <div className='mr-3'>
                            <Badge
                              variant='outline'
                              className={`${
                                lead.status === "won"
                                  ? "border-green-500 text-green-500"
                                  : "border-amber-500 text-amber-500"
                              }`}>
                              {lead.status}
                            </Badge>
                          </div>
                          <div>
                            <p className='text-sm font-medium'>
                              {lead.fullName}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {formatDate(lead.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className='text-sm font-medium'>
                          {formatCurrency(lead.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead trend */}
          <Card>
            <CardHeader className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2'>
              <div>
                <CardTitle>Lead Acquisition Trend</CardTitle>
                <CardDescription>New leads over time</CardDescription>
              </div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className='w-full md:w-[120px] mt-2 md:mt-0'>
                  <SelectValue placeholder='Select timeframe' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='week'>This week</SelectItem>
                  <SelectItem value='month'>This month</SelectItem>
                  <SelectItem value='quarter'>This quarter</SelectItem>
                  <SelectItem value='year'>This year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className='h-[250px] md:h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={trendData}>
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='value'
                      stroke='#3b82f6'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics'>
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed analysis of your lead management performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Advanced analytics content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='reports'>
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and download custom reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
