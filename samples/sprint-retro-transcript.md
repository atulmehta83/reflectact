# Sprint 24 Retrospective — Team Phoenix
**Date:** February 27, 2026  
**Duration:** 30 minutes  
**Facilitator:** Sarah Chen  
**Participants:** Sarah Chen (Engineering Manager), Marcus Johnson (Backend Lead), Priya Patel (Frontend Engineer), David Kim (Mobile Engineer), Lisa Nguyen (QA Lead), James Rodriguez (DevOps Engineer), Amy Torres (Product Manager)

---

## Transcript

**[00:00:12] Sarah Chen:** Alright everyone, looks like we're all here. Let me go ahead and get us started. Welcome to the Sprint 24 retro. As a reminder, we're going to go through our usual format — what went well, what didn't go so well, and then we'll wrap up with action items. I've got the board up, I see some of you have already started adding stickies, which is great. Let's give everyone another minute to finish adding anything they want to call out.

**[00:00:38] Amy Torres:** Quick question, Sarah — are we covering both the payments service migration and the dashboard redesign in this retro, or just the payments work?

**[00:00:45] Sarah Chen:** Good question. Let's cover everything from this sprint — so the payments migration, the dashboard redesign, and the API versioning work that James and Marcus were doing. I want to make sure we capture everything.

**[00:01:02] Marcus Johnson:** Sounds good. I added a couple of notes on the API versioning side.

**[00:01:08] Sarah Chen:** Perfect. Okay, let's dive in. I'm going to start with the "What Went Well" column. I see we have quite a few items here. Priya, it looks like you added a few — do you want to kick us off?

**[00:01:22] Priya Patel:** Sure. So the biggest win for me this sprint was the new component library rollout. We finally got the design system tokens integrated into the dashboard, and the collaboration with the design team was honestly the smoothest it's ever been. We had shared Figma files, we had a clear handoff process, and I think we only had maybe two or three back-and-forth cycles on the entire set of components. Normally that's like ten.

**[00:01:48] David Kim:** Yeah, I want to echo that. The design tokens being shared across web and mobile was huge. I was able to pull in the same color and spacing values directly into the iOS and Android builds without having to manually translate anything. That saved me probably a full day of work.

**[00:02:05] Sarah Chen:** That's great to hear. The investment we made in that shared token pipeline last quarter is clearly paying off. Marcus, I see you added something about the payments migration.

**[00:02:16] Marcus Johnson:** Yeah, so the payments service migration to the new microservice architecture — we actually finished it two days ahead of schedule, which I don't think has happened in the last three sprints. The reason it went well, I think, is because we did that spike in the previous sprint where we mapped out all the database schema changes upfront. Having that migration plan documented before we wrote a single line of code made a massive difference. We caught three potential data integrity issues during the planning phase that would have been production incidents if we'd found them later.

**[00:02:52] Lisa Nguyen:** And from a QA perspective, the test coverage on the payments migration was really solid. Marcus and his team wrote unit tests as they went, which meant by the time it got to me for integration testing, I wasn't finding basic logic bugs. I was actually able to focus on edge cases and load testing, which is how it should be.

**[00:03:12] James Rodriguez:** I want to add to that — the CI/CD pipeline changes for the payments service went really smoothly. We set up the blue-green deployment strategy early in the sprint, and when it came time to do the actual cutover, it was literally a config change. No downtime, no drama. I think the key was that we pair-programmed on the Terraform configs instead of having one person own it.

**[00:03:35] Sarah Chen:** Love it. Those are all great callouts. Anyone else on the "went well" side?

**[00:03:41] Amy Torres:** I just want to mention from the product side — the stakeholder demo we did on Thursday went really well. We had three VPs in the room and the feedback was overwhelmingly positive, especially on the dashboard redesign. I think a big part of that was the fact that we had a working prototype to show, not just mockups. Priya and David, the work you did to get that interactive demo ready was clutch.

**[00:04:05] Priya Patel:** Thanks, Amy. Yeah, I stayed late Tuesday to get the animations polished, but it was worth it seeing the reaction in that room.

