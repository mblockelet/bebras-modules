var conceptViewerStrings = {
  fr: {
    viewerTitle: "Aide",
    selectLanguage: "Sélectionnez un langage…",
    selectTopic: "Sélectionnez une rubrique…",
    concepts: {
      "taskplatform": 'Résolution des exercices',
      "language": "Création d'un programme",
      "blockly_text_print": 'Afficher du texte',
      "blockly_text_print_noend": 'Afficher consécutivement du texte',
      "blockly_controls_repeat": 'Boucles de répétition',
      "blockly_controls_if": 'Conditions si',
      "blockly_controls_if_else": 'Conditions si/sinon',
      "blockly_controls_whileUntil": 'Boucles tant que ou jusqu\'à',
      "blockly_controls_infiniteloop": 'Boucle infinie',
      "blockly_logic_operation": 'Opérateurs logiques',
      "extra_nested_repeat": 'Boucles imbriquées',
      "extra_variable": 'Variables',
      "extra_list": 'Listes',
      "extra_function": 'Fonctions',
      "robot_commands": 'Commandes du robot',
      "arguments": 'Fonctions avec arguments',
    }
  },
  en: {
    viewerTitle: "Help",
    selectLanguage: "Select a language…",
    selectTopic: "Select a topic…",
    concepts: {
      "taskplatform": 'Solving exercises',
      "language": "Program creation",
      "blockly_text_print": 'Afficher du texte',
      "blockly_text_print_noend": 'Afficher consécutivement du texte',
      "blockly_controls_repeat": 'loops: repeat',
      "blockly_controls_if": 'if conditions',
      "blockly_controls_if_else": 'if/else conditions',
      "blockly_controls_whileUntil": 'loops: while/until',
      "blockly_controls_infiniteloop": 'infinite loop',
      "blockly_logic_operation": 'logic operators',
      "extra_nested_repeat": 'Nested loops',
      "extra_variable": 'Variables',
      "extra_list": 'Lists',
      "extra_function": 'Functions',
      "robot_commands": 'Robot commands',
      "arguments": 'Functions with arguments',
    }
  },
  es: {
    viewerTitle: "Ayuda",
    selectLanguage: "Seleccione un lenguaje…",
    selectTopic: "Seleccione un tema…",
    concepts: {
      "taskplatform": 'Resolución de ejercicios',
      "language": "Creación de un programa",
      "blockly_text_print": 'Impresión de texto',
      "blockly_text_print_noend": 'Impresión consecutiva de texto',
      "blockly_controls_repeat": 'Bucles de repetición',
      "blockly_controls_if": 'Condiciones si',
      "blockly_controls_if_else": 'Condiciones si/sino',
      "blockly_controls_whileUntil": 'Bucles mientras y hasta que',
      "blockly_controls_infiniteloop": 'infinite loop',
      "blockly_logic_operation": 'Operadores lógicos',
      "extra_nested_repeat": 'Bucles anidados',
      "extra_variable": 'Variables',
      "extra_list": 'Listas',
      "extra_function": 'Funciones',
      "robot_commands": 'Comandos del robot',
      "arguments": 'Funciones con argumentos',
    }
  }
};

window.stringsLanguage = window.stringsLanguage || "fr";

