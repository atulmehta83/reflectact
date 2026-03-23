#!/usr/bin/env node
/**
 * Fetch ADO query data and rebuild the dashboard HTML.
 * 
 * Reads ADO_PAT from environment variable.
 * Fetches query ae438a24-5991-4ed8-a85d-0d48f01cc294 from domoreexp/MSTeams.
 * Writes updated docs/index.html with embedded data.
 */

const fs = require('fs');
const path = require('path');

const ADO_PAT = process.env.ADO_PAT;
const ADO_ORG = 'https://dev.azure.com/domoreexp';
const ADO_PROJECT = 'MSTeams';
const QUERY_ID = 'ae438a24-5991-4ed8-a85d-0d48f01cc294';
const DASHBOARD_PATH = path.join(__dirname, '..', 'docs', 'index.html');

if (!ADO_PAT) {
  console.error('Error: ADO_PAT environment variable is required');
  process.exit(1);
}

const AUTH_HEADER = 'Basic ' + Buffer.from(':' + ADO_PAT).toString('base64');

async function adoFetch(url) {
  const resp = await fetch(url, {
    headers: { 'Authorization': AUTH_HEADER, 'Content-Type': 'application/json' }
  });
  if (!resp.ok) throw new Error(`ADO API error: ${resp.status} ${resp.statusText} for ${url}`);
  return resp.json();
}

async function main() {
  console.log('Fetching ADO query results...');
  
  // 1. Run the query
  const queryResult = await adoFetch(
    `${ADO_ORG}/${ADO_PROJECT}/_apis/wit/wiql/${QUERY_ID}?api-version=7.1`
  );
  console.log(`Query type: ${queryResult.queryType}, Relations: ${queryResult.workItemRelations?.length || 0}`);
  
  // 2. Collect all unique IDs
  const relations = (queryResult.workItemRelations || []).map(r => ({
    source: r.source?.id || 0,
    target: r.target?.id || 0
  }));
  
  const allIds = [...new Set(relations.flatMap(r => [r.source, r.target]).filter(id => id > 0))];
  console.log(`Unique work item IDs: ${allIds.length}`);
  
  // 3. Fetch work item details in batches of 200
  const items = [];
  for (let i = 0; i < allIds.length; i += 200) {
    const batch = allIds.slice(i, i + 200).join(',');
    const result = await adoFetch(
      `${ADO_ORG}/${ADO_PROJECT}/_apis/wit/workitems?ids=${batch}&api-version=7.1`
    );
    
    const now = new Date();
    for (const wi of result.value) {
      const f = wi.fields;
      const changedDate = new Date(f['System.ChangedDate']);
      const daysSinceUpdate = Math.floor((now - changedDate) / (1000 * 60 * 60 * 24));
      
      // Compute risk signals
      const risks = [];
      if (f['System.State'] === 'Blocked') risks.push('blocked');
      if (f['System.State'] === 'Proposed') risks.push('proposed');
      if (daysSinceUpdate >= 7) risks.push('stale');
      if (f['Custom.CommittedTargettedCut'] === 'Proposed') risks.push('uncommitted');
      if (f['MicrosoftTeamsCMMI.ShiproomStatusColor'] && f['MicrosoftTeamsCMMI.ShiproomStatusColor'] !== 'Green') risks.push('shiproom');
      
      const r0Date = f['Microsoft.VSTS.Scheduling.TargetDate'] 
        ? new Date(f['Microsoft.VSTS.Scheduling.TargetDate']).toISOString().split('T')[0] : '';
      const r4Date = f['MicrosoftTeamsCMMI.Ring4TargetDate']
        ? new Date(f['MicrosoftTeamsCMMI.Ring4TargetDate']).toISOString().split('T')[0] : '';
      
      if (r0Date && new Date(r0Date) < now) risks.push('r0-overdue');
      if (r4Date && new Date(r4Date) < now) risks.push('r4-overdue');
      if (f['System.WorkItemType'] === 'Feature' && !r0Date) risks.push('r0-missing');
      
      items.push({
        id: wi.id,
        type: f['System.WorkItemType'],
        state: f['System.State'],
        title: f['System.Title'],
        priority: f['Microsoft.VSTS.Common.Priority'],
        assignedTo: f['System.AssignedTo']?.displayName || '',
        changedDate: changedDate.toISOString().split('T')[0],
        daysSinceUpdate,
        shiproom: f['MicrosoftTeamsCMMI.ShiproomStatusColor'] || '',
        committed: f['Custom.CommittedTargettedCut'] || '',
        statusTweet: f['MicrosoftTeamsCMMI.StatusTweet'] || '',
        areaPath: f['System.AreaPath'] || '',
        risks: risks.join(','),
        riskCount: risks.length,
        tags: f['System.Tags'] || '',
        r0Date,
        r4Date
      });
    }
  }
  
  console.log(`Fetched ${items.length} work items`);
  console.log(`  Features: ${items.filter(i => i.type === 'Feature').length}`);
  console.log(`  Tasks: ${items.filter(i => i.type === 'Task').length}`);
  console.log(`  Blocked: ${items.filter(i => i.state === 'Blocked').length}`);
  console.log(`  Stale: ${items.filter(i => i.risks.includes('stale')).length}`);
  
  // 4. Read existing dashboard HTML
  if (!fs.existsSync(DASHBOARD_PATH)) {
    console.error(`Dashboard HTML not found at ${DASHBOARD_PATH}`);
    process.exit(1);
  }
  
  let html = fs.readFileSync(DASHBOARD_PATH, 'utf-8');
  
  // 5. Replace the embedded DATA variable
  const newData = JSON.stringify({ items, relations });
  
  // Match the DATA assignment: const DATA = {...}; or let DATA = {...}; or var DATA = {...};
  const dataRegex = /((?:const|let|var)\s+DATA\s*=\s*)\{[\s\S]*?\}(\s*;)/;
  
  if (dataRegex.test(html)) {
    html = html.replace(dataRegex, `$1${newData}$2`);
    console.log('Replaced embedded DATA variable');
  } else {
    // Try alternate pattern - DATA might be assigned differently
    const altRegex = /(DATA\s*=\s*)\{[\s\S]*?\}(\s*;)/;
    if (altRegex.test(html)) {
      html = html.replace(altRegex, `$1${newData}$2`);
      console.log('Replaced DATA variable (alt pattern)');
    } else {
      console.error('Could not find DATA variable in HTML to replace');
      process.exit(1);
    }
  }
  
  // 6. Update the "Last updated" date in the footer
  const today = new Date().toISOString().split('T')[0];
  html = html.replace(
    /Last updated:?\s*[A-Za-z]+\s+\d{1,2},?\s*\d{4}/gi,
    `Last updated: ${today}`
  );
  html = html.replace(
    /March \d{1,2}, 2026/g,
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  
  // 7. Write updated HTML
  fs.writeFileSync(DASHBOARD_PATH, html, 'utf-8');
  console.log(`Dashboard updated at ${DASHBOARD_PATH}`);
  console.log(`Data size: ${(newData.length / 1024).toFixed(1)} KB`);
  console.log(`HTML size: ${(html.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
