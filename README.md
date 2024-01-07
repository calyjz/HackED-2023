# HackED-2023
Hi there! This is a discord content moderation bot called **The Ben Hammer**, developed for the hackathon HackED 2023. 

This bot uses models to detect and flag hate speech, harmful content, and misinformation.

#Approach
Hate Speech and Harmful Content
The Ben Hammer integrates OpenAI's moderation API to flag for hate speech. Any messages that are flagged will appear in the ______ channel for moderators to review. Here, the moderators are able to delete the message, timeout the user for 60s, 5m, 10m, 1h, 1d or 1w, kick the user, or ban the user. 

#Misinformation
To combat misinformation in discord servers, we've integrated Google's fact checker API. To fact check a message, first click the three dots associated with that message. On mobile, users will need to hold down the message. Afterwards, navigate to apps -> fact check. After running this command, the Ben Hammer will send a list of relevant news articles related to the content in the initial message, allowing users to quickly access verified information and make informed decisions about the content of the message.

#Implementation
This bot utilized Javascript, OpenAI API, Google Fact Check API, and Discord.js and was coded in uder 24 hours.
