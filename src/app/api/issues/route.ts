import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define the absolute paths to the JSON log files
const ISSUES_DIR = path.join(process.cwd(), 'issues');
const CURRENT_ISSUES_FILE = path.join(ISSUES_DIR, 'current_issues.json');
const RESOLVED_ISSUES_FILE = path.join(ISSUES_DIR, 'resolved_issues.json');

// Interface for strongly typed issue logging
interface Issue {
  id: string;
  timestamp: string;
  userId: string | null;
  message: string;
  stack: string | null;
  status: 'encountered' | 'recurring' | 'unfixed' | 'resolved';
  occurrences?: number;
}

/**
 * Ensures the target JSON file exists and returns its parsed array.
 */
async function getIssuesFromFile(filePath: string): Promise<Issue[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Create empty array if file misses
      await fs.mkdir(ISSUES_DIR, { recursive: true });
      await fs.writeFile(filePath, '[]', 'utf-8');
      return [];
    }
    console.error(`Error parsing ${filePath}:`, error);
    return [];
  }
}

/**
 * Writes the entire issues array back to the target file safely
 */
async function writeIssuesToFile(filePath: string, issues: Issue[]) {
  const jsonOutput = JSON.stringify(issues, null, 2);
  await fs.writeFile(filePath, jsonOutput, 'utf-8');
}

/**
 * POST /api/issues
 * Logs a new error to current_issues.json
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, stack, userId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const currentIssues = await getIssuesFromFile(CURRENT_ISSUES_FILE);

    // Look for recurring errors based on exact message matching
    const existingIssueIndex = currentIssues.findIndex(i => i.message === message);

    if (existingIssueIndex !== -1) {
      // Mark as recurring and increment occurrence count
      currentIssues[existingIssueIndex].status = 'recurring';
      currentIssues[existingIssueIndex].occurrences = (currentIssues[existingIssueIndex].occurrences || 1) + 1;
      currentIssues[existingIssueIndex].timestamp = new Date().toISOString(); // Update timestamp to latest occurrence
    } else {
      // Append entirely new issue
      const newIssue: Issue = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: userId || null,
        message,
        stack: stack || null,
        status: 'encountered',
        occurrences: 1,
      };
      currentIssues.push(newIssue);
    }

    await writeIssuesToFile(CURRENT_ISSUES_FILE, currentIssues);
    return NextResponse.json({ success: true, message: 'Issue logged successfully' });
  } catch (error) {
    console.error("API /api/issues -> POST Failure:", error);
    return NextResponse.json({ error: 'Failed to process issue' }, { status: 500 });
  }
}

/**
 * GET /api/issues
 * Retrieves issues from current_issues.json and resolved_issues.json
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'active'; // 'active' or 'resolved'
    
    const targetFile = type === 'resolved' ? RESOLVED_ISSUES_FILE : CURRENT_ISSUES_FILE;
    const issues = await getIssuesFromFile(targetFile);
    
    return NextResponse.json(issues);
  } catch (error) {
    console.error("API /api/issues -> GET Failure:", error);
    return NextResponse.json({ error: 'Failed to retrieve issues' }, { status: 500 });
  }
}

/**
 * PATCH /api/issues
 * Marks an issue as "resolved" and moves it to resolved_issues.json
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { issueId } = body;

    if (!issueId) {
      return NextResponse.json({ error: 'issueId is required' }, { status: 400 });
    }

    const currentIssues = await getIssuesFromFile(CURRENT_ISSUES_FILE);
    const issueIndex = currentIssues.findIndex(i => i.id === issueId);

    if (issueIndex === -1) {
      return NextResponse.json({ error: 'Issue not found in active log' }, { status: 404 });
    }

    // Extract issue and modify state
    const [resolvedIssue] = currentIssues.splice(issueIndex, 1);
    resolvedIssue.status = 'resolved';
    
    // Save updated arrays
    await writeIssuesToFile(CURRENT_ISSUES_FILE, currentIssues);

    const resolvedIssuesList = await getIssuesFromFile(RESOLVED_ISSUES_FILE);
    resolvedIssuesList.push(resolvedIssue);
    await writeIssuesToFile(RESOLVED_ISSUES_FILE, resolvedIssuesList);

    return NextResponse.json({ success: true, message: 'Issue successfully resolved and archived' });
  } catch (error) {
    console.error("API /api/issues -> PATCH Failure:", error);
    return NextResponse.json({ error: 'Failed to resolve issue' }, { status: 500 });
  }
}
