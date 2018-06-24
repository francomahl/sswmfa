//Parser for Forms - from JSON to HTML
function parseForm(jsonForm){
	let elements = '';

  jsonForm.fields.forEach(function (field, index){
		const fieldType = field.type.toLowerCase();
		let inputType = '';

		if ( field.display || !field.nullable ){ // if displayable or unique or not nullabe then shown in form
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
				inputTemplate += "				label #{name} *" + '\n';
				if (inputType === 'textarea'){
					inputTemplate += "				textarea.form-control(id='#{fieldName}', name='#{fieldName}', required='')"+ '\n';
				}	else {
					inputTemplate += "				input.form-control(id='#{fieldName}', name='#{fieldName}',type='#{inputType}', required='')" + '\n';
				}
			}	else { 
				inputTemplate += 
					"				label #{name}" + '\n';
				if (inputType === 'textarea'){
					inputTemplate += "				textarea.form-control(id='#{fieldName}', name='#{fieldName}')"+ '\n';
				} else {
					inputTemplate += "				input.form-control(id='#{fieldName}', name='#{fieldName}',type='#{inputType}')" + '\n';
				}
			}
			const inputValues = { name: field.name , fieldName: field.name.split(" ").join("_") ,inputType: inputType };
			const input = $.tmpl(inputTemplate, inputValues);
			elements += input;
		}// end if display true
	});// end for each form fields

	const formTemplate = "		h3 #{name}" + '\n' +
										 '		form(id="form#{formClass}", action="/render/insertOneIn#{formClass}", method="POST")' + '\n' +
										 '#{elements}' + '\n' +
										 "			.form-group" + '\n' +
										 "				button.btn.btn-primary(type='submit') Submit" + '\n' +
										 "				button.btn.btn-primary.margin-btn(type='reset') Reset" + '\n';
	const formValues = { name: jsonForm.name, elements: elements, formClass: jsonForm.class.split(" ").join("_") };
	const formCode = $.tmpl(formTemplate, formValues);

	return formCode;
}

//Parser for Lists - from JSON to HTML
function parseList(jsonList){
	let headers = "					th(scope='col') id" + '\n';
	let details =  "							td=item.id" + '\n';

  jsonList.fields.forEach(function (field, index){
		if (field.display){
			//table headers
			const header = `					th(scope='col') ${field.name}` + '\n';
			headers += header;
			//table details
			const detailTemplate = "							td=item.#{name}" + '\n';
			const detailValues = { name: field.name.split(" ").join("_") }
			const detail = $.tmpl(detailTemplate, detailValues);
			details += detail;
		}// end if display true
	});// end for each field

	let listTemplate =	"		h3 #{name}" + '\n' +
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
	const listValues = { name: jsonList.name, headers: headers, details: details, formClass: jsonList.class.split(" ").join("_") };
	const listCode = $.tmpl(listTemplate, listValues);

	return listCode;
}

//Parser for Links - from JSON to HTML
function parseLink(jsonLink, pages){
	let linkToPage = 'home';
	let url = '/render/';

  pages.forEach(function (page, index){
		if( jsonLink.to === page.key ){
			if(page.category === "MainPage"){
				url = '/render/';
			}else{
				linkToPage = page.name;
				linkToPage = linkToPage.toLowerCase().split(" ").join("_");
				url = '/render/'+ linkToPage;
			}
		}
	});// end for each page

	let linkToText = jsonLink.details;
	if ( linkToText == null || linkToText == '' ){ linkToText = linkToPage }

	const linkTemplate = 
		"			a.nav-link(href='#{url}') #{name}";

  const linkValues = { url: url, name: linkToText };
  const linkCode = $.tmpl(linkTemplate, linkValues);

	return linkCode;
}