**[00:04:13] David Kim:** Same on the mobile side. The offline sync feature demo got a lot of attention. One of the VPs specifically asked when it would be available for the field sales team.

**[00:04:25] Sarah Chen:** That's awesome. Okay, let's transition to the "What Didn't Go Well" column. I see some themes here. Who wants to start?

**[00:04:35] Marcus Johnson:** I'll go. So the API versioning work — we significantly underestimated the effort on that. We scoped it as a three-point story and it ended up being closer to an eight or a thirteen. The issue was that we didn't account for all the downstream consumers of the V1 API. We thought there were four services consuming it, but it turned out there were nine, including two that nobody on our team even knew about. We had to do a bunch of detective work mid-sprint to figure out who was calling what.

**[00:05:08] James Rodriguez:** Yeah, and that caused a cascading problem for me because the deployment pipeline for the API versioning was dependent on knowing all the consumers. I had to redo the deployment plan twice. And the second time, we found out there was a legacy batch job running on a cron schedule that was hitting the V1 endpoint every night at 2 AM. That one wasn't in any of our service discovery tools.

**[00:05:32] Sarah Chen:** That's a good one to dig into. What do you think we could do differently next time?

**[00:05:37] Marcus Johnson:** Honestly, I think we need a better service discovery and dependency mapping tool. Right now, we're relying on tribal knowledge and manually maintained documentation, which is obviously incomplete. I'd love to set up something that can automatically trace API call graphs across our services.

**[00:05:55] James Rodriguez:** Agreed. Even just having an API gateway that logs all consumers would help. We could look at the access logs for the past 30 days and know exactly who's calling what.

**[00:06:08] Lisa Nguyen:** Can I jump in on the testing side? So related to that — because we didn't know about all the consumers, we also didn't have integration tests covering those paths. I found two breaking changes in the staging environment that would have gone to production if we hadn't done the extra round of smoke testing. That was a close call.

**[00:06:28] Sarah Chen:** That is concerning. Lisa, do you feel like we need a more formalized process for identifying integration test gaps when we make breaking API changes?

**[00:06:38] Lisa Nguyen:** Absolutely. I think before we approve any story that involves a breaking API change, there should be a mandatory step where we identify all consumers and write at least a smoke test for each one. It adds time upfront but saves us from production incidents.

**[00:06:55] Sarah Chen:** That sounds like a great action item. Let me capture that. What else? David, I see you had something about mobile builds.

**[00:07:04] David Kim:** Yeah, so the mobile build times have gotten really bad this sprint. Our iOS build went from about twelve minutes to twenty-two minutes after we added the new analytics SDK. And on the Android side, we're seeing similar degradation. It's killing developer productivity because every time I make a change and want to test on device, I'm waiting almost twenty-five minutes. I've started just writing code blind and batching my tests, which is... not great for quality.

**[00:07:32] James Rodriguez:** That's partially on me — I know the build caching layer broke when we upgraded the CI runner images two weeks ago. I've been meaning to fix it but kept getting pulled into the payments migration deployment work. The cache invalidation strategy we had was tied to the old runner image paths.

**[00:07:50] David Kim:** No worries, James. I know you've been slammed. But I do think this needs to be a priority next sprint because it's affecting the whole mobile team, not just me. Sarah mentioned that the other mobile squad is seeing the same thing.

**[00:08:05] Sarah Chen:** Yeah, that's right. I got a message from Raj's team saying their builds are also taking significantly longer. Let's make sure we capture this as a high-priority item.

**[00:08:16] Priya Patel:** I want to bring up the frontend testing situation too. So we've been using this new end-to-end testing framework — Playwright — and the tests are really flaky. Out of our fifty-three E2E tests, we had about twelve that were intermittently failing this sprint. And the problem is, when the E2E tests fail, it blocks the entire PR merge pipeline. So there were at least three occasions this sprint where I had PRs stuck in review for over a day because of flaky tests that had nothing to do with my changes.

