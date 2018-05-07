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
