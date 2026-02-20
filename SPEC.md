# Practice Managment Application

This is an application for a small clinic to manage their day to day operations.  

## Features

- Intake wizards for new patients
- Scheduling wizards that account for different patient types
- patient records have an interface where files can be uploaded and securely stored, then 
- Visits are defined in a Definition Document with a schema.  The Definition document is a YAML or JSON object that is stored in a database and retrieved when the visit is scheduled, and the visit management wizard will have different inputs based on the Visit Definition
- Rescheduling a patient can be done through a drag-and-drop interface or through a rescheduling wizard that will suggest times based on visit type
- An event system where actions are triggered by certain events.  For example, when a patient checks in at the front desk, a wallboard is updated with patient's arrival time and status. As the patient is assigned to a room, the clinician is notified that the patient is ready to be seen.  The notification system is built in-application and can be modified without restarting the application.
- A calendar view of the clinic's schedule that can be filtered by clinician, patient type, or patient name.  The appointments on the schedule can be color-coded to represent clinician, patient type, or another criteria that is selectable by the user.  The calendar view can be modified to show partial day (next x hours), full day, 5 day week, 7 day week, or month.  In each view there are controls to go forward or backward by the selected timeframe, or a dropdown can be used to select the date or time.
- A patient notification system that automates notifications on schedule changes.  Works by sending messages to webhooks - adjustable within the application.
- A permissions system so different parts of the system are visible to users in different roles
- An in-app messaging component so that staff can send messages and recieve notifications in realtime 
- Nurses and providers will have a SPA with their own view of the application on mobile
- Different views of Web application based on role: Provider, Nurse, Scheduling Assistant, Pharmacy, Imaging Tech, Billing, Office Manager

## Tech Stack
- Frontend:
  - React 19
  - Mantine UI
  - Tanstack Router
- Backend
  - Cloudflare Workers, D1, R2, Pipelines, Queues, Durable Workers