**[00:08:48] Lisa Nguyen:** I'm aware of the flakiness issue. Part of it is the test environment — we're running against a shared staging database that other teams are also using. So sometimes the data is in an unexpected state. I've been pushing to get an isolated test environment, but the infrastructure request has been sitting in the queue for two sprints now.

**[00:09:08] James Rodriguez:** I can probably fast-track that. If we containerize the test database with Docker Compose, we can spin up a fresh instance for every test run. I could probably get a prototype of that working in a day or two.

**[00:09:20] Sarah Chen:** James, that would be amazing. Can you commit to that for next sprint?

**[00:09:24] James Rodriguez:** Yeah, I'll put it on my plate. Let me size it up first, but I think it's doable.

**[00:09:30] Amy Torres:** Can I raise something from the process side? So this sprint we had three scope changes that came in after sprint planning. I take some responsibility for that because two of them came from stakeholder requests that I agreed to without fully vetting the impact with the team. The payments migration had a last-minute requirement for PCI compliance logging that we hadn't scoped, and there was a new analytics event that marketing wanted added to the dashboard.

**[00:09:58] Marcus Johnson:** Yeah, the PCI compliance logging one was rough. It wasn't technically hard, but it required us to refactor the logging middleware, and that touched like fifteen files. It felt like it should have been its own story, not a "quick add" to an existing one.

**[00:10:14] Amy Torres:** You're right. I think going forward, any mid-sprint scope change should go through the same estimation process as a new story. Even if it seems small, we at least need to T-shirt size it with the team before committing.

**[00:10:28] Sarah Chen:** I agree completely. And I think we should also have a clear threshold — like if the scope change is estimated at more than two points, it goes into the next sprint backlog unless it's a critical production issue. Does that feel reasonable to everyone?

**[00:10:43] Marcus Johnson:** Yeah, that works for me.

**[00:10:45] David Kim:** Same.

**[00:10:46] Priya Patel:** Agreed.

**[00:10:48] Lisa Nguyen:** Makes sense.

**[00:10:50] Sarah Chen:** Great. Okay, I want to touch on a couple more things before we move to action items. There was a note here about documentation. Who added that?

**[00:10:58] Priya Patel:** That was me. So when I was working on the dashboard redesign, I needed to understand how the existing data fetching layer worked. The internal wiki was completely outdated — it was referencing a service that was decommissioned six months ago and had code samples using a library version from two years ago. I ended up spending about half a day reading through source code to figure out something that should have been a fifteen-minute wiki lookup.

**[00:11:24] Marcus Johnson:** Guilty as charged on that one. I refactored the data layer last quarter and never updated the docs. The problem is, updating docs always feels like it can wait, and then it never happens.

**[00:11:36] Sarah Chen:** This is a recurring theme. We've talked about it in the last two retros. What if we make documentation updates part of the definition of done? Like, a PR can't be merged unless the relevant wiki pages are updated.

**[00:11:50] Marcus Johnson:** I think that's the right idea, but we need to be practical about it. Not every PR needs a docs update. Maybe we tag stories that have a documentation component at planning time, and those are the ones that require docs updates before merge.

**[00:12:04] Priya Patel:** I like that. A "docs-required" label or something.

**[00:12:09] David Kim:** Quick tangent — can we also talk about the on-call rotation? I was on call this sprint and got paged three times for issues that were not actually production incidents. Two of them were monitoring false positives because the alert thresholds were set too aggressively, and one was a staging environment issue that somehow got routed to the production on-call channel.

**[00:12:30] James Rodriguez:** The staging alert bleeding into prod on-call — that was the misconfigured PagerDuty routing rule. I fixed that on Wednesday, so it shouldn't happen again. But the false positive alerts — yeah, we need to tune those. The CPU utilization alert for the payments service was set to trigger at 60%, which is way too low. Normal traffic patterns push it to 55-65% during business hours.

**[00:12:52] David Kim:** Exactly. Getting paged at 3 AM for something that's normal behavior is demoralizing. And it creates alert fatigue, which means when there's a real incident, people might not respond as quickly.