var conceptViewer = {
  concepts: {},
  loaded: false,
  shownConcept: null,
  selectedLanguage: null,
  allLangs: [
    {id: 'blockly', lbl: 'Blockly'},
    {id: 'scratch', lbl: 'Scratch'},
    {id: 'python', lbl: 'Python'}
    ],

  load: function () {
    // Load the conceptViewer into the DOM
    if(this.loaded) { return; }

    this.strings = conceptViewerStrings[window.stringsLanguage] || conceptViewerStrings.fr;

    // TODO :: allow changing list of languages
    var navLanguage = '\
      <label for="showNavigationLanguage" id="showNavigationLanguageLabel" class="showNavigationLanguage">' + this.strings.selectLanguage + '</label>\
      <input type="checkbox" id="showNavigationLanguage" role="button">\
      <ul>';
    var curLangLbl = null;
    for(var i=0; i<this.allLangs.length; i++) {
      navLanguage += '<li data-id="'+ this.allLangs[i].id + '"';
      if((!this.selectedLanguage && i == 0) || this.allLangs[i].id == this.selectedLanguage) {
        navLanguage +=  ' class="selected"';
        curLangLbl = this.allLangs[i].lbl;
      }
      navLanguage += '><span>' + this.allLangs[i].lbl + '</span>';
      navLanguage += '</li>';
    }
    navLanguage += '</ul>';

    $('body').append(''
      + '<div id="conceptViewer" style="display: none;">'
      + '  <div class="content">'
      + '   <div class="panel-heading">'
      + '     <h2 class="sectionTitle"><span class="icon fas fa-list-ul"></span>' + this.strings.viewerTitle + '</h2>'
      + '     <div class="exit" onclick="conceptViewer.hide();"><span class="icon fas fa-times"></span></div>'
      + '   </div>'
      + '   <div class="panel-body">'
      + '     <div class="navigation">'
      + '      <div class="navigationLanguage">'
      + navLanguage
      + '      </div>'
      + '      <div class="navigationContent"></div>'
      + '    </div>'
      + '    <div class="viewer">'
      + '      <iframe class="viewerContent" name="viewerContent"></iframe>'
      + '    </div>'
      + '   </div>'
      + '  </div>'
      + '</div>');

    if(curLangLbl) {
       $('#showNavigationLanguageLabel').text(curLangLbl);
    }

    var that = this;
    $('#conceptViewer').on('click', function (event) {
      if (!$(event.target).closest('#conceptViewer .content').length) {
        that.hide();
      }
    });
    this.loaded = true;

    $('#conceptViewer .navigationLanguage ul li').click(function(){
      conceptViewer.selectedLanguage = $(this).data('id');
      $('#conceptViewer .navigationLanguage ul li').removeClass('selected');
      $(this).addClass('selected');
      conceptViewer.languageChanged();
    });
    this.loadNavigation();
  },

  loadNavigation: function () {

    var navContent = "\
      <label for='showNavigationContent' class='showNavigationContent'>" + this.strings.selectTopic + "</label>\
      <input type='checkbox' id='showNavigationContent' role='button'>\
      <ul>";
    var defaultUrl = null;
    for (var i=0; i<this.concepts.length; i++) {
      var curConcept = this.concepts[i];
      if(curConcept.isDefault) {
        defaultUrl = curConcept.url;
      }
      navContent += '<li data-id="'+curConcept.id+'" onclick="conceptViewer.showConcept(\''+curConcept.id+'\');">'
                  + curConcept.name
                  + '  </li>';
    }
    navContent += "</ul>";
    $('#conceptViewer .navigationContent').html(navContent);

    // Try first to show again the concept we were viewing
    if(this.shownConcept && this.showConcept(this.shownConcept, false)) {
      return;
    } else if (defaultUrl) {
      // else show the default concept
      this.loadUrl(defaultUrl);
    } else {
      // else show nothing
      this.loadUrl('');
      this.shownConcept = null;
    }
  },

  loadConcepts: function (newConcepts) {
    // Load new concept information
    this.concepts = newConcepts;
    if(this.loaded) {
      this.loadNavigation();
    }
  },

  selectLanguage: function(lang) {
    this.selectedLanguage = lang;
  },

  show: function (initConcept) {
    // Display the conceptViewer
    this.load();
    $('#conceptViewer').fadeIn(500);

    if (this.shownConcept && (initConcept || typeof initConcept == 'undefined')) {
      this.showConcept(this.shownConcept);
    }
  },

  hide: function () {
    // Hide the conceptViewer
    this.load();
    $('#conceptViewer').fadeOut(500);
    this.loadUrl('');
  },

  showConcept: function (concept, show) {
    // Show a specific concept
    // Either a concept object can be given, either a concept ID can be given
    // directly
    var conceptUrl = null;
    var conceptId = null;
    if (concept.url) {
      conceptUrl = concept.url;
      conceptId = concept.id;
    } else {
      conceptId = concept.id ? concept.id : concept;
      for (var i=0; i<this.concepts.length; i++) {
        if(this.concepts[i].id == conceptId) {
          conceptUrl = this.concepts[i].url;
        }
      }
    }
    if (conceptUrl) {
      this.shownConcept = conceptId;
      if(show || typeof show == 'undefined') { this.show(false); }

      var language = conceptViewer.selectedLanguage;
      var urlSplit = conceptUrl.split('#');
      if(urlSplit[1]) {
        urlSplit[urlSplit.length-1] = language+'-'+urlSplit[urlSplit.length-1];
      } else {
        urlSplit[1] = language;
      }
      conceptUrl = urlSplit.join('#');

      this.loadUrl(conceptUrl);
      $('#conceptViewer .navigationContent ul li').removeClass('selected');
      $('#conceptViewer .navigationContent ul li[data-id='+conceptId+']').addClass('selected');
      $('#showNavigationContent').prop('checked', false);
      return true;
    } else {
      return false;
    }
  },

  loadUrl: function (url) {
    // Load an URL into the iframe
    if(window.conceptViewerUrlFunction) {
      url = window.conceptViewerUrlFunction(url);
    }
    $('#conceptViewer .viewerContent').attr('src', url);
  },

  hasConcept: function (conceptName) {
    // Check if a specific concept exists in the list of concepts
    for (var i=0; i<this.concepts.length; i++) {
      if(this.concepts[i].id == conceptName) {
        return true;
      }
    }
    return false;
  },

  hasPythonConcept: function (pythonCode) {
    for (var i=0; i<this.concepts.length; i++) {
      var pythonList = this.concepts[i].python;
      if(pythonList && pythonList.indexOf(pythonCode) > -1) {
        return this.concepts[i].id;
      }
    }
    return false;
  },

  languageChanged: function () {
    $('#showNavigationLanguage').prop('checked', false);
    for(var i=0; i<this.allLangs.length; i++) {
      if(this.allLangs[i].id == conceptViewer.selectedLanguage) {
        $('#showNavigationLanguageLabel').text(this.allLangs[i].lbl);
        break;
      }
    }
    this.loadNavigation();
  },

  unload: function() {
    $('#conceptViewer').remove();
    this.loaded = false;
  }
}


