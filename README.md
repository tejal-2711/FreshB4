## Inspiration
Research shows that approximately 35-38% food supply is wasted in the United States, and a US household wastes an average of over 250 pounds of food annually. A family of four can lose approximately $1500 - $3000 per year due to food waste.

As college students with busy workloads and schedules, managing our groceries is a task. We often feel frustrated with being unable to manage our groceries and having to trash produce. We wanted to tackle this problem with an innovative but functional solution. Brainstorming about ideas, we all knew we wanted to solve this problem and create a sustainable solution. So we came up with FreshB4!

## What it does
- Allows users to capture or upload pictures of items and returns a freshness analysis.
- Lets users keep track of items in their pantry with associated "days to spoilage", "expiry date", "spoiled status", and a "short description".
- Users can see their overall pantry health and how many items in their pantry need immediate attention.
- Users can also get AI generated recipes for utilizing the "urgent items" with detailed description of steps, time it takes, and difficulty level.

## How we built it
Our Tech Stack: React Native, Gemini API, GitHub.

## Challenges we ran into
- Wifi issues: due to the high user traffic, we were having difficulties connecting to the wifi. This also affected Expo Go which slowed our progress and hindered our testing.
- We initially tried to used a image classification model, but couldn't find extensive datasets that classify food into multiple categories (fresh, ripe, overripe, rotten). The datasets we found online didn't provide us with the kind of detail we wanted to integrate in our app.
- We tried to leverage Cursor to increase productivity, but that ended up creating more challenges, as we ran into multiple bugs.
- We used Base44 to build a web app to have fall back option as we pivoted to VS Code, along with GitHub Copilot.
- There were multiple compatibility errors we had to tackle while trying to use certain libraries, but determination and consistent team effort helped us overcome them.

## Accomplishments that we're proud of
- Our app recognizes spoilage levels of food very accurately and returns correct recommendations to the user.
- We have user-friendly and pleasant UI which makes the app super intuitive.
- We are proud of the impact this app will make on sustainability, reducing food wastage, and helping users manage their pantry, health, and carbon footprint.
- We are very proud the teamwork, communication, and consistent trust in one other that helped us overcome the multiple hurdles we saw in this journey.

## What we learned
- Leveraging AI code assistants like Cursor, Base44, and GitHub Copilot to make technology that produces impactful solutions to real-world problems.
- Integrating LLM's into apps to make them more robust and unlock new potential to solve problems.
- Building an impactful, fully functional application in a short amount of time.
- How to prioritize important features and leave extra features for future development.

## What's next for FreshB4 - Simple & Sustainable
- Integrate a database to store long term pantry items and feed items into the database right after capturing/uploading images.
- User customization: users can choose when they get notified and what items they get notified for.
- Automation: app should update everyday to reset the number of days left to spoilage.
- Integrating multiple object recognition to give freshness analysis of multiple items from one grouped picture.
