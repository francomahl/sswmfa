//Parser for Forms - from JSON to HTML
function parseForm(jsonForm){
  var elements = '';

  for( var form = 0; form < jsonForm.fields.length; form++ ){
    var fieldType = jsonForm.fields[form].type.toLowerCase();
    var inputType = '';

    if ( jsonForm.fields[form].display == true ){
      switch(true) {
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
      if (inputType == 'checkbox'){
         var inputTemplate = "          .form-check" + '\n' +
                             "            label.form-check-label" + '\n' +
                             "              input.form-check-input(type='#{inputType}')" + '\n' +
                             "              |  #{name}" + '\n';
      } else {
        var inputTemplate = "          .form-group" + '\n' +
                            "            label  #{name}" + '\n' +
                            "            input.form-control(type='#{inputType}')" + '\n';
      }
      var inputValues = { name: jsonForm.fields[form].name , inputType: inputType };
      var input = $.tmpl(inputTemplate, inputValues);
      elements = elements + input;
    }// end if display true
  }// end for

  var formTemplate = "        h3  #{name}" + '\n' +
                     '        form(action="#")' + '\n' +
                     '#{elements}' + '\n' +
                     "          br" + '\n' +
                     "          button.btn.btn-primary(type='submit') Submit" + '\n';
  var formValues = { name: jsonForm.name, elements: elements };
  var formCode = $.tmpl(formTemplate, formValues);

  return formCode;
}

//Parser for Lists - from JSON to HTML
function parseList(jsonList){
  var headers = '';

  for( var list = 0; list < jsonList.fields.length; list++ ){
    if ( jsonList.fields[list].display == true ){
      var headerTemplate = '              th  #{name}' + '\n';
      var headerValues = { name: jsonList.fields[list].name };
      var header = $.tmpl(headerTemplate, headerValues);
      headers = headers + header;
    }// end if display true
  }// end for

  var listTemplate = "        h3  #{name}" + '\n' +
                     "        table" + '\n' +
                     '          thead' + '\n' +
                     '            tr' + '\n' +
                     '#{headers}'+ '\n' + 
                     '          tbody' + '\n';
  var listValues = { name: jsonList.name, headers: headers };
  var listCode = $.tmpl(listTemplate, listValues);

  return listCode;
}

//Parser for Links - from JSON to HTML
function parseLink(jsonLink, pages){
  var linkToPage = 'home';
  var url = 'http://localhost:3000/render';

  for( var link = 0; link < pages.length; link++ ){
    if( jsonLink.to == pages[link].key ){
      if(pages[link].category == "MainPage"){
        url = 'http://localhost:3000/render/';
      }else{
        linkToPage = pages[link].name;
        linkToPage = linkToPage.toLowerCase().split(" ").join("_");
        url = 'http://localhost:3000/render/'+ linkToPage;
      }
      break;
    }
  };

  var linkToText = jsonLink.details;
  if ( linkToText == null || linkToText == '' ){ linkToText = linkToPage }

  var linkTemplate = 
    "      p" + '\n' +
    "        a(href='#{url}')  #{name}"+ '\n';

  var linkValues = { url: url, name: linkToText };
  var linkCode = $.tmpl(linkTemplate, linkValues);

  return linkCode;
}