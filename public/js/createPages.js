function createPages(){
	//using JQuery's extend function to copy array value and not the reference
	var navNodes = $.extend(true, [], navDiagram.model.nodeDataArray),
			navLinks = $.extend(true, [], navDiagram.model.linkDataArray),
			pages = [],
			forms = [],
			lists = [],
			scripts = [];

	//Divide nodes by category
  navNodes.forEach(function (navNode, index){	
			if ( navNode.category == "MainPage" || navNode.category == "Page" ){
				pages.push(navNode);
			} else if ( navNode.category == "Form" ){
				forms.push(navNode);
			} else if ( navNode.category == "List"){
				lists.push(navNode);
			} else if ( navNode.category == "Script"){
				scripts.push(navNode);
			}
	});

	//Iterate over pages
  pages.forEach(function (page, pIndex){	
		var pageForms = '',
				pageLists = '',
				pageLinks = '',
				content =	'',
				importScripts = 'block append scripts' + '\n';

    forms.forEach(function (form, index){
			//parse forms within group
			if( form.group == page.key ){
				pageForms = pageForms + parseForm(form) + '\n';
			}
		})

    lists.forEach(function (list, index){
			//parse lists within group
			if ( list.group == page.key ){
				pageLists = pageLists + parseList(list) + '\n';
				if ( list.edit ){
					createEditPage(list);
				}
				if ( list.detail ){
					createDetailPage(list);
				}
			}
		});

    navLinks.forEach(function (navLink, index){  
			//parse links within group
			if(navLink.from == page.key ){
				pageLinks = pageLinks + parseLink(navLink, pages) + '\n';
			}
		});

    scripts.forEach(function (script, index){
			//parse lists within group
			 if ( script.group == page.key ){
				createFile(script.text, script.name, '../public/rendered/', "script" );
				importScripts = importScripts + `	script(src='../../src/rendered/${script.name}')` + '\n';
			}
		});	

		content = pageForms + pageLists;

		//Create jade file
		let fileHeader = "extends ../layout" + '\n';

		if (scripts.length > 0) {
			fileHeader += importScripts;
		};

		const fileContent =
		 "block content" + '\n' +
		 "	.col-sm-2" + '\n' +
		 "		nav.nav.flex-column" + '\n' +
						"#{pageLinks}" + '\n'+
		 "	.col-sm-10" + '\n'+
		 			"#{content}" + '\n';

		const fileTemplate = fileHeader + fileContent;
		const myValues = { content: content, pageLinks: pageLinks };
		const jadeCode = $.tmpl(fileTemplate, myValues);
		const fileName = page.name.toLowerCase().split(" ").join("_");
		const fileNameToSaveAs = fileName + ".jade"

		//call function to create jade file
		createFile(jadeCode, fileNameToSaveAs,'../views/rendered/', "jade");
	}); // end for each page
	$('#PlayButton').prop('disabled', false); //Enable step 3
} // end createPages()

function createEditPage(jsonList){

	let formTemplate =
		"extends ../layout" + '\n' +
		"block content" + '\n' +
		"	.col-sm-2" + '\n' +
		"		nav.nav.flex-column" + '\n' +
		"			a.nav-link(href='/render/') Volver al inicio" + '\n' +
		"	.col-sm-10" + '\n';

	let elements = '';

  jsonList.fields.forEach(function (field, index){  
		const fieldType = field.type.toLowerCase();
		let inputType = '';

    switch(fieldType) {
      case "integer": 
      case "number":
      case "bigint":
          inputType = 'number';
          break;
      case "date":
      case "datetime":
          inputType = 'date';
          break;
      case "password":
          inputType = 'password';
          break;
      case "email":
          inputType = 'email';
          break;
      case "textarea":
      case "text":
          inputType = 'textarea';
          break;						
      case "tel":
      case "phone":
          inputType = 'tel';
          break;						
      default:
          inputType = 'text';
		} // end switch
		let inputTemplate = "			.form-group" + '\n';
		if ( !field.nullable ){ //if not nullable then add * and set input as required
			inputTemplate +=	"				label #{name} *" + '\n';
			if (inputType === 'textarea'){
				inputTemplate += "				textarea.form-control(id='#{fieldName}', name='#{fieldName}', value=record.#{fieldName}, required='')" + '\n';
			}	else {
				inputTemplate += "				input.form-control(id='#{fieldName}', name='#{fieldName}', type='#{inputType}', value=record.#{fieldName}, required='')" + '\n';
			}
		}	else {
			inputTemplate += "				label #{name}" + '\n';
			if (inputType === 'textarea'){
				inputTemplate += "				textarea.form-control(id='#{fieldName}', name='#{fieldName}') #{record.#{fieldName}}" + '\n';
			} else {
				inputTemplate += "				input.form-control(id='#{fieldName}', name='#{fieldName}', type='#{inputType}', value=record.#{fieldName})" + '\n';
			}
		}
		const inputValues = { name: field.name , fieldName: field.name.split(" ").join("_") ,inputType: inputType };
		const input = $.tmpl(inputTemplate, inputValues);
		elements += input;
	})// end for item in list

	formTemplate += 
		"		h3 Update record in #{name}" + '\n' +
		'		form(id="formUpdate#{formClass}", action="/render/updateOneIn#{formClass}", method="POST")' + '\n' +
		"			.form-group" + '\n' +
		"				input.form-control(id='id', name='id', type='hidden', value=record.id)" + '\n' +
							"#{elements}" + '\n' +
		"			.form-group" + '\n' +
		"				button.btn.btn-primary(type='submit') Update"  + '\n' +
    "				button.btn.btn-primary.margin-btn(type='reset') Reset" + '\n';
    
  const className = jsonList.class.split(" ").join("_");
  const formValues = { name: jsonList.name, elements: elements, formClass: className };
	const formCode = $.tmpl(formTemplate, formValues);
	const fileName = `formUpdateOneIn${className}.jade`;
	//call function to create jade file
	createFile(formCode, fileName,'../views/rendered/', "jade");
}// end createEditPage()

function createDetailPage(jsonList){
	let elements = '';

  jsonList.fields.forEach(function (field, index){
    const fieldName = field.name.split(" ").join("_");
		const input = `		p ${field.name}: #{record.${fieldName}}` + '\n';
		elements += input;
	});// end for each item in list

	const fileTemplate =
		"extends ../layout" + '\n' +
		"block content" + '\n' +
		"	.col-sm-2" + '\n' +
		"		nav.nav.flex-column" + '\n' +
		"			a.nav-link(href='/render/') Volver al inicio" + '\n' +
		"	.col-sm-10" + '\n' +
		"		h3 Detail" + '\n' +
		"#{elements}" + '\n';

  const className = jsonList.class.split(" ").join("_");
	const myValues = { elements: elements };
	const jadeCode = $.tmpl(fileTemplate, myValues);
	const fileName = `detailFrom${className}.jade`

	//call function to create jade file
	createFile(jadeCode, fileName,'../views/rendered/', "jade");
} //end createDetailPage() 