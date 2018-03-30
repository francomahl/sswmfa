function play(){
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
        content =  '',
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
        createFile(scripts[scriptInProcess].text, scripts[scriptInProcess].name, '../views/rendered/', "script" );
        importScripts = importScripts + "script(src='/"+scripts[scriptInProcess].name+"')" + '\n';
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
      "  .container-fluid" + '\n' +
      "      div" + '\n' +
      "#{content}" + '\n' +
      "      footer" + '\n' +
      "        p © SSWMFA - UNLP 2018";

    var fileTemplate = fileHeader + fileContent;
    var myValues = { content: content };
    var htmlCode = $.tmpl(fileTemplate, myValues);
    var fileName = pages[pageInProcess].name;
    fileName = fileName.toLowerCase().split(" ").join("_");
    fileNameToSaveAs = fileName + ".jade"

    //call function to create jade file
    createFile(htmlCode, fileNameToSaveAs,'../views/rendered/', "jade");
  } // end for each page

  //open tab index
  window.open(
    'http://localhost:3000/render',
    '_blank'
  );
} // end play()
