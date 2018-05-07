# sswmfa
Server-Side Web Modelling for Augmentations
Developed in NodeJS - Express

Framework for Modelling: GoJS https://gojs.net/

ORM: Sequelizer http://docs.sequelizejs.com/

## Installation
Clone the repo:
```bash
$ git clone git@github.com:francomahl/sswmfa.git
```
Move to the project folder:
```bash
$ cd sswmfa
```
Build and run the Docker container:
```bash
$ docker build -t sswmfa .
$ docker run -p 3000:3000 sswmfa
```
Go to *http://localhost:3000/*

Render: When the model is played it creates the html files into `public/view` and the corresponding
routes in `routes/render.js`

## Allowed Datatypes in ER Model
Class' property types will be mapped to a DB Datatype as follows:
```
integer, number -> INTEGER
bigint -> BIGINT
text, textarea -> TEXT
date, datetime -> DATE
```
The default Datatype is STRING. This is the default type "type" or any other type that does not match with the types listed above will be defined in the DB as STRING.

## Allowed Datatypes in Navigation Model
For forms, Class' property types will be mapped to HTML input types as follows:
```
integer, number, bigint -> input type = 'number'
date, datetime -> input type = 'date'
password -> input type = 'password'
email -> input type = 'email'
textarea, text -> textarea
tel, phone -> input type = 'tel'					
default -> input type = 'text'
```
The default input type is text. This is the default type "type" or any other type that does not match with the types listed above will be mapped to an input type text in the form.
