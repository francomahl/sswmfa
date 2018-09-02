# sswmfa
Server-Side Web Modelling for Augmentations

Developed in NodeJS - Express

Framework for Modelling: GoJS https://gojs.net/

ORM: Sequelize http://docs.sequelizejs.com/

## Installation
Clone the repo:
```bash
$ git clone git@github.com:francomahl/sswmfa.git
```
Move to the project folder:
```bash
$ cd sswmfa
```

Create the folders for the rendered files:
```bash
$ mkdir /public/rendered
$ mkdir /views/rendered
```

Build and run the Docker compose:
```bash
$ docker-compose up --build --force-recreate --remove-orphans
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

## Create entities through /createEntity endpoint
Important: Models are saved in memory only.

To create an entity through the `/createEntity` endpoint send a request like:
```javascript
{
	"class": "example entity",
	"fields": [
		{
			"name": "first field",
			"type": "string",
			"unique": "false",
			"nullable": "false"
		},
		{
			"name": "second field",
			"type": "string",
			"unique": "true",
			"nullable": "true"
		}
	]
}
```

Then go to `http://localhost:3000/` (refresh page) and check the JSON representation of the model, it should contain the entity sent via the endpoint. This endpoint can be called multiple times, each call will append the new entity in the `nodeDataArray` list in the JSON representation.
Then hit `LoadJSON` and the entities will be reflected in the board.

To cleanup the entities added via the endpoint just cleaning the JSON representation in the model won't work (it will be reloaded if the page is refreshed). For this, send a GET request to `/clearEntities`, this will clean up the JSON representation stored in memory.
