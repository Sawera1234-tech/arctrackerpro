# Arc Tracker Pro

Build a production-quality, responsive web app called **ARC TRACKER**.

Tagline:
**“Build your streak. Complete your arc.”**

The app is a personal habit, challenge, routine, and goal tracker. It should allow a user to create completely custom challenges and track them every day.

The primary use case is a personal “Winter Arc” challenge, but the app must NOT be limited to winter. The user should be able to use it throughout the year for exercise, studying, coding, reading, fitness, sleep, cold showers, water intake, religious goals, productivity, or any custom activity.

## 1. DESIGN DIRECTION

Create a premium, modern, dark UI.

Visual style:

* Dark charcoal / near-black background
* White and light-gray typography
* Blue/purple accent color
* Subtle gradients
* Glassmorphism used carefully
* Rounded cards
* Soft shadows
* Clean spacing
* Smooth micro-interactions
* Modern dashboard aesthetic
* Slightly motivational/gaming-inspired feel without looking childish
* No excessive neon
* No clutter

The app should feel like a combination of:

* premium productivity app
* fitness tracker
* modern gaming progression system

Use smooth animations for:

* completing a task
* updating progress
* increasing streak
* opening challenge details
* changing dates
* progress bars

The UI must be fully responsive and optimized for:

* desktop
* tablet
* mobile

On mobile, use a bottom navigation bar.

## 2. MAIN NAVIGATION

Create these main sections:

1. Dashboard
2. Challenges
3. Calendar
4. Progress
5. Settings

Also make **Winter Arc** easily accessible from the Dashboard.

## 3. DASHBOARD

The dashboard is the main screen.

At the top:

“Good morning, [Name]”

Show today's date.

Then a prominent Winter Arc card:

WINTER ARC 2026

Example:

Day 1 / 90

Overall Progress
██████░░░░ 60%

Current Streak 🔥
12 Days

The user should be able to change the Winter Arc duration and dates.

Below that show:

### TODAY'S PROGRESS

Example:

4 / 6 completed

Progress bar:
███████░░░

Then display today's tasks as beautiful cards.

Example:

☑ Workout
20-minute exercise

☐ Cold Shower
Complete today's cold shower

☑ Coding
Code for 60 minutes

☐ Reading
Read 20 pages

☑ Water
Drink 2.5L water

☑ Sleep
Sleep before 12:00 AM

Each task card should have:

* icon
* task name
* target
* completion checkbox/button
* streak
* optional progress indicator

When the user completes a task:

* animate the checkbox
* show a subtle success animation
* update today's progress
* update streak
* update overall statistics

## 4. CHALLENGE CREATION

The user must be able to create completely custom challenges.

Add a prominent:

“+ Create Challenge”

button.

Challenge creation form should include:

* Challenge name
* Description
* Icon selector
* Category
* Color/accent
* Start date
* End date
* Frequency
* Target
* Unit
* Reminder time
* Notes

Categories:

* Fitness
* Health
* Study
* Work
* Coding
* Reading
* Sleep
* Productivity
* Personal
* Other

Frequency options:

* Every day
* Weekdays
* Weekends
* Specific days of week
* Custom schedule

Target examples:

20 push-ups
20 minutes exercise
2.5 liters water
60 minutes coding
20 pages reading

Allow the user to choose whether a challenge is:

* Simple completion
  OR
* Measurable target

For example:

Simple:
“Cold Shower” → completed / not completed

Measurable:
“Exercise” → 20 minutes / target 20 minutes

## 5. CHALLENGE LIST

The Challenges page should show all active challenges.

Each challenge card should display:

* Icon
* Name
* Category
* Current streak
* Best streak
* Completion percentage
* Today's status
* Overall progress

Example:

🏋️ Workout

Current streak:
7 days 🔥

Best streak:
14 days

Completion:
82%

Today:
✓ Completed

Allow:

