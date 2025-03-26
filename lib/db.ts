import mysql from "mysql2/promise"
import { dbConfig } from "../config/db-config"

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Log a message to confirm this new version is being loaded
console.log("NEW VERSION of db.ts loaded successfully")

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

// Completely rewritten executeQuery function
export async function executeQuery(query: string, params: any[] = []) {
  console.log("NEW executeQuery function called")
  console.log("Query:", query)
  console.log("Params:", params)
  
  // Automatically fix SQL queries with missing commas
  if (query.includes("SELECT") && query.includes("\n")) {
    console.log("Fixing SQL query with missing commas")
    // Add commas between lines in SELECT statements
    const lines = query.split("\n")
    const fixedLines = []
    let inSelect = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.includes("SELECT")) {
        inSelect = true
        fixedLines.push(lines[i])
      } else if (line.includes("FROM")) {
        inSelect = false
        fixedLines.push(lines[i])
      } else if (inSelect && line && !line.endsWith(",") && i < lines.length - 1 && 
                lines[i+1].trim() && !lines[i+1].trim().includes("FROM")) {
        fixedLines.push(lines[i] + ",")
      } else {
        fixedLines.push(lines[i])
      }
    }
    
    query = fixedLines.join("\n")
    console.log("Fixed query:", query)
  }
  
  try {
    // Make sure we're using the correct syntax with a different approach
    console.log("Using a different approach for pool.execute")
    // Use a completely different approach to avoid any transpilation issues
    const result = await pool.query(query, params)
    return result[0]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function getCustomers(page = 1, limit = 50, search = "") {
  console.log("getCustomers called with:", { page, limit, search })
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

  try {
    const countResult = await executeQuery(countQuery, search ? [`%${search}%`] : []) as any[]
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
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw error
  }
}

export async function getCampaignStats() {
  console.log("getCampaignStats called")
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

  return await executeQuery(query, [])
}

export async function getDashboardStats() {
  console.log("getDashboardStats called")
  
  // First, let's check if there are any records with vantage scores
  const checkQuery = `
    SELECT 
      COUNT(*) as total,
      MIN(vantage) as minVantage,
      MAX(vantage) as maxVantage
    FROM KuberFinalMailFiles
  `
  
  const checkResult = await executeQuery(checkQuery, []) as any[]
  console.log("Vantage Score Check:", checkResult[0])
  
  // Now let's get the dashboard stats with explicit counts for each vantage range
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
      SUM(CASE WHEN vantage >= 700 THEN 1 ELSE 0 END) as vantage700Plus,
      COUNT(CASE WHEN vantage < 600 THEN 1 END) as count500_600,
      COUNT(CASE WHEN vantage >= 600 AND vantage < 700 THEN 1 END) as count600_700,
      COUNT(CASE WHEN vantage >= 700 THEN 1 END) as count700Plus
    FROM KuberFinalMailFiles
  `

  const result = await executeQuery(query, []) as any[]
  console.log("Dashboard Stats Result:", result[0])
  
  // Log the result for debugging
  console.log("Dashboard Stats Result:", result[0])
  
  return result[0]
}

export async function getAddressData() {
  console.log("getAddressData called")
  // This query gets a sample of addresses for the heatmap
  // We'll need to geocode these addresses to get lat/lng
  const query = `
    SELECT 
      id, address, CITY, ST, ZIP
    FROM KuberFinalMailFiles
    LIMIT 500
  `

  return await executeQuery(query, [])
}
