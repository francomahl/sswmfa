# sswmfa
Server-Side Web Modelling for Augmentations
Developed in NodeJS - Express

Framework for Modelling: GoJS https://gojs.net/

ORM: Sequelizer http://docs.sequelizejs.com/

Installation:
Clone the repo `git clone git@github.com:francomahl/sswmfa.git`
Move to the project folder `cd sswmfa`

Install node modules:
`sudo apt-get update`
`sudo apt-get install nodejs`
`sudo apt-get install npm`
`npm install`

Create the folders:
`mkdir /public/rendered`
`mkdir /views/rendered`
Run the project `DEBUG=sswmfa:* npm run devstart`
Go to *http://localhost:3000/*

Render: When the model is played it creates the html files into `public/view` and the corresponding
routes in `routes/render.js`