* Edit
* Pause
* Archive
* Delete

Do NOT permanently delete data immediately. Ask for confirmation before deletion.

## 6. DAILY TRACKING

The user should be able to open any date and see the challenges scheduled for that day.

For every task:

Completed:
✓

Not completed:
○

If the challenge has a measurable target, allow the user to enter the actual amount.

Example:

Target: 20 minutes

Actual:
15 minutes

Show:

15 / 20 minutes

Progress:
75%

Allow the user to mark a task completed manually.

Allow past dates to be edited.

## 7. STREAK SYSTEM

Implement a proper streak system.

For every challenge calculate:

* Current streak
* Best streak
* Total completed days
* Completion percentage

Example:

🔥 Current streak: 12 days
🏆 Best streak: 31 days
✅ Completed: 84 days
📊 Completion rate: 91%

A streak should increase when the user completes the challenge according to its schedule.

If a scheduled day is missed, the current streak should reset.

Non-scheduled days should NOT break the streak.

## 8. CALENDAR

Create a dedicated Calendar page.

Allow:

* Month view
* Previous/next month
* Click any date
* View that day's challenges

Use visual indicators:

Green/check:
Completed

Red/gray:
Missed

Neutral:
No scheduled challenge

For each date show an overall completion indicator.

Example:

September 2026

30
● 5/6 completed

Clicking a date opens that day's detailed tasks.

## 9. PROGRESS PAGE

Create a beautiful analytics dashboard.

Show:

### Overall Statistics

Total challenges
Total completed tasks
Current overall streak
Best overall streak
Average completion rate

### Weekly Progress

Show a graph for the last 7 days.

Example:

Mon  ███████
Tue  █████
Wed  ████████
Thu  ████
Fri  ███████
Sat  ████████
Sun  █████

### Monthly Progress

Show monthly completion percentage.

### Challenge Performance

Show each challenge's:

* Completion %
* Current streak
* Best streak

Use clean charts. Keep charts simple and readable.

## 10. WINTER ARC MODE

Create a special Winter Arc experience.

The user should be able to create a Winter Arc with:

* Name
* Start date
* End date
* Main goal
* Challenges

Example:

WINTER ARC 2026

September 30 → December 31

Day 1 / 93

Goals:

🏋️ Get stronger
📚 Study daily
💻 Improve coding
🚿 Build discipline
😴 Fix sleep schedule
📖 Read consistently

Display:

Days completed
Days remaining
Overall completion
Current streak
Best streak

Create a visually impressive Winter Arc progress card.

## 11. XP AND LEVEL SYSTEM

Add a simple optional gamification system.

When the user completes a challenge:

+10 XP

For measurable goals:

* Full target = +10 XP
* Partial progress = proportional XP

Create levels.

Example:

Level 1
0 / 100 XP

Level 2
100 XP

Level 3
250 XP

Display:

Level 7
🔥 1,240 XP

The XP system should remain subtle and not overpower the habit-tracking functionality.

## 12. ACHIEVEMENTS

Add simple achievements.

Examples:

🔥 First Streak
Complete a challenge for 3 consecutive days.

🔥 7 Day Warrior
Maintain a 7-day streak.

🔥 30 Day Discipline
Maintain a 30-day streak.

💯 Perfect Week
Complete all scheduled challenges for 7 days.

🏆 100 Tasks
Complete 100 tasks.

❄️ Winter Arc Starter
Complete the first day of a Winter Arc.

Achievements should unlock automatically.

## 13. SETTINGS

Settings should include:

Profile:

* Name
* Profile picture/avatar

Appearance:

* Dark mode
* Light mode
* System theme

Notifications:

* Enable reminders
* Reminder time

Data:

* Export data
* Import data
* Reset all data

General:

* First day of week
* Units
* Date format

Add confirmation dialogs for destructive actions.

## 14. DATA STORAGE

