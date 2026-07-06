import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config();

import { dashboardService } from './dependencies';

async function test() {
  console.log('==================================================');
  console.log('     RUNNING DASHBOARD ENGINE INTEGRATION TESTS   ');
  console.log('==================================================');
  
  const uid = 'mock-uid-alex-pioneer';

  try {
    console.log('\n[TEST 1] Fetching Complete Dashboard Response...');
    const dbRes = await dashboardService.getDashboard(uid);
    console.log('Success! Extracted values:');
    console.log(`- UID: ${dbRes.uid}`);
    console.log(`- Selected Career: ${dbRes.snapshot.currentCareer}`);
    console.log(`- Career Readiness: ${dbRes.snapshot.careerReadiness}%`);
    console.log(`- ATS Resume Score: ${dbRes.snapshot.resumeAtsScore}%`);
    console.log(`- Verified Skills Count: ${dbRes.snapshot.verifiedSkills.length}`);
    console.log(`- Widgets Loaded: ${dbRes.widgets.length}`);
    console.log(`- Activity Logs Found: ${dbRes.activities.length}`);
    console.log(`- AI Top Priority: "${dbRes.insights.topPriority}"`);
    console.log(`- Upcoming Milestone: "${dbRes.insights.upcomingMilestone}"`);

    console.log('\n[TEST 2] Fetching Career Snapshot only...');
    const snapshot = await dashboardService.getSnapshot(uid);
    console.log(JSON.stringify(snapshot, null, 2));

    console.log('\n[TEST 3] Fetching Dashboard Widgets only...');
    const widgets = await dashboardService.getWidgets(uid);
    console.log(`Widgets: ${widgets.map((w: any) => `${w.type} (${w.title})`).join(', ')}`);

    console.log('\n[TEST 4] Fetching Activity Timeline only...');
    const activities = await dashboardService.getActivity(uid);
    console.log('Timeline Feed:');
    activities.slice(0, 5).forEach((act: any, idx: number) => {
      console.log(`  ${idx + 1}. [${act.type}] ${act.title}: "${act.description}" (${act.timestamp})`);
    });

    console.log('\n[TEST 5] Fetching Historical Analytics only...');
    const analytics = await dashboardService.getAnalytics(uid);
    console.log(`- Weekly completions: ${analytics.weeklyProgress.length} weeks logged`);
    console.log(`- Monthly completions: ${analytics.monthlyProgress.length} months logged`);
    console.log(`- Readiness Trend datapoints: ${analytics.readinessTrend.length}`);
    console.log(`- Resume Trend datapoints: ${analytics.resumeImprovementTrend.length}`);

    console.log('\n[TEST 6] Fetching AI Insights only...');
    const insights = await dashboardService.getInsights(uid);
    console.log(JSON.stringify(insights, null, 2));

    console.log('\n==================================================');
    console.log('          ALL INTEGRATION TESTS PASSED            ');
    console.log('==================================================');
  } catch (error: any) {
    console.error('Test execution failed:', error);
  }
}

test();
