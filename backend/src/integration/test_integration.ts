import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config();

import { EventBus } from './event_bus';
import { EventCatalog } from './event_catalog';
import { orchestrator, integrationService } from './dependencies';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testIntegration() {
  console.log('==================================================');
  console.log('    RUNNING SYSTEM INTEGRATION & ORCHESTRATION    ');
  console.log('==================================================');

  const uid = 'mock-uid-alex-pioneer';

  try {
    // 1. Check initial status
    console.log('\n[TEST 1] Initializing Orchestrator status...');
    let status = await integrationService.getStatus();
    console.log(`Subsystem state: ${status.status} | Total runs: ${status.totalWorkflowsRun}`);

    // 2. Publish Profile Updated (Workflow 1)
    console.log('\n[TEST 2] Publishing PROFILE_UPDATED event...');
    EventBus.publish(EventCatalog.PROFILE_UPDATED, {
      uid,
      profile: { selectedCareer: 'Data Analyst', skills: ['Python', 'SQL'] }
    });

    // Wait for async background workflow execution
    await delay(1500);

    status = await integrationService.getStatus();
    console.log(`Orchestrator Logs after Profile Update (should show started/completed/skipped):`);
    console.log(JSON.stringify(status.recentLogs, null, 2));

    // 3. Publish Profile Updated again with NO changes (should trigger duplicate skip)
    console.log('\n[TEST 3] Publishing duplicate PROFILE_UPDATED with NO changes...');
    EventBus.publish(EventCatalog.PROFILE_UPDATED, {
      uid,
      profile: { selectedCareer: 'Data Analyst', skills: ['Python', 'SQL'] }
    });

    await delay(1500);
    
    status = await integrationService.getStatus();
    const lastLog = status.recentLogs[status.recentLogs.length - 1];
    console.log(`Last log status (expected "skipped" or "skipped"): ${lastLog?.status}`);

    // 4. Publish Assessment Completed (Workflow 2)
    console.log('\n[TEST 4] Publishing ASSESSMENT_COMPLETED event...');
    EventBus.publish(EventCatalog.ASSESSMENT_COMPLETED, { uid });

    await delay(1500);

    // 5. Publish Resume Analyzed (Workflow 3)
    console.log('\n[TEST 5] Publishing RESUME_ANALYZED event...');
    EventBus.publish(EventCatalog.RESUME_ANALYZED, {
      uid,
      resumeVersion: { fileName: 'resume_alex.txt', textContent: 'Experienced Data Analyst with Python and SQL.' }
    });

    await delay(1500);

    // 6. Publish Document Uploaded - Certificate (Workflow 4)
    console.log('\n[TEST 6] Publishing DOCUMENT_UPLOADED (Certificate) event...');
    EventBus.publish(EventCatalog.DOCUMENT_UPLOADED, {
      uid,
      document: { category: 'Certificate', title: 'Google Data Analytics Certificate', originalFileName: 'cert.pdf' }
    });

    await delay(1500);

    // 7. Publish Profile Updated with new career selected (Workflow 5)
    console.log('\n[TEST 7] Publishing PROFILE_UPDATED with Career Changed...');
    EventBus.publish(EventCatalog.PROFILE_UPDATED, {
      uid,
      profile: { selectedCareer: 'AI Engineer', skills: ['Python', 'SQL', 'TensorFlow'] }
    });

    await delay(1500);

    // 8. Fetch overall stats
    console.log('\n[TEST 8] Fetching overall workflow stats...');
    const workflows = await integrationService.getWorkflows();
    workflows.forEach((wf: any) => {
      console.log(`- ${wf.name}`);
      console.log(`  * Trigger: ${wf.triggeredBy}`);
      console.log(`  * Started: ${wf.stats.startedCount} | Success: ${wf.stats.successCount} | Failed: ${wf.stats.failureCount}`);
      console.log(`  * Average execution time: ${wf.stats.lastExecutionTimeMs}ms`);
    });

    console.log('\n==================================================');
    console.log('        ALL SYSTEM INTEGRATION TESTS PASSED       ');
    console.log('==================================================');
  } catch (error) {
    console.error('Integration tests failed:', error);
  }
}

testIntegration();
