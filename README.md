# Qubit-workspace

## Introduction
This project was created as a task to implement internal system managment for [**Qubit Coding Center**](http://qubitcodingcenter.ga/).
\

## Summary
### Levels
Qubit WorkSpace provide the abilities to add, edit or delete level with description and many fields
### Groups
Groups table is attached with a ForiegnKey to the levels table and fields that descripes every groups
> start date, end date, add new meeting, description, pass key 
### Students
Students table is attached with a ForiegnKey to the groupts table, and other field that descripes evey students
> name, phone, enroll date, current level, std status
### Absent Students
Absent table provide a list with every student absent days that been registered during std group meetings
### Calender
Full week calender with every group meeting times
\

## Deployment
### Clone the project
```
git clone https://github.com/Alaa-Abo-Auon/Qubit-workspace.git
```
### Run the project
```
npm start
```
\

## Rate limit
| Title | Value |
| :--- | :--- |
| Language used         | JavaScript
| Framework             | NodeJS and ExpressJS
| Database              | MongoDB
| Handlebars framework  | handlebars