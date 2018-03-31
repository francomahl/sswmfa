function createPages(){
  //using JQuery's extend function to copy array value and not the reference
  var navNodes = $.extend(true, [], navDiagram.model.nodeDataArray),
      navLinks = $.extend(true, [], navDiagram.model.linkDataArray),
      pages = [],
      forms = [],
      lists = [],
      scripts = [];

  //Divide nodes by category
  for ( var nodeToCategorize = 0; nodeToCategorize < navNodes.length; nodeToCategorize++){
      if ( navNodes[nodeToCategorize].category == "MainPage" || navNodes[nodeToCategorize].category == "Page" ){
        pages.push(navNodes[nodeToCategorize]);
      } else if ( navNodes[nodeToCategorize].category == "Form" ){
        forms.push(navNodes[nodeToCategorize]);
      } else if ( navNodes[nodeToCategorize].category == "List"){
        lists.push(navNodes[nodeToCategorize]);
      } else if ( navNodes[nodeToCategorize].category == "Script"){
        scripts.push(navNodes[nodeToCategorize]);
      }
  }

  //Iterate over pages
  for ( var pageInProcess = 0; pageInProcess < pages.length; pageInProcess++ ){
    var pageForms = '',
        pageLists = '',
        pageLinks = '',
        content =	'',
        importScripts = 'block append scripts' + '\n';

    for ( var formInProcess = 0; formInProcess < forms.length; formInProcess++ ){
      //parse forms within group
      if( forms[formInProcess].group == pages[pageInProcess].key ){
        pageForms = pageForms + parseForm(forms[formInProcess]) + '\n';
      }
    }

    for ( var listInProcess = 0; listInProcess < lists.length; listInProcess++ ){
      //parse lists within group
      if ( lists[listInProcess].group == pages[pageInProcess].key ){
        pageLists = pageLists + parseList(lists[listInProcess]) + '\n';
        if ( lists[listInProcess].edit ){
          createEditPage(lists[listInProcess]);
        }
        if ( lists[listInProcess].detail ){
          createDetailPage(lists[listInProcess]);
        }
      }
    };

    for( var linkInProcess = 0; linkInProcess < navLinks.length; linkInProcess++ ){
      //parse links within group
      if(navLinks[linkInProcess].from == pages[pageInProcess].key ){
        pageLinks = pageLinks + parseLink(navLinks[linkInProcess], pages) + '\n';
      }
    };

    for ( var scriptInProcess = 0; scriptInProcess < scripts.length; scriptInProcess++ ){
      //parse lists within group
       if ( scripts[scriptInProcess].group == pages[pageInProcess].key ){
        createFile(scripts[scriptInProcess].text, scripts[scriptInProcess].name, '../public/rendered/', "script" );
        importScripts = importScripts + "	script(src='../../src/rendered/"+scripts[scriptInProcess].name+"')" + '\n';
      }
    };  

    content =  pageForms + pageLists + pageLinks;

    //Create jade file
    var fileHeader = "extends ../layout" + '\n';

    if (scripts.length > 0) {
      fileHeader += importScripts;
    };

    var fileContent =
     "block content" + '\n' +
     "	.container-fluid" + '\n' +
     "			div" + '\n' +
     "#{content}" + '\n' +
     "			footer" + '\n' +
     "				p © SSWMFA - UNLP 2018";

    var fileTemplate = fileHeader + fileContent;
    var myValues = { content: content };
    var jadeCode = $.tmpl(fileTemplate, myValues);
    var fileName = pages[pageInProcess].name;
    fileName = fileName.toLowerCase().split(" ").join("_");
    fileNameToSaveAs = fileName + ".jade"

    //call function to create jade file
    createFile(jadeCode, fileNameToSaveAs,'../views/rendered/', "jade");
  } // end for each page
  $('#PlayButton').prop('disabled', false); //Enable step 3
} // end createPages()