For the MVP, use persistent local storage so the user does not lose data when refreshing or closing the browser.

Use a proper structured data model.

Store:

* User profile
* Challenges
* Challenge schedules
* Daily completions
* Measured values
* Streaks
* XP
* Levels
* Achievements
* Winter Arc settings

The application should work immediately without requiring authentication.

Structure the code so authentication and cloud database synchronization can be added later.

## 15. ONBOARDING

On first launch, show a simple onboarding experience.

Screen 1:

ARC TRACKER

“Build your streak. Complete your arc.”

Screen 2:

“What do you want to improve?”

Allow selecting:

Fitness
Study
Health
Coding
Productivity
Personal

Screen 3:

“Create your first challenge”

Example:

🏋️ 20-Minute Workout

Then take the user to the Dashboard.

Allow skipping onboarding.

## 16. EMPTY STATES

Do not leave blank screens.

If there are no challenges:

“Your arc starts here.”

“Create your first challenge and start building your streak.”

Button:

* Create Challenge

If there are no completed tasks:

“Nothing completed yet.”

“Your first checkmark starts the streak.”

## 17. NOTIFICATIONS / REMINDERS

Build the UI and architecture for reminders.

Allow the user to assign a reminder time to a challenge.

If browser notification permissions are available, support browser notifications.

Example:

“Time for your workout 💪”

Do not make notifications mandatory.

## 18. USER EXPERIENCE

The most important action should always be:

Open app → see today's tasks → check them off → see progress.

The user should NOT need to navigate through multiple screens just to mark today's task complete.

Make today's tasks immediately visible on the Dashboard.

Use optimistic UI updates so checking a task feels instant.

## 19. RESPONSIVENESS

Desktop:

* Sidebar navigation
* Large dashboard
* Multi-column cards

Mobile:

* Bottom navigation
* Single-column cards
* Large touch-friendly buttons
* Swipe-friendly interactions
* Sticky date/header where appropriate

Make sure buttons and checkboxes are large enough for touch.

## 20. TECHNICAL QUALITY

Build this as a real functional web application, not a static mockup.

Requirements:

* Clean component architecture
* Reusable components
* Proper state management
* Persistent data
* Form validation
* Responsive design
* Accessible buttons and controls
* Loading states
* Empty states
* Error handling
* Confirmation dialogs
* No broken buttons
* No placeholder functionality

Do not use fake statistics once the user starts adding real data.

All dashboard statistics, streaks, calendar data, XP, achievements and progress must be calculated from the actual stored challenge data.

## 21. IMPORTANT MVP PRIORITY

Prioritize these features first:

1. Dashboard
2. Create Challenge
3. Daily check-in
4. Streak calculation
5. Calendar
6. Progress statistics
7. Winter Arc
8. Persistent local data
9. Settings

Then add:

* XP
* Levels
* Achievements
* Reminders

Do not add unnecessary social features, chat, leaderboards, subscriptions, ads, or complicated functionality.

This is a PERSONAL productivity and discipline tracker.

## 22. SAMPLE DEFAULT DATA

On first launch, optionally provide a sample Winter Arc setup that the user can edit or remove.

Example:

WINTER ARC 2026

Challenges:

🏋️ Exercise
20 minutes daily

🚿 Cold Shower
1 cold shower daily

💻 Coding
60 minutes daily

📚 Reading
20 pages daily

💧 Water
2.5L daily

😴 Sleep
Before 12:00 AM

The user must be able to completely customize or delete these.

## FINAL REQUIREMENT

Make the application feel like a polished product that someone would genuinely want to use every morning.

The core loop should be:

**Open → See today's goals → Complete tasks → Build streak → Gain XP → See progress → Come back tomorrow.**

Do not create a generic template-looking habit tracker.

Make **ARC TRACKER** feel like a dedicated personal discipline system.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://arctrackerpro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b710d70f-7867-4a74-8637-d843de5c0822).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