**[00:13:05] Sarah Chen:** That's a really good point about alert fatigue. James, can you do a review of our alert thresholds and adjust anything that's causing false positives?

**[00:13:14] James Rodriguez:** Yeah, I'll do an audit of all our alerts. I'll look at the last 30 days of pages and flag any that were false positives. Then I'll adjust thresholds or add better conditions.

**[00:13:26] Sarah Chen:** Perfect. Okay, let's move into our action items section. I've been taking notes as we've been going. Let me read through what I've captured and we can assign owners and priorities.

**[00:13:40] Sarah Chen:** Action item one: Set up automatic API dependency mapping. Marcus, you and James want to own this?

**[00:13:48] Marcus Johnson:** Yeah, I'll take the lead. James can help with the infrastructure side. Let's target having a prototype by the end of next sprint.

**[00:13:56] James Rodriguez:** Works for me.

**[00:14:00] Sarah Chen:** Action item two: Mandatory consumer identification and smoke testing for any breaking API changes. Lisa, can you draft a lightweight process for this?

**[00:14:10] Lisa Nguyen:** Yep. I'll write up a checklist and share it with the team by Monday. We can refine it during sprint planning.

**[00:14:18] Sarah Chen:** Action item three: Fix the mobile build caching and investigate the analytics SDK build time impact. David and James, can you pair on this?

**[00:14:28] David Kim:** Absolutely. I've already got some ideas on the analytics SDK side. There's a way to lazy-load the initialization that might help.

**[00:14:36] James Rodriguez:** And I'll fix the cache layer on the CI side. I'm hoping that alone will cut the build time back down to that twelve-minute range.

**[00:14:44] Sarah Chen:** Action item four: Containerized test database for E2E testing. James, you said you could prototype this?

**[00:14:52] James Rodriguez:** Yeah, I'll have a Docker Compose setup and a proof of concept by mid-sprint. If it works, we can roll it out to the whole test suite.

**[00:15:00] Sarah Chen:** Action item five: Mid-sprint scope change policy. Amy, can you draft a one-pager on this? We said the threshold is two story points — anything above that goes to the next sprint unless it's a P0 production issue.

**[00:15:14] Amy Torres:** I'll have it ready by Wednesday. I'll share it in the team Slack channel for feedback before we formalize it.

**[00:15:22] Sarah Chen:** Action item six: Documentation as part of definition of done. Marcus and Priya, can you work together to define which types of changes require a docs update? And then we'll add the "docs-required" label to our workflow.

**[00:15:36] Marcus Johnson:** Sure. Priya, let's sync on that tomorrow?

**[00:15:39] Priya Patel:** Yeah, I'll block off thirty minutes in the morning.

**[00:15:43] Sarah Chen:** Action item seven: Alert threshold audit. James, you've got this one?

**[00:15:48] James Rodriguez:** Yep. I'll pull the last 30 days of PagerDuty data and do a full analysis. I'll have recommendations by the end of next week.

**[00:15:56] Sarah Chen:** Great. Before we wrap up — I want to do a quick round of shoutouts. Anyone want to recognize a teammate?

**[00:16:04] Amy Torres:** I want to shout out Priya and David for pulling together that demo. It was genuinely impressive and the stakeholder feedback has opened up some exciting conversations about expanding the project scope.

**[00:16:16] Lisa Nguyen:** Shoutout to Marcus for the payments migration. Finishing ahead of schedule is rare and the code quality was noticeably high. Made my job a lot easier.

**[00:16:26] Marcus Johnson:** Thanks, Lisa. I want to shout out James — the blue-green deployment setup was chef's kiss. Zero-downtime cutover on a payment system is not trivial and he made it look easy.

**[00:16:38] James Rodriguez:** Appreciate that, Marcus. I'll shout out the whole team honestly. This was one of those sprints where everyone was heads-down and focused, and it showed in the output.

**[00:16:48] David Kim:** Plus one on that. And special shoutout to Sarah for keeping us organized. The mid-sprint check-in you added on Wednesdays has been super helpful for catching blockers early.

