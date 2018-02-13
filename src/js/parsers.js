//Parser for Forms - from JSON to HTML
function parseForm(jsonForm){
  var elements = '';

  for( var fd = 0; fd < jsonForm.fields.length; fd++ ){
    var fieldType = jsonForm.fields[fd].type.toLowerCase();
    var inputType = '';

    if ( jsonForm.fields[fd].display == true ){
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
      var inputTemplate = '<p> <label> #{name} </label> : <input type="#{inputType}"> </p>';
      var inputValues = { name: jsonForm.fields[fd].name , inputType: inputType };
      var input = $.tmpl(inputTemplate, inputValues);
      elements = elements + input;
    }// end if display true
  }// end for

  var formTemplate = '<div> <h3> #{name} </h3> <form action="#"> #{elements} </br> <input type="submit" value="Submit"> </form> </div>';
  var formValues = { name: jsonForm.name, elements: elements };
  var formCode = $.tmpl(formTemplate, formValues);

  return formCode;
}

//Parser for Lists - from JSON to HTML
function parseList(jsonList){
  var headers = '';

  for( var lf = 0; lf < jsonList.fields.length; lf++ ){
    if ( jsonList.fields[lf].display == true ){
      var headerTemplate = '<th> #{name} </th>';
      var headerValues = { name: jsonList.fields[lf].name };
      var header = $.tmpl(headerTemplate, headerValues);
      headers = headers + header;
    }// end if display true
  }// end for

  var listTemplate = '<div> <h3> #{name} </h3> <table> <tr> #{headers} </tr> </table> </div>';
  var listValues = { name: jsonList.name, headers: headers };
  var listCode = $.tmpl(listTemplate, listValues);

  return listCode;
}

//Parser for Links - from JSON to HTML
function parseLink(jsonLink, pages){
  var linkToPage = 'not_found';
  var url = 'http://localhost:8000/src/view/not_found.html';

  for( var lp = 0; lp < pages.length; lp++ ){
    if( jsonLink.to == pages[lp].key ){
      linkToPage = pages[lp].name;
      linkToPage = linkToPage.replace(' ', '_');
      linkToPage = linkToPage.toLowerCase();
      url = 'http://localhost:8000/src/view/'+ linkToPage + '.html';
      break;
    }
  };

  var linkToText = jsonLink.details;
  if ( linkToText == '' ){ linkToText = linkToPage }

  var linkTemplate = '<p> <a href="#{url}"> #{name} </a></p> ';
  var linkValues = { url: url, name: linkToText };
  var linkCode = $.tmpl(linkTemplate, linkValues);

  return linkCode;
}