function createEditPage(jsonList){
	var formTemplate =
		"extends ../layout" + '\n' +	
		"block content" + '\n' +
		"	.container-fluid" + '\n' +
		"			div" + '\n';

	var elements = '';

	for( var fieldIndex = 0; fieldIndex < jsonList.fields.length; fieldIndex++ ){ // for item in list
		var fieldType = jsonList.fields[fieldIndex].type.toLowerCase();
		var inputType = '';

		//----- Update when multiple types are supported -----
		/*switch(true) {
			case fieldType.includes('bool'):
					inputType = 'checkbox';
					break;
			case fieldType.includes("int") || fieldType.includes("float"):
					inputType = 'number';
					break;
			case fieldType.includes("date"):
					inputType = 'date';
					break;
			case fieldType == "password":
					inputType = 'password';
					break;
			case fieldType == "email":
					inputType = 'email';
					break;
			default:
					inputType = 'text';
		} // end switch
		if (inputType == 'checkbox'){*/ 
		inputType = 'text';
		if (false){
		//----- Update when multiple types are supported -----

			var inputTemplate = 
			"					.form-check" + '\n' +
			"						label.form-check-label" + '\n' +
			"						input.form-check-input(id='#{fieldName}', name='#{fieldName}', type='#{inputType}', value=record.#{fieldName})" + '\n' +
			"						| #{name}" + '\n';
		} else {
      var inputTemplate = "					.form-group" + '\n';
      if ( !jsonList.fields[fieldIndex].nullable ){  //if not nullable then add * and set input as required
        inputTemplate += 
          "						label #{name} *" + '\n' +
          "						input.form-control(id='#{fieldName}', name='#{fieldName}', type='#{inputType}', value=record.#{fieldName}, required='')" + '\n';
      }
      else { 
        inputTemplate += 
          "						label #{name}" + '\n' +
          "						input.form-control(id='#{fieldName}', name='#{fieldName}', type='#{inputType}', value=record.#{fieldName})" + '\n';
      }
		}
    var inputValues = { name: jsonList.fields[fieldIndex].name , fieldName: jsonList.fields[fieldIndex].name.split(" ").join("_") ,inputType: inputType };
    var input = $.tmpl(inputTemplate, inputValues);
    elements += input;


	}// end for item in list

	formTemplate += 
		"				h3 Update record in #{name}" + '\n' +
		'				form(id="formUpdate#{formClass}", action="/render/updateOneIn#{formClass}", method="POST")' + '\n' +
		"					.form-group" + '\n' +
		"						input.form-control(id='id', name='id', type='hidden', value=record.id)" + '\n' +
							"#{elements}" + '\n' +
		"					br" + '\n' +
		"					button.btn.btn-primary(type='submit') Update" + '\n' +
    "			p" + '\n' +
    "				a(href='/render/') Home"+ '\n';		
		"			footer" + '\n' +
		"				p © SSWMFA - UNLP 2018" + '\n';

  var formValues = { name: jsonList.name, elements: elements, formClass: jsonList.class.split(" ").join("_") };
  var formCode = $.tmpl(formTemplate, formValues);
	var fileName = "formUpdateOneIn"+jsonList.class.split(" ").join("_");
	var fileNameToSaveAs = fileName + ".jade";
	//call function to create jade file
	createFile(formCode, fileNameToSaveAs,'../views/rendered/', "jade");
}// end createEditPage()

function createDetailPage(jsonList){
	var elements = '';

	for( var fieldIndex = 0; fieldIndex < jsonList.fields.length; fieldIndex++ ){ // for item in list
		var inputTemplate = 
		"				p #{name}: record.#{fieldName}" + '\n';

    var inputValues = { name: jsonList.fields[fieldIndex].name , fieldName: jsonList.fields[fieldIndex].name.split(" ").join("_")  };
    var input = $.tmpl(inputTemplate, inputValues);
    elements += input;
	}// end for item in list

	var fileTemplate =
		"extends ../layout" + '\n' +
		"block content" + '\n' +
		"	.container-fluid" + '\n' +
		"			div" + '\n' +
		"				h3 Detail" + '\n' +
		"#{elements}" + '\n' +
    "			p" + '\n' +
    "				a(href='/render/') Home"+ '\n';
		"			footer" + '\n' +
		"				p © SSWMFA - UNLP 2018";

	var myValues = { elements: elements };
	var jadeCode = $.tmpl(fileTemplate, myValues);
	var fileName = "detailFrom"+jsonList.class.split(" ").join("_");
	var fileNameToSaveAs = fileName + ".jade";

	//call function to create jade file
	createFile(jadeCode, fileNameToSaveAs,'../views/rendered/', "jade");
} //end createDetailPage() 