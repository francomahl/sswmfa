//Parser for Forms - from JSON to HTML
function parseForm(jsonForm){
	var elements = '';

	for( var fieldIndex = 0; fieldIndex < jsonForm.fields.length; fieldIndex++ ){
		var fieldType = jsonForm.fields[fieldIndex].type.toLowerCase();
		var inputType = '';

		if ( jsonForm.fields[fieldIndex].display || !jsonForm.fields[fieldIndex].nullable ){ // if displayable or unique or not nullabe then shown in form
			switch(true) {
				case fieldType == "integer" || fieldType == "number":
						inputType = 'number';
						break;
				case fieldType == "date":
						inputType = 'date';
						break;
				case fieldType == "password":
						inputType = 'password';
						break;
				case fieldType == "email":
						inputType = 'email';
						break;
				case fieldType == "textarea":
						inputType = 'textarea';
						break;						
				case fieldType == "tel" || fieldType == "phone":
						inputType = 'tel';
						break;						
				default:
						inputType = 'text';
			} // end switch
			var inputTemplate = "			.form-group" + '\n';
			if ( !jsonForm.fields[fieldIndex].nullable ){ //if not nullable then add * and set input as required
				inputTemplate += "				label #{name} *" + '\n';
				if (inputType=='textarea'){
					inputTemplate += "				textarea.form-control(id='#{fieldName}', name='#{fieldName}', required='')"+ '\n';
				}	else {
					inputTemplate += "				input.form-control(id='#{fieldName}', name='#{fieldName}',type='#{inputType}', required='')" + '\n';
				}
			}	else { 
				inputTemplate += 
					"				label #{name}" + '\n';
				if (inputType=='textarea'){
					inputTemplate += "				textarea.form-control(id='#{fieldName}', name='#{fieldName}')"+ '\n';
				} else {
					inputTemplate += "				input.form-control(id='#{fieldName}', name='#{fieldName}',type='#{inputType}')" + '\n';
				}
			}
			var inputValues = { name: jsonForm.fields[fieldIndex].name , fieldName: jsonForm.fields[fieldIndex].name.split(" ").join("_") ,inputType: inputType };
			var input = $.tmpl(inputTemplate, inputValues);
			elements += input;
		}// end if display true
	}// end for

	var formTemplate = "		h3 #{name}" + '\n' +
										 '		form(id="form#{formClass}", action="/render/insertOneIn#{formClass}", method="POST")' + '\n' +
										 '#{elements}' + '\n' +
										 "			.form-group" + '\n' +
										 "				button.btn.btn-primary(type='submit') Submit" + '\n' +
										 "				button.btn.btn-primary.margin-btn(type='reset') Reset" + '\n';
	var formValues = { name: jsonForm.name, elements: elements, formClass: jsonForm.class.split(" ").join("_") };
	var formCode = $.tmpl(formTemplate, formValues);

	return formCode;
}

//Parser for Lists - from JSON to HTML
function parseList(jsonList){
	var headers = '';
	var details = '';

	for( var listItem = 0; listItem < jsonList.fields.length; listItem++ ){
		if ( jsonList.fields[listItem].display == true ){
			//table headers
			var headerTemplate = "					th(scope='col') #{name}" + '\n';
			var headerValues = { name: jsonList.fields[listItem].name };
			var header = $.tmpl(headerTemplate, headerValues);
			headers += header;
			//table details
			var detailTemplate = "							td=item.#{name}" + '\n';
			var detailValues = { name: jsonList.fields[listItem].name.split(" ").join("_") }
			var detail = $.tmpl(detailTemplate, detailValues);
			details += detail;
		}// end if display true
	}// end for

	var listTemplate =	"		h3 #{name}" + '\n' +
											"		table.table" + '\n' +
											'			thead.thead-dark' + '\n' +
											'				tr' + '\n' +
											'#{headers}'+ '\n' + 
											'			tbody' + '\n'+
											'				if(recordsFrom#{formClass})' + '\n'+
											'					each item in recordsFrom#{formClass}' + '\n'+
											'						tr' + '\n'+
											'#{details}' + '\n';
	if (jsonList.delete){
		listTemplate +=
		'							td ' + '\n'+
		"								a.btn.btn-danger(href='/render/deleteOneFrom#{formClass}/'+item.id, role='button') Delete" + '\n';
	}
	if (jsonList.edit){
		listTemplate +=
		"							td" + '\n'+
		"								a.btn.btn-primary(href='/render/updateOneIn#{formClass}/'+item.id, role='button') Edit" + '\n';
	}
		if (jsonList.detail){
			listTemplate +=
			"							td" + '\n'+
			"								a.btn.btn-secondary(href='/render/detailOfOneFrom#{formClass}/'+item.id, role='button') Detail" + '\n';
	}										
	var listValues = { name: jsonList.name, headers: headers, details: details, formClass: jsonList.class.split(" ").join("_") };
	var listCode = $.tmpl(listTemplate, listValues);

	return listCode;
}

//Parser for Links - from JSON to HTML
function parseLink(jsonLink, pages){
	var linkToPage = 'home';
	var url = '/render/';

	for( var link = 0; link < pages.length; link++ ){
		if( jsonLink.to == pages[link].key ){
			if(pages[link].category == "MainPage"){
				url = '/render/';
			}else{
				linkToPage = pages[link].name;
				linkToPage = linkToPage.toLowerCase().split(" ").join("_");
				url = '/render/'+ linkToPage;
			}
			break;
		}
	};

	var linkToText = jsonLink.details;
	if ( linkToText == null || linkToText == '' ){ linkToText = linkToPage }

	var linkTemplate = 
		"			a.nav-link(href='#{url}') #{name}";

	var linkValues = { url: url, name: linkToText };
	var linkCode = $.tmpl(linkTemplate, linkValues);

	return linkCode;
}