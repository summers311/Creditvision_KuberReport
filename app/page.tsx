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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Credit Report Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Average Age</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round(dashboardStats.avgAge) || <Skeleton className="h-8 w-16" />}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Vantage Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round(dashboardStats.avgVantage) || <Skeleton className="h-8 w-16" />}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(dashboardStats.avgUtilization)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {dashboardStats.avgAge ? (
              <BarChart data={ageDistributionData} />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vantage Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Address Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {!addressesLoading ? (
            <AddressHeatmap addresses={addressData} />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Campaign Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {!campaignsLoading ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign (CSV Filename)</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Total Debt</TableHead>
                      <TableHead>Avg. Vantage</TableHead>
                      <TableHead>Avg. Utilization</TableHead>
                      <TableHead>Avg. Age</TableHead>
                      <TableHead>Score 500-600</TableHead>
                      <TableHead>Score 600-700</TableHead>
                      <TableHead>Score 700+</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignStats.map((campaign: any) => (
                      <TableRow key={campaign.csv_filename}>
                        <TableCell className="font-medium">{campaign.csv_filename}</TableCell>
                        <TableCell>{campaign.count}</TableCell>
                        <TableCell>
                          $
                          {Number(campaign.totalDebt).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>{Math.round(campaign.avgVantage)}</TableCell>
                        <TableCell>{Math.round(campaign.avgUtilization)}%</TableCell>
                        <TableCell>{Math.round(campaign.avgAge)}</TableCell>
                        <TableCell>{campaign.range500_600}</TableCell>
                        <TableCell>{campaign.range600_700}</TableCell>
                        <TableCell>{campaign.range700Plus}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {campaignPagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {campaignPagination.page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
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
                          <PaginationNext onClick={() => setCampaignPagination((prev) => ({ ...prev, page: prev.page + 1 }))} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="text-sm text-muted-foreground mt-2 text-center">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Data</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on search
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Vantage Score</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Debt</TableHead>
                      <TableHead>Campaign</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell>{`${customer.fname} ${customer.mname ? customer.mname + " " : ""}${customer.lname}`}</TableCell>
                        <TableCell>{customer.age}</TableCell>
                        <TableCell>{customer.vantage}</TableCell>
                        <TableCell>{customer.utilization}%</TableCell>
                        <TableCell>
                          $
                          {Number(customer.debt).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>{customer.csv_filename}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {pagination.page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
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
                          <PaginationNext onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="text-sm text-muted-foreground mt-2 text-center">
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
    </div>
  )
}
