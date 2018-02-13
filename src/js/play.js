function play(){

  //using JQuery's extend function to copy array value and not the reference
  var navNodes = $.extend(true, [], navDiagram.model.nodeDataArray),
      navLinks = $.extend(true, [], navDiagram.model.linkDataArray),
      pages = [],
      forms = [],
      lists = [];

  //Divide by category
  for ( var i = 0; i < navNodes.length; i++){

      if ( navNodes[i].category == "MainPage" || navNodes[i].category == "Page" ){
        pages.push(navNodes[i]);
      } else if ( navNodes[i].category == "Form" ){
        forms.push(navNodes[i]);
      } else if ( navNodes[i].category == "List"){
        lists.push(navNodes[i]);
      }
  }

  for ( var p = 0; p < pages.length; p++ ){

    var pageForms = '',
        pageLists = '',
        pageLinks = '',
        content =  '';

    for ( var f = 0; f < forms.length; f++ ){
      //parse forms within group
      if( forms[f].group == pages[p].key ){
        pageForms = pageForms + parseForm(forms[f]);
      }
    }

    for ( var l = 0; l < lists.length; l++ ){
      //parse lists within group
       if ( lists[l].group == pages[p].key ){
        pageLists = pageLists + parseList(lists[l]);
      }
    };

    for( var k = 0; k < navLinks.length; k++ ){
      //parse forms within group
      if(navLinks[k].from == pages[p].key ){
        pageLinks = pageLinks + parseLink(navLinks[k], pages);
      }
    };

    content =  pageForms + pageLists + pageLinks;

    var myTemplate = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title> #{name} </title> </head> <body> #{content} </body> </html>';
    var myValues = { name: pages[p].name, content: content };
    var htmlCode = $.tmpl(myTemplate, myValues);

    var blob = new Blob([htmlCode], {type: "text/plain;charset=utf-8"});
    var textToSaveAsURL = window.URL.createObjectURL(blob);
    var fileNameToSaveAs = pages[p].name + ".html";
    fileNameToSaveAs = fileNameToSaveAs.replace(' ', '_');
    fileNameToSaveAs = fileNameToSaveAs.toLowerCase();

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
  }
}

function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}