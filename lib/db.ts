import mysql from "mysql2/promise"
import { dbConfig } from "../config/db-config"

// Database connection configuration is imported from config/db-config.ts
// Edit that file to switch between local and server environments

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Test the connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Database connection established successfully")
    connection.release()
    return true
  } catch (error) {
    console.error("Error connecting to database:", error)
    return false
  }
}

// Call the test function
testConnection()

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params)
    return rows
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function getCustomers(page = 1, limit = 50, search = "") {
  const offset = (page - 1) * limit

  let query = `
    SELECT 
      id, fname, mname, lname, address, address2, CITY, ST, ZIP, 
      MAIL_DATE, MAIL_CLASS, EXP_DATE, INHOME_DATE, CLIENT, 
      csv_filename, age, vantage, utilization, debt, selection_grp, 
      rev_debt, unsecured_debt, campaign_id
    FROM KuberFinalMailFiles
  `

  const params = []

  if (search) {
    query += ` WHERE CONCAT(fname, ' ', IFNULL(mname, ''), ' ', lname) LIKE ?`
    params.push(`%${search}%`)
  }

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM KuberFinalMailFiles ${
    search ? `WHERE CONCAT(fname, ' ', IFNULL(mname, ''), ' ', lname) LIKE ?` : ""
  }`

  const [countResult] = (await pool.execute(countQuery, search ? [`%${search}%`] : [])) as any
  const total = countResult[0].total

  // Add pagination
  query += ` LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const rows = await executeQuery(query, params)

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getCampaignStats() {
  const query = `
    SELECT 
      csv_filename,
      COUNT(*) as count,
      AVG(age) as avgAge,
      AVG(vantage) as avgVantage,
      AVG(utilization) as avgUtilization,
      SUM(debt) as totalDebt,
      SUM(CASE WHEN vantage < 600 THEN 1 ELSE 0 END) as range500_600,
      SUM(CASE WHEN vantage >= 600 AND vantage < 700 THEN 1 ELSE 0 END) as range600_700,
      SUM(CASE WHEN vantage >= 700 THEN 1 ELSE 0 END) as range700Plus
    FROM KuberFinalMailFiles
    GROUP BY csv_filename
  `

  return await executeQuery(query)
}

export async function getDashboardStats() {
  const query = `
    SELECT 
      AVG(age) as avgAge,
      AVG(vantage) as avgVantage,
      AVG(utilization) as avgUtilization,
      SUM(debt) as totalDebt,
      SUM(CASE WHEN age <= 30 THEN 1 ELSE 0 END) as age18_30,
      SUM(CASE WHEN age > 30 AND age <= 45 THEN 1 ELSE 0 END) as age31_45,
      SUM(CASE WHEN age > 45 AND age <= 60 THEN 1 ELSE 0 END) as age46_60,
      SUM(CASE WHEN age > 60 THEN 1 ELSE 0 END) as age60Plus,
      SUM(CASE WHEN vantage < 600 THEN 1 ELSE 0 END) as vantage500_600,
      SUM(CASE WHEN vantage >= 600 AND vantage < 700 THEN 1 ELSE 0 END) as vantage600_700,
      SUM(CASE WHEN vantage >= 700 THEN 1 ELSE 0 END) as vantage700Plus
    FROM KuberFinalMailFiles
  `

  const [result] = (await executeQuery(query)) as any[]
  return result
}

export async function getAddressData() {
  // This query gets a sample of addresses for the heatmap
  // We'll need to geocode these addresses to get lat/lng
  const query = `
    SELECT 
      id, address, CITY, ST, ZIP
    FROM KuberFinalMailFiles
    LIMIT 500
  `

  return await executeQuery(query)
}