function getConceptViewerBaseUrl() {
    // Specific configuration to go through the domain itself if there's a 'p=1'
    // argument or we are on concours2.castor-informatique.fr
    var baseUrl = '';
    baseUrl += (window.location.protocol == 'https:' ? 'https:' : 'http:') + '//';
    baseUrl += ((window.location.search.indexOf('p=1') > -1
        || window.location.hostname == 'concours2.castor-informatique.fr')
       ? window.location.host : 'static4.castor-informatique.fr');
    baseUrl += '/help/';
    baseUrl += window.stringsLanguage == 'es' ? 'index_es.html' : 'index.html';
    return baseUrl;
}


function getConceptViewerBaseConcepts() {
    // Get base concepts in the default help
    var baseUrl = getConceptViewerBaseUrl();
    var baseConcepts = [
        {id: 'taskplatform', name: 'Résolution des exercices', url: baseUrl+'#taskplatform', language: 'all'},
        {id: 'language', name: "Création d'un programme", url: baseUrl+'#language'},
        {id: 'blockly_text_print', name: 'Afficher du texte', url: baseUrl+'#blockly_text_print'},
        {id: 'blockly_text_print_noend', name: 'Afficher consécutivement du texte', url: baseUrl+'#blockly_text_print_noend'},
        {id: 'blockly_controls_repeat', name: 'Boucles de répétition', url: baseUrl+'#blockly_controls_repeat'},
        {id: 'blockly_controls_if', name: 'Conditions si', url: baseUrl+'#blockly_controls_if'},
        {id: 'blockly_controls_if_else', name: 'Conditions si/sinon', url: baseUrl+'#blockly_controls_if_else'},
        {id: 'blockly_controls_whileUntil', name: 'Boucles tant que ou jusqu\'à', url: baseUrl+'#blockly_controls_whileUntil'},
        {id: 'blockly_controls_infiniteloop', name: 'Boucle infinie', url: baseUrl+'#blockly_controls_infiniteloop'},
        {id: 'blockly_logic_operation', name: 'Opérateurs logiques', url: baseUrl+'#blockly_logic_operation'},
        {id: 'extra_nested_repeat', name: 'Boucles imbriquées', url: baseUrl+'#extra_nested_repeat'},
        {id: 'extra_variable', name: 'Variables', url: baseUrl+'#extra_variable'},
        {id: 'extra_list', name: 'Listes', url: baseUrl+'#extra_list'},
        {id: 'extra_function', name: 'Fonctions', url: baseUrl+'#extra_function'},
        {id: 'robot_commands', name: 'Commandes du robot', url: baseUrl+'#robot_commands'},
        {id: 'arguments', name: 'Fonctions avec arguments', url: baseUrl+'#arguments'}
        ];
    return baseConcepts;
}