**[00:16:58] Priya Patel:** Agreed. The Wednesday check-ins are a game changer.

**[00:17:05] Sarah Chen:** Aw, thanks everyone. That actually brings up a good point — should we formalize the Wednesday mid-sprint check-in? We've been doing it informally for the last two sprints and it seems to be working.

**[00:17:16] Marcus Johnson:** I think so. Keep it short though — fifteen minutes max. Just blockers and any risks to the sprint goals.

**[00:17:24] Amy Torres:** I'm in favor. Maybe we can combine it with a quick burndown check so I can flag anything to stakeholders early.

**[00:17:32] Sarah Chen:** Okay, let's make that official. I'll add a recurring calendar invite. Fifteen minutes every Wednesday at 10 AM. Blockers, risks, and burndown status.

**[00:17:42] Sarah Chen:** Alright, let me do a quick retro health check. On a scale of one to five, how are we feeling about team health going into next sprint? Just drop a number in the chat.

**[00:17:52] Marcus Johnson:** Four.

**[00:17:53] Priya Patel:** Four.

**[00:17:54] David Kim:** Three point five. Build times are dragging me down.

**[00:17:57] Lisa Nguyen:** Four.

**[00:17:58] James Rodriguez:** Three. I'm stretched a bit thin with all the action items, but I think if we can knock out the high-priority ones early, it'll free up bandwidth.

**[00:18:05] Amy Torres:** Four.

**[00:18:08] Sarah Chen:** Okay, so we're averaging around a 3.75. That's good, but let's see if we can get that closer to a 4.5 next sprint by addressing the build time and alert fatigue issues. James, I hear you on being stretched — let me know if you need me to help reprioritize or pull in support from another team.

**[00:18:26] James Rodriguez:** Will do. I think if I can get the build caching fix done early in the sprint, the rest is manageable.

**[00:18:34] Sarah Chen:** Sounds good. Any last thoughts before we wrap up?

**[00:18:38] Priya Patel:** Just one thing — can we look into getting a shared team Notion or Confluence space for retro action items? Right now they're in a Google Doc that's getting pretty long, and it's hard to track what's been completed versus what's still open from past retros.

**[00:18:52] Sarah Chen:** Great idea. Amy, would you be able to set that up?

**[00:18:56] Amy Torres:** Yeah, I'll create a Confluence space with a retro tracker template. Each retro gets its own page with action items, owners, and status. I'll have it ready before next sprint's planning session.

**[00:19:08] Lisa Nguyen:** Can we also add a column for follow-up? Like, some action items from Sprint 22 never got closed out, and I don't know if that's because they were completed and nobody updated the doc, or if they fell through the cracks.

**[00:19:20] Sarah Chen:** Good point. Amy, let's add a follow-up column and a "last updated" date. And we should start each retro with a five-minute review of open action items from previous sprints.

**[00:19:31] Amy Torres:** Got it. Adding that to the template.

**[00:19:35] Marcus Johnson:** One more thing — the code review turnaround time. This sprint I had two PRs that sat in review for over three days. I know everyone's busy, but we agreed to a 24-hour SLA on reviews and we're not hitting it consistently. Can we recommit to that?

**[00:19:52] Priya Patel:** Fair point. I was one of the slow reviewers this sprint — sorry about that. I think part of the problem is that some PRs are really large. Marcus, your payments migration PR had like a thousand lines of changes. That takes real time to review properly.

**[00:20:06] Marcus Johnson:** That's true. Maybe we should also have a maximum PR size guideline? Like, if it's over 400 lines, it should be broken up into smaller chunks?

**[00:20:16] David Kim:** I've seen some teams use a 300-line max. It forces you to break things into smaller, more reviewable pieces.

**[00:20:24] Sarah Chen:** Let's say 400 lines as a soft limit. If you go over, you need to add a PR description explaining why it can't be broken up. And we recommit to the 24-hour review SLA. If you can't review within 24 hours, reassign it. Sound good?

**[00:20:40] Marcus Johnson:** Sounds good.

**[00:20:42] Priya Patel:** Yep.

