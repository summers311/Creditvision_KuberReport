"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { BarChart, PieChart } from "@/components/charts"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"
import { Search } from "lucide-react"

const AddressHeatmap = dynamic(() => import("@/components/address-heatmap"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading map...</div>,
})

export default function CreditReport() {
  // State for customer data
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // State for dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    avgAge: 0,
    avgVantage: 0,
    avgUtilization: 0,
    totalDebt: 0,
    age18_30: 0,
    age31_45: 0,
    age46_60: 0,
    age60Plus: 0,
    vantage500_600: 0,
    vantage600_700: 0,
    vantage700Plus: 0,
  })

  // State for campaign stats
  const [campaignStats, setCampaignStats] = useState([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [campaignPagination, setCampaignPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // State for address data
  const [addressData, setAddressData] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(true)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch customers when page or search changes
  useEffect(() => {
    async function fetchCustomers() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/customers?page=${pagination.page}&limit=${pagination.limit}&search=${debouncedSearch}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch customers")
        }

        const result = await response.json()
        setCustomers(result.data)
        setPagination(result.pagination)
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [pagination.page, pagination.limit, debouncedSearch])

  // Fetch dashboard stats
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch("/api/dashboard")

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const result = await response.json()
        setDashboardStats(result)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    fetchDashboardStats()
  }, [])

  // Fetch campaign stats
  useEffect(() => {
    async function fetchCampaignStats() {
      setCampaignsLoading(true)
      try {
        const response = await fetch(
          `/api/campaigns?page=${campaignPagination.page}&limit=${campaignPagination.limit}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch campaign stats")
        }

        const result = await response.json()
        setCampaignStats(result.data)
        setCampaignPagination(result.pagination)
      } catch (error) {
        console.error("Error fetching campaign stats:", error)
      } finally {
        setCampaignsLoading(false)
      }
    }

    fetchCampaignStats()
  }, [campaignPagination.page, campaignPagination.limit])

  // Fetch address data
  useEffect(() => {
    async function fetchAddressData() {
      setAddressesLoading(true)
      try {
        const response = await fetch("/api/addresses")

        if (!response.ok) {
          throw new Error("Failed to fetch address data")
        }

        const result = await response.json()
        setAddressData(result)
      } catch (error) {
        console.error("Error fetching address data:", error)
      } finally {
        setAddressesLoading(false)
      }
    }

    fetchAddressData()
  }, [])

  // Prepare chart data
  const ageDistributionData = [
    { name: "18-30", value: dashboardStats.age18_30 },
    { name: "31-45", value: dashboardStats.age31_45 },
    { name: "46-60", value: dashboardStats.age46_60 },
    { name: "60+", value: dashboardStats.age60Plus },
  ]

  // Add console.log to debug dashboard stats
  console.log("Dashboard Stats:", dashboardStats);
  console.log("Vantage Score Data Values:", {
    "500-600": dashboardStats.vantage500_600,
    "600-700": dashboardStats.vantage600_700,
    "700+": dashboardStats.vantage700Plus
  });

  // Use the actual values from the database
  const vantageScoreData = [
    { name: "500-600", value: Number(dashboardStats.vantage500_600) || 0 },
    { name: "600-700", value: Number(dashboardStats.vantage600_700) || 0 },
    { name: "700+", value: Number(dashboardStats.vantage700Plus) || 0 },
  ]
  
  // Add console.log to debug vantage score data
  console.log("Vantage Score Data:", vantageScoreData);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.2]"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Creditvision KuberReport</h1>
              <p className="text-blue-100 mt-1 font-medium">Comprehensive Kuber Dashboard</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Age</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 p-3 rounded-full bg-blue-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {Math.round(dashboardStats.avgAge) || <Skeleton className="h-8 w-16" />}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Vantage Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 p-3 rounded-full bg-indigo-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {Math.round(dashboardStats.avgVantage) || <Skeleton className="h-8 w-16" />}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 p-3 rounded-full bg-green-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-800">{Math.round(dashboardStats.avgUtilization)}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Debt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 p-3 rounded-full bg-purple-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  $
                  {dashboardStats.totalDebt ? (
                    (Number(dashboardStats.totalDebt) / 
                    (Number(dashboardStats.age18_30) + 
                     Number(dashboardStats.age31_45) + 
                     Number(dashboardStats.age46_60) + 
                     Number(dashboardStats.age60Plus))).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  ) : (
                    <Skeleton className="h-8 w-24" />
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">Age Distribution</CardTitle>
              <div className="p-2 rounded-full bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Distribution of customers by age group</p>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {dashboardStats.avgAge ? (
              <BarChart data={ageDistributionData} />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">Vantage Score Distribution</CardTitle>
              <div className="p-2 rounded-full bg-indigo-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Distribution of customers by credit score range</p>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {dashboardStats.avgVantage ? (
              <PieChart data={vantageScoreData} />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full rounded-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Address Distribution</CardTitle>
            <div className="p-2 rounded-full bg-green-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Geographic distribution of customers across the United States</p>
        </CardHeader>
        <CardContent className="h-[400px] pt-4">
          {!addressesLoading ? (
            <AddressHeatmap addresses={addressData} />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8 bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Campaign Statistics</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Detailed statistics for each marketing campaign</p>
            </div>
            <div className="p-2 rounded-full bg-purple-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!campaignsLoading ? (
            <>
              <div className="overflow-x-auto">
                <Table className="border-collapse w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign (CSV Filename)</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail Date</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Debt</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Vantage</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Utilization</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Age</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score 500-600</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score 600-700</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score 700+</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignStats.map((campaign: any, index: number) => (
                      <TableRow 
                        key={campaign.csv_filename} 
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <TableCell className="py-3 px-4 text-sm font-medium text-gray-900">{campaign.csv_filename}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{campaign.mail_date || '-'}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{campaign.count.toLocaleString()}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">
                          <span className="font-medium text-green-700">$
                          {Number(campaign.totalDebt).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}</span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{Math.round(campaign.avgVantage)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{Math.round(campaign.avgUtilization)}%</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{Math.round(campaign.avgAge)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{campaign.range500_600.toLocaleString()}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{campaign.range600_700.toLocaleString()}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{campaign.range700Plus.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {campaignPagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {campaignPagination.page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            className="rounded-md border border-gray-200 hover:bg-gray-50"
                            onClick={() => setCampaignPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                          />
                        </PaginationItem>
                      )}

                      {Array.from({ length: Math.min(5, campaignPagination.totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum
                        if (campaignPagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (campaignPagination.page <= 3) {
                          pageNum = i + 1
                        } else if (campaignPagination.page >= campaignPagination.totalPages - 2) {
                          pageNum = campaignPagination.totalPages - 4 + i
                        } else {
                          pageNum = campaignPagination.page - 2 + i
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              className="rounded-md border border-gray-200 hover:bg-gray-50"
                              isActive={pageNum === campaignPagination.page}
                              onClick={() => setCampaignPagination((prev) => ({ ...prev, page: pageNum }))}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      {campaignPagination.page < campaignPagination.totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            className="rounded-md border border-gray-200 hover:bg-gray-50"
                            onClick={() => setCampaignPagination((prev) => ({ ...prev, page: prev.page + 1 }))} 
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="text-sm text-gray-500 mt-4 text-center">
                Showing {campaignStats.length} of {campaignPagination.total} campaigns
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8 bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Customer Data</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Detailed information about individual customers</p>
            </div>
            <div className="mt-3 sm:mt-0 relative w-full sm:w-auto sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name or REFCODE..."
                className="pl-8 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on search
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!isLoading ? (
            <>
              <div className="overflow-x-auto">
                <Table className="border-collapse w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REFCODE</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail Date</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vantage Score</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debt</TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any, index: number) => (
                      <TableRow 
                        key={customer.id} 
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <TableCell className="py-3 px-4 text-sm font-medium text-blue-600">{customer.REFCODE || '-'}</TableCell>
                        <TableCell className="py-3 px-4 text-sm font-medium text-gray-900">{`${customer.fname} ${customer.mname ? customer.mname + " " : ""}${customer.lname}`}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{customer.age}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{customer.MAIL_DATE || '-'}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            customer.vantage >= 700 ? 'bg-green-100 text-green-800' : 
                            customer.vantage >= 600 ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customer.vantage}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{customer.utilization}%</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">
                          <span className="font-medium text-green-700">$
                          {Number(customer.debt).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}</span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700">{customer.csv_filename}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {pagination.page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            className="rounded-md border border-gray-200 hover:bg-gray-50"
                            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                          />
                        </PaginationItem>
                      )}

                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              className="rounded-md border border-gray-200 hover:bg-gray-50"
                              isActive={pageNum === pagination.page}
                              onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      {pagination.page < pagination.totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            className="rounded-md border border-gray-200 hover:bg-gray-50"
                            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))} 
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="text-sm text-gray-500 mt-4 text-center">
                Showing {customers.length} of {pagination.total} records
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </CardContent>
      </Card>
      </main>
      
      <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center">
            <a 
              href="https://www.d1al.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Powered by d1al</span>
            </a>
            <p className="mt-2 text-sm text-gray-500">© {new Date().getFullYear()} d1al. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