function conceptsFill(baseConcepts, allConcepts) {
  var conceptNames = (conceptViewerStrings[window.stringsLanguage] || conceptViewerStrings.fr)[
  "concepts"] || conceptViewerStrings.fr.concepts;
  var concepts = [];
  var baseConceptsById = {};
  for(var b=0; b<baseConcepts.length; b++) {
    var curConcept = baseConcepts[b];
    if(typeof curConcept === 'string') {
      baseConceptsById[curConcept] = {id: curConcept};
    } else {
      baseConceptsById[curConcept.id] = curConcept;
    }
  }
  for(var c=0; c<allConcepts.length; c++) {
    var fullConcept = allConcepts[c];
    if(baseConceptsById[fullConcept.id]) {
      var curConcept = baseConceptsById[fullConcept.id];
      // Translate concept name if available
      curConcept.name = conceptNames[curConcept.id] || fullConcept.name;
      if(!curConcept.url) {
        curConcept.url = fullConcept.url;
      }
      if(!curConcept.order) {
        curConcept.order = fullConcept.order;
      }
      if(!curConcept.python) {
        curConcept.python = fullConcept.python;
      }
      if(!fullConcept.ignore) {
        concepts.push(curConcept);
      }
      delete baseConceptsById[fullConcept.id];
    } else if(fullConcept.isBase && baseConceptsById['base']) {
      concepts.push(fullConcept);
    }
  }

  for(var leftConcept in baseConceptsById) {
    if(leftConcept != 'base') {
      concepts.push(baseConceptsById[leftConcept]);
    }
  }

  concepts.sort(function(a,b) {
    return !a.order || !b.order ? 0 : a.order - b.order;
    });

  return concepts;
}

function getConceptsFromBlocks(includeBlocks, allConcepts, context) {
  if(!includeBlocks) { return []; }

  if(includeBlocks.standardBlocks) {
    var allConceptsById = {};
    for(var c = 0; c<allConcepts.length; c++) {
      allConceptsById[allConcepts[c].id] = allConcepts[c];
    }

    var concepts = ['language'];
    if(includeBlocks.standardBlocks.includeAll) {
      for(var c = 0; c<allConcepts.length; c++) {
        if(allConcepts[c].name.substr(0, 7) == 'blockly_') {
          concepts.push(allConcepts[c]);
        }
      }
    } else if(includeBlocks.standardBlocks.singleBlocks) {
      for(var b = 0; b<includeBlocks.standardBlocks.singleBlocks.length; b++) {
        var blockName = includeBlocks.standardBlocks.singleBlocks[b];
        if(allConceptsById['blockly_'+blockName]) {
          concepts.push(allConceptsById['blockly_'+blockName]);
        }
      }
    }
  }

  if(includeBlocks.generatedBlocks) {
    for(var genName in includeBlocks.generatedBlocks) {
      var categoriesByBlocks = {};
      var includedCategories = [];
      if(context && context.customBlocks && context.customBlocks[genName]) {
        for(var catName in context.customBlocks[genName]) {
          var categoryConceptName = genName + '_' + catName;
          if(!allConceptsById[categoryConceptName]) { continue; }
          var blockList = context.customBlocks[genName][catName];
          for(var i=0; i<blockList.length; i++) {
            categoriesByBlocks[blockList[i].name] = categoryConceptName;
          }
        }
      }
      if(allConceptsById[genName + '_introduction']) {
        concepts.push(allConceptsById[genName + '_introduction']);
      }
      for(var i=0; i<includeBlocks.generatedBlocks[genName].length; i++) {
        var blockName = includeBlocks.generatedBlocks[genName][i];
        if(categoriesByBlocks[blockName] && includedCategories.indexOf(categoriesByBlocks[blockName]) == -1) {
          concepts.push(allConceptsById[categoriesByBlocks[blockName]]);
        }
        var conceptRef = genName + '_' + blockName;
        if(allConceptsById[conceptRef]) {
          concepts.push(allConceptsById[conceptRef]);
        }
      }
    }
  }

  return concepts;
}

function getConceptsFromTask(allConcepts) {
  if(typeof taskSettings === 'undefined') { return; }

  var baseConcepts = ['taskplatform'];

  if(taskSettings.conceptViewer.length) {
    baseConcepts = baseConcepts.concat(taskSettings.conceptViewer);
  }
  if(taskSettings.blocklyOpts && taskSettings.blocklyOpts.includeBlocks) {
    baseConcepts = baseConcepts.concat(getConceptsFromBlocks(taskSettings.blocklyOpts.includeBlocks, allConcepts));
  }

  return conceptsFill(baseConcepts, allConcepts);
}