**[00:20:43] David Kim:** Agreed.

**[00:20:45] Lisa Nguyen:** Works for me.

**[00:20:47] Sarah Chen:** Okay, let me update the action items list with the last few:

**[00:20:52] Sarah Chen:** Action item eight: Formalize Wednesday mid-sprint check-ins. I'll own this — calendar invite going out today.

**[00:20:58] Sarah Chen:** Action item nine: Set up Confluence retro tracker with action item status tracking. Amy owns this.

**[00:21:06] Sarah Chen:** Action item ten: Review and close out open action items from Sprints 22 and 23. I'll do a pass on this before next planning.

**[00:21:14] Sarah Chen:** Action item eleven: PR size guideline — 400-line soft limit — and recommit to 24-hour review SLA. I'll add this to our team working agreement.

**[00:21:24] Sarah Chen:** So to recap, our big wins this sprint were the ahead-of-schedule payments migration, the smooth design system rollout, the killer stakeholder demo, and the zero-downtime deployment. Our areas for improvement are API dependency visibility, build times, E2E test flakiness, mid-sprint scope changes, documentation currency, alert fatigue, and code review turnaround.

**[00:21:48] Sarah Chen:** We have eleven action items with clear owners. I'll send a summary to the team channel after this call. 

**[00:21:56] Sarah Chen:** Last thing — next sprint planning is Monday at 10 AM. Amy, will you have the backlog groomed by then?

**[00:22:02] Amy Torres:** Yep, I'll have it prioritized and ready. I'll share the draft priorities in Slack tomorrow so people can async review before Monday.

**[00:22:12] Sarah Chen:** Perfect. Great retro, everyone. Thanks for the candid feedback — that's what makes these sessions valuable. Go enjoy your Friday afternoon.

**[00:22:20] Marcus Johnson:** Thanks, Sarah. Good retro.

**[00:22:22] Priya Patel:** Yeah, solid session. Have a good weekend everyone.

**[00:22:25] David Kim:** Later, all.

**[00:22:26] Lisa Nguyen:** Bye everyone!

**[00:22:28] James Rodriguez:** See you Monday.

**[00:22:30] Amy Torres:** Have a great weekend!

**[00:22:32] Sarah Chen:** Bye all!

---

## Summary of Action Items

| # | Action Item | Owner(s) | Priority | Target |
|---|------------|----------|----------|--------|
| 1 | Set up automatic API dependency mapping / service discovery | Marcus, James | High | End of Sprint 25 |
| 2 | Draft mandatory consumer identification checklist for breaking API changes | Lisa | High | Monday |
| 3 | Fix mobile build caching; investigate analytics SDK build time impact | David, James | High | Early Sprint 25 |
| 4 | Prototype containerized test database (Docker Compose) for E2E tests | James | Medium | Mid-Sprint 25 |
| 5 | Draft mid-sprint scope change policy (>2 pts → next sprint unless P0) | Amy | Medium | Wednesday |
| 6 | Define "docs-required" label criteria; add to workflow | Marcus, Priya | Medium | Early Sprint 25 |
| 7 | Alert threshold audit — review 30 days of PagerDuty data, adjust thresholds | James | High | End of next week |
| 8 | Formalize Wednesday mid-sprint check-ins (15 min, blockers/risks/burndown) | Sarah | Low | Today |
| 9 | Set up Confluence retro tracker with status columns and follow-up dates | Amy | Medium | Before Sprint 25 planning |
| 10 | Review and close open action items from Sprints 22 and 23 | Sarah | Low | Before Sprint 25 planning |
| 11 | PR size guideline (400-line soft limit) + recommit to 24-hour review SLA | Sarah | Medium | Before Sprint 25 planning |

## Team Health Score
**Average: 3.75 / 5.0**

| Member | Score | Notes |
|--------|-------|-------|
| Marcus | 4.0 | — |
| Priya | 4.0 | — |
| David | 3.5 | Build times impacting productivity |
| Lisa | 4.0 | — |
| James | 3.0 | Stretched thin across action items |
| Amy | 4.0 | — |
