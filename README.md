# Candidate Application Workshop

This workshop is intended to get you acquainted with using the Kaltura API. The final application (which can be found [here](https://agents.kaltura.now.sh/), mimics a video-interview flow, where the candidate, upon login, answers all interview questions with a video recording. 
This application also contains the recruiter page, which shows a list of candidates who have submitted playlists. 

## Before You Begin 

### Setting Up  

- Please install [nodeJs and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- You will need a github [account](https://github.com/join), as well as git installed on your computer 
- After installing the necessary requirements, clone this repo and, from inside the directory, run `npm install`. This will install all the libraries used in the application, including the Kaltura NodeJS [library](https://developer.kaltura.com/api-docs/Client_Libraries/). 
- Please begin on branch Master. 

### .env File 

This application makes calls to the Kaltura API, which requires an authentication key for access, which can only be created using your Kaltura credentials. As these should never be shared, they are not included in this repo, and will be provided in the workshop. Alternatively, you can use your own credentials if you have an existing Kaltura account. 

**See the `env.template` file. Please create a copy of this file named `.env`, and populate it with the Kaltura credentials given.**

### questions-data.js 
For the purpose of this workshop, candidate questions are stored statically in `questions-data.js`, while they would typically reside in some sort of database. We initiated the application with two questions, but feel free to edit them or add more questions. 

## How Do I Build This Application?

### Tasks 

As this workshop is only for the purpose of learning the Kaltura API, we have already provided the skeleton and structure of the application. You'll *only* need to fill in the Kaltura API calls. These tasks will be distributed with comments throughout the application, and can be found by searching for keyword `task`. 

### API Calls 

To learn how to write each call, you'll be using the [developer console](developer.kaltura.com/console), where you can search through the API services to find the action you're looking for. For example, if you wanted to see a list of all videos, you would find the service called `media` and select the `list` action. 
> Important: You do not need to execute the command in the console; you only need to create the code snippet (using NodeJS) and copy it into your application. 

### The Git Structure 

Begin on branch Master. The branches in the repo are laid out in steps (task-2, task-3...), so that if you fall behind or are unable to complete the task, you can skip ahead to the next one. 

## The Tasks

The following information will provide more help and information about each task, so if you'd like to challenge yourself, start only with the comments in the application and come back here if you're stumped. 

### Task 1 
#### Create Session 

A Kaltura Session is required in order to access the Kaltura API. A session is created with the `session.start` API, using your Kaltura Partner ID, Admin Secret, and username. 
A session can be created as type ADMIN or type USER. An Admin KS can pretty much complete all actions against the API and view all content. 
A USER KS is restricted, and is in many cases limited to content created only by that user. 

This application uses both: an admin KS is used to create the user for the new candidate. Then, a USER KS is generated using the candidate's email address, and all subsequent calls are done with that User KS. 

### Task 2.1 
#### Get User 

A user logs in by inputting a name and email address. For a new candidate, a Kaltura User will be created. For an existing candidate, the existing user will be retrieved and used to create a Kaltura Session. 
This call should return a user record if the email address of an existing candidate is passed through; otherwise, it will fail. 

### Task 2.2 
#### Create User 

Assuming a user does not exist for the give email address, this call creates a new Kaltura User record. It requires the name and email address inputted at login. 
> Hint: if you're not sure about the correct syntax, be sure to populate the desired fields while in the console, and copy paste the sample code. 

### Task 3
#### Create Playlist 

A playlist is created for the given user, per session, right after login. The playlist is created using the User KS, which contains the email address, thereby associating the playlist with that user. The playlistId  of the new playlist is stored in the session so that the same playlist is used for questions that haven't been recorded yet *in that session.* A new playlist is created if all questions have been recorded, or if the session has ended (by going to the login page). 

This is done so that the same email address can be used in each test; obviously in a real setting, a candidate would be prevented from answering the same questions again. 

### Task 4.1
#### Get playlist 

Once the user has recorded and submitted a video, it must be added to the relevant playlist. For the purpose of this application, you've been given the playlistId that was created in the previous step. 

### Task 4.2 
#### Add Entry to Playlist 

Playlists are updated by creating a new playlist with the new data, and added to the existing playlist using the ID. The list of entries inside the playlist is stored under playlist.playlistContent. 
If the playlist is empty, playlistContent can be set to the entry that had just been recorded. 
However, if there are already entries in the playlist, the new entry ID must be added to the existing list of entries as a comma-separated list. 

### Task 5.1 
#### Get Playlist 

Retrieve the playlist for playback, using the provided playlist ID  

### Task 5.2 
#### Get Playlist Entry Status 

When a video is uploaded to Kaltura, the transcoding process begins, and the video is only ready for playback after completion. This could take a few seconds or even minutes, depending on the length of the video. The Status of the video, found in the `KalturaMediaObject`, indicates where the video is in that process, using a range of enums such as `PENDING`,  `PRECONVERT`, or `READY`. 

In the summary page, the playlist cannot be displayed until all entries are ready for playback. This requires checking the playlist's entries and returning only those that are ready to view. 

> Hint: You'll need to use the list action by passing in the entries and the desired statuses. Note that all list actions require a pager, even if it is empty  

### Task 5.3 
#### Execute Playlist 

The execute action essentially returns all data needed to show a playlist. It requires a playlistId. 

### Task 6  
#### Recruiter: Get All Playlists 

The final page in the interview flow shows all candidate playlists and allows basic searching by name. In a real scenario, the filtering and pagination would be done against the server, but for the purpose of this workshop we are fetching all the relevant playlists and manipulating/searching through them on the client side. In that case, you'll need to retrieve all playlists from the API - and sort by descending create time. Reminder that all list actions require a pager. 

## Conclusion 

Hopefully you have a good understanding of implementing and interacting with the Kaltura API. 

To sign up for a Kaltura Developer account, click [here](https://vpaas.kaltura.com/reg/index.php). 

If you have any questions, shoot us an email at avital.tzubeli@kaltura.